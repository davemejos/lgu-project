/**
 * Cloudinary Sync API Route
 *
 * Handles bidirectional synchronization between Cloudinary and Supabase database.
 * Provides enterprise-grade sync operations for perfect mirroring with persistent storage.
 */

import { NextResponse } from 'next/server'
import { BidirectionalSyncService } from '@/lib/bidirectionalSyncService'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'

/**
 * POST /api/cloudinary/sync
 * Trigger bidirectional sync with Cloudinary
 */
export async function POST(request: Request) {
  try {
    console.log('[Cloudinary Sync API] Starting bidirectional sync operation...')

    // First, check if database is properly set up
    let databaseReady = false
    try {
      // Test database connectivity by attempting to get stats
      await SupabaseMediaService.getMediaStats()
      databaseReady = true
    } catch (dbError) {
      console.warn('[Cloudinary Sync API] Database not ready for sync:', dbError)

      return NextResponse.json({
        success: false,
        error: 'Database not properly set up',
        message: 'Cannot perform sync - database tables are missing',
        database_setup: {
          ready: false,
          message: 'Run the SQL script from docs/full-complete-supabase-script.md to set up the database',
          setup_endpoint: '/api/setup-media-db',
          script_location: 'docs/full-complete-supabase-script.md'
        },
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Parse request body for sync options
    const body = await request.json().catch(() => ({}))
    const {
      force = false,
      batch_size = 100,
      max_retries = 3,
      include_deleted = false,
      folder_filter,
      resource_type_filter,
      single_asset
    } = body

    // Handle single asset sync (for upload widget integration)
    let result
    if (single_asset) {
      result = await BidirectionalSyncService.syncSingleAsset(single_asset)
    } else {
      // Perform full bidirectional sync
      result = await BidirectionalSyncService.performFullSync({
        force,
        batch_size,
        max_retries,
        include_deleted,
        folder_filter,
        resource_type_filter
      })
    }

    console.log('[Cloudinary Sync API] Bidirectional sync completed:', result)

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Sync completed successfully: ${result.synced_items} synced, ${result.updated_items} updated, ${result.deleted_items} deleted`
        : `Sync completed with ${result.errors.length} errors`,
      data: {
        synced_items: result.synced_items,
        updated_items: result.updated_items,
        deleted_items: result.deleted_items,
        duration_ms: result.duration_ms,
        errors: result.errors,
        error_count: result.errors.length
      },
      database_setup: {
        ready: databaseReady,
        message: 'Database is properly configured for sync operations'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Sync API] Sync failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Sync operation failed',
        database_setup: {
          ready: false,
          message: 'Database setup verification failed'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cloudinary/sync
 * Get sync status and statistics
 */
export async function GET() {
  try {
    console.log('[Cloudinary Sync API] Getting sync status...')

    // Get current media statistics
    const stats = await SupabaseMediaService.getMediaStats()

    // Get recent sync operations
    const recentSyncs = await SupabaseMediaService.searchMediaAssets({
      limit: 10,
      sort_by: 'last_synced_at',
      sort_order: 'desc'
    })

    // Calculate sync status
    const pendingOperations = stats.pending_assets + stats.error_assets
    const syncStatus = {
      last_sync: recentSyncs.assets[0]?.last_synced_at || new Date().toISOString(),
      is_synced: pendingOperations === 0,
      pending_operations: pendingOperations,
      sync_in_progress: false, // TODO: Track active sync operations
      total_assets: stats.total_assets,
      synced_assets: stats.synced_assets,
      error_assets: stats.error_assets,
      last_error: recentSyncs.assets.find(a => a.sync_status === 'error')?.sync_error_message || null
    }

    return NextResponse.json({
      success: true,
      sync_status: syncStatus,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Sync API] Status fetch failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
