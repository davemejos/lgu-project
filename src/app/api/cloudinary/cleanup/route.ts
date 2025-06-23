/**
 * Cloudinary Cleanup API Route
 *
 * Processes queued Cloudinary cleanup operations for automatic bidirectional sync.
 * This endpoint handles the automatic deletion of Cloudinary assets when database
 * records are deleted, ensuring 100% complete bidirectional synchronization.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'

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

interface CleanupQueueItem {
  id: string
  cloudinary_public_id: string
  resource_type: string
  original_filename?: string
  file_size?: number
  folder?: string
  deletion_reason: string
  trigger_source: string
  triggered_by?: string
  queued_at: string
  processing_attempts: number
  max_attempts: number
}

/**
 * POST /api/cloudinary/cleanup
 * Process pending Cloudinary cleanup operations
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cloudinary Cleanup API] Starting cleanup processing...')

    const cloudinaryInstance = await initCloudinary()
    if (!cloudinaryInstance) {
      throw new Error('Cloudinary not available for cleanup operations')
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}))
    const {
      limit = 10,
      force_retry = false,
      specific_id = null
    } = body

    // Get pending cleanup items
    let pendingItems: CleanupQueueItem[]
    
    if (specific_id) {
      // Process specific item
      const { data, error } = await SupabaseMediaService.getClient()
        .from('cloudinary_cleanup_queue')
        .select('*')
        .eq('id', specific_id)
        .single()
      
      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: 'Cleanup item not found',
          processed: 0,
          failed: 0
        })
      }
      
      pendingItems = [data as CleanupQueueItem]
    } else {
      // Get pending items using the database function
      const { data, error } = await SupabaseMediaService.getClient()
        .rpc('get_pending_cleanup_items', { limit_count: limit })
      
      if (error) {
        throw new Error(`Failed to get pending cleanup items: ${error.message}`)
      }
      
      pendingItems = (data || []) as CleanupQueueItem[]
    }

    if (pendingItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending cleanup operations',
        processed: 0,
        failed: 0,
        items: []
      })
    }

    console.log(`[Cloudinary Cleanup API] Processing ${pendingItems.length} cleanup items...`)

    const results = {
      processed: 0,
      failed: 0,
      items: [] as Array<{
        id: string
        public_id: string
        status: 'completed' | 'failed' | 'skipped'
        error?: string
        cloudinary_response?: unknown
      }>
    }

    // Process each cleanup item
    for (const item of pendingItems) {
      try {
        console.log(`[Cloudinary Cleanup API] Processing: ${item.cloudinary_public_id}`)

        // Update status to processing
        await SupabaseMediaService.getClient()
          .rpc('update_cleanup_queue_status', {
            queue_id: item.id,
            new_status: 'processing'
          })

        // Check if we should skip due to max attempts (unless force_retry is true)
        if (!force_retry && item.processing_attempts >= item.max_attempts) {
          await SupabaseMediaService.getClient()
            .rpc('update_cleanup_queue_status', {
              queue_id: item.id,
              new_status: 'skipped',
              error_msg: 'Max attempts reached'
            })

          results.items.push({
            id: item.id,
            public_id: item.cloudinary_public_id,
            status: 'skipped',
            error: 'Max attempts reached'
          })
          continue
        }

        // Attempt to delete from Cloudinary
        try {
          const deleteResult = await cloudinaryInstance.uploader.destroy(
            item.cloudinary_public_id,
            { resource_type: item.resource_type }
          )

          console.log(`[Cloudinary Cleanup API] Delete result for ${item.cloudinary_public_id}:`, deleteResult)

          // Check if deletion was successful
          const isSuccess = deleteResult.result === 'ok' || deleteResult.result === 'not found'
          
          if (isSuccess) {
            // Mark as completed
            await SupabaseMediaService.getClient()
              .rpc('update_cleanup_queue_status', {
                queue_id: item.id,
                new_status: 'completed',
                cloudinary_response: deleteResult
              })

            results.processed++
            results.items.push({
              id: item.id,
              public_id: item.cloudinary_public_id,
              status: 'completed',
              cloudinary_response: deleteResult
            })

            console.log(`[Cloudinary Cleanup API] ✅ Successfully deleted: ${item.cloudinary_public_id}`)
          } else {
            throw new Error(`Cloudinary delete failed: ${deleteResult.result}`)
          }

        } catch (cloudinaryError) {
          const errorMessage = cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown Cloudinary error'
          
          // Mark as failed
          await SupabaseMediaService.getClient()
            .rpc('update_cleanup_queue_status', {
              queue_id: item.id,
              new_status: 'failed',
              error_msg: errorMessage
            })

          results.failed++
          results.items.push({
            id: item.id,
            public_id: item.cloudinary_public_id,
            status: 'failed',
            error: errorMessage
          })

          console.error(`[Cloudinary Cleanup API] ❌ Failed to delete ${item.cloudinary_public_id}:`, errorMessage)
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Mark as failed
        await SupabaseMediaService.getClient()
          .rpc('update_cleanup_queue_status', {
            queue_id: item.id,
            new_status: 'failed',
            error_msg: errorMessage
          })

        results.failed++
        results.items.push({
          id: item.id,
          public_id: item.cloudinary_public_id,
          status: 'failed',
          error: errorMessage
        })

        console.error(`[Cloudinary Cleanup API] ❌ Processing failed for ${item.cloudinary_public_id}:`, error)
      }
    }

    const successRate = results.processed / (results.processed + results.failed) * 100

    console.log(`[Cloudinary Cleanup API] Cleanup completed: ${results.processed} processed, ${results.failed} failed (${successRate.toFixed(1)}% success rate)`)

    return NextResponse.json({
      success: results.failed === 0,
      message: `Processed ${results.processed} items, ${results.failed} failed`,
      processed: results.processed,
      failed: results.failed,
      success_rate: successRate,
      items: results.items,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Cleanup API] Cleanup processing failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
        failed: 0
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cloudinary/cleanup
 * Get cleanup queue status and statistics
 */
export async function GET() {
  try {
    console.log('[Cloudinary Cleanup API] Getting cleanup queue status...')

    // Get queue statistics
    const { data: queueStats, error: statsError } = await SupabaseMediaService.getClient()
      .from('cloudinary_cleanup_queue')
      .select('status')

    if (statsError) {
      throw new Error(`Failed to get queue stats: ${statsError.message}`)
    }

    const stats = {
      total: queueStats?.length || 0,
      pending: queueStats?.filter(item => item.status === 'pending').length || 0,
      processing: queueStats?.filter(item => item.status === 'processing').length || 0,
      completed: queueStats?.filter(item => item.status === 'completed').length || 0,
      failed: queueStats?.filter(item => item.status === 'failed').length || 0,
      skipped: queueStats?.filter(item => item.status === 'skipped').length || 0
    }

    // Get recent items
    const { data: recentItems, error: recentError } = await SupabaseMediaService.getClient()
      .from('cloudinary_cleanup_queue')
      .select('*')
      .order('queued_at', { ascending: false })
      .limit(20)

    if (recentError) {
      console.warn('[Cloudinary Cleanup API] Failed to get recent items:', recentError)
    }

    return NextResponse.json({
      success: true,
      stats,
      recent_items: recentItems || [],
      has_pending: stats.pending > 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Cleanup API] Status check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cleanup status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
