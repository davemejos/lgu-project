/**
 * Cloudinary Sync Fix API
 * 
 * Emergency endpoint to diagnose and fix bidirectional sync issues.
 * Provides immediate cleanup processing and diagnostic information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'
import { getCleanupScheduler } from '@/lib/cloudinaryCleanupScheduler'

// Server-side Cloudinary import
let cloudinary: typeof import('cloudinary').v2 | null = null

// Initialize Cloudinary on server-side
async function initCloudinary() {
  if (typeof window === 'undefined' && !cloudinary) {
    const cloudinaryModule = await import('cloudinary')
    cloudinary = cloudinaryModule.v2

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    })
  }
  return cloudinary
}

/**
 * GET /api/cloudinary/sync-fix
 * Comprehensive sync status diagnostic
 */
export async function GET() {
  try {
    console.log('[Sync Fix API] Running comprehensive diagnostic...')

    // Check scheduler status
    const scheduler = getCleanupScheduler()
    const schedulerStats = scheduler.getStats()
    const schedulerConfig = scheduler.getConfig()

    // Check queue status
    const { data: queueStats, error: queueError } = await SupabaseMediaService.getClient()
      .from('cloudinary_cleanup_queue')
      .select('status')

    if (queueError) {
      throw new Error(`Queue check failed: ${queueError.message}`)
    }

    // Count by status
    const statusCounts = queueStats?.reduce((acc: Record<string, number>, item: { status: string }) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Check for soft-deleted assets not in queue
    const { data: orphanedAssets, error: orphanError } = await SupabaseMediaService.getClient()
      .from('media_assets')
      .select('cloudinary_public_id, deleted_at')
      .not('deleted_at', 'is', null)

    if (orphanError) {
      throw new Error(`Orphaned assets check failed: ${orphanError.message}`)
    }

    // Check which soft-deleted assets are missing from cleanup queue
    const orphanedPublicIds = orphanedAssets?.map(asset => asset.cloudinary_public_id) || []
    let missingFromQueue = 0

    if (orphanedPublicIds.length > 0) {
      const { data: queuedAssets, error: queuedError } = await SupabaseMediaService.getClient()
        .from('cloudinary_cleanup_queue')
        .select('cloudinary_public_id')
        .in('cloudinary_public_id', orphanedPublicIds)

      if (!queuedError) {
        const queuedPublicIds = queuedAssets?.map(item => item.cloudinary_public_id) || []
        missingFromQueue = orphanedPublicIds.filter(id => !queuedPublicIds.includes(id)).length
      }
    }

    // Get recent queue items
    const { data: recentItems } = await SupabaseMediaService.getClient()
      .from('cloudinary_cleanup_queue')
      .select('*')
      .order('queued_at', { ascending: false })
      .limit(5)

    const diagnostic = {
      scheduler: {
        running: schedulerStats.is_running,
        config: schedulerConfig,
        stats: schedulerStats
      },
      queue: {
        total_items: queueStats?.length || 0,
        status_breakdown: statusCounts,
        recent_items: recentItems || []
      },
      sync_issues: {
        soft_deleted_assets: orphanedAssets?.length || 0,
        missing_from_queue: missingFromQueue,
        needs_manual_fix: missingFromQueue > 0
      },
      recommendations: [] as string[]
    }

    // Add recommendations
    if (!schedulerStats.is_running) {
      diagnostic.recommendations.push('Start the cleanup scheduler')
    }
    if (missingFromQueue > 0) {
      diagnostic.recommendations.push(`Queue ${missingFromQueue} orphaned assets for cleanup`)
    }
    if ((statusCounts.pending || 0) > 0) {
      diagnostic.recommendations.push('Process pending cleanup items')
    }
    if ((statusCounts.failed || 0) > 0) {
      diagnostic.recommendations.push('Review and retry failed cleanup items')
    }

    return NextResponse.json({
      success: true,
      diagnostic,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Sync Fix API] Diagnostic failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cloudinary/sync-fix
 * Emergency sync fix operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body

    console.log(`[Sync Fix API] Executing action: ${action}`)

    switch (action) {
      case 'start_scheduler':
        const scheduler = getCleanupScheduler()
        const startResult = scheduler.start()
        return NextResponse.json({
          success: startResult,
          message: startResult ? 'Scheduler started' : 'Failed to start scheduler',
          stats: scheduler.getStats()
        })

      case 'queue_orphaned_assets':
        return await queueOrphanedAssets()

      case 'process_queue_immediately':
        return await processQueueImmediately(options.limit || 10)

      case 'force_delete_specific':
        if (!options.public_id) {
          return NextResponse.json({
            success: false,
            error: 'public_id required for force_delete_specific'
          }, { status: 400 })
        }
        return await forceDeleteSpecific(options.public_id)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported: start_scheduler, queue_orphaned_assets, process_queue_immediately, force_delete_specific'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('[Sync Fix API] Operation failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to queue orphaned assets
async function queueOrphanedAssets() {
  // Get soft-deleted assets
  const { data: deletedAssets, error: deletedError } = await SupabaseMediaService.getClient()
    .from('media_assets')
    .select('*')
    .not('deleted_at', 'is', null)

  if (deletedError) {
    throw new Error(`Failed to get deleted assets: ${deletedError.message}`)
  }

  if (!deletedAssets || deletedAssets.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No orphaned assets found',
      queued: 0
    })
  }

  // Queue each asset for cleanup
  let queued = 0
  for (const asset of deletedAssets) {
    try {
      const { error } = await SupabaseMediaService.getClient()
        .rpc('queue_cloudinary_cleanup', {
          public_id: asset.cloudinary_public_id,
          resource_type: asset.resource_type || 'image',
          original_filename: asset.original_filename,
          file_size: asset.file_size,
          folder: asset.folder,
          deletion_reason: 'manual_orphan_fix',
          trigger_source: 'sync_fix_api',
          triggered_by_user: asset.deleted_by
        })

      if (!error) {
        queued++
      }
    } catch (err) {
      console.error(`Failed to queue ${asset.cloudinary_public_id}:`, err)
    }
  }

  return NextResponse.json({
    success: true,
    message: `Queued ${queued} orphaned assets for cleanup`,
    queued,
    total_found: deletedAssets.length
  })
}

// Helper function to process queue immediately
async function processQueueImmediately(limit: number) {
  const response = await fetch('/api/cloudinary/cleanup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ limit, force_retry: false })
  })

  if (!response.ok) {
    throw new Error(`Cleanup processing failed: ${response.statusText}`)
  }

  const result = await response.json()
  return NextResponse.json({
    success: true,
    message: 'Immediate cleanup processing completed',
    ...result
  })
}

// Helper function to force delete specific asset
async function forceDeleteSpecific(publicId: string) {
  const cloudinaryInstance = await initCloudinary()
  if (!cloudinaryInstance) {
    throw new Error('Cloudinary not available')
  }

  try {
    // Delete from Cloudinary
    const deleteResult = await cloudinaryInstance.uploader.destroy(publicId)
    
    // Update queue if exists
    await SupabaseMediaService.getClient()
      .from('cloudinary_cleanup_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        cloudinary_response: deleteResult
      })
      .eq('cloudinary_public_id', publicId)

    return NextResponse.json({
      success: true,
      message: `Force deleted ${publicId}`,
      cloudinary_result: deleteResult
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Force delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
