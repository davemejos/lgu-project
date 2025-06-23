/**
 * Cloudinary Media API Route
 *
 * Handles fetching media items from Supabase database with Cloudinary sync.
 * Provides fast, persistent access to media library with perfect mirroring.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'
import { cloudinary } from '@/lib/cloudinary'
// Removed unused imports - BidirectionalSyncService and deleteFromCloudinary

/**
 * GET /api/cloudinary/media
 * Fetch media items with enterprise-grade pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Cloudinary Media API] Fetching media items...')

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const folder = searchParams.get('folder') || undefined
    const resourceType = searchParams.get('resource_type') as 'image' | 'video' | 'raw' | undefined
    const search = searchParams.get('search') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const sortBy = searchParams.get('sort_by')?.split(',') || undefined
    const sortOrder = searchParams.get('sort_order') as 'asc' | 'desc' || 'desc'


    // First, check if database is properly set up
    let databaseReady = false
    let result: {
      assets: Array<{
        public_id: string;
        secure_url: string;
        format: string;
        bytes: number;
        width?: number;
        height?: number;
        resource_type: string;
        created_at: string;
        tags: string[];
        [key: string]: unknown;
      }>;
      total: number;
      page: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
    } | null = null
    let stats: {
      total_assets: number;
      total_images: number;
      total_videos: number;
      total_size: number;
      synced_assets: number;
      pending_assets: number;
      error_assets: number;
    } | null = null

    try {
      // Tables exist, so test actual functionality
      databaseReady = true

      // If database is ready, fetch actual data
      const dbResult = await SupabaseMediaService.searchMediaAssets({
        page,
        limit,
        folder,
        resource_type: resourceType,
        search,
        tags,
        sort_by: sortBy?.[0] || 'created_at',
        sort_order: sortOrder
      })

      // Transform MediaAsset to include compatibility fields for existing UI
      result = {
        assets: dbResult.assets.map(asset => ({
          ...asset,
          // Add compatibility fields for existing UI components
          public_id: asset.cloudinary_public_id,
          bytes: asset.file_size,
          version: asset.cloudinary_version,
          etag: asset.cloudinary_etag,
          original_filename: asset.original_filename || asset.display_name
        })),
        total: dbResult.total,
        page: dbResult.page,
        limit: dbResult.limit,
        has_next: dbResult.has_next,
        has_prev: dbResult.has_prev
      }

      stats = await SupabaseMediaService.getMediaStats()

      console.log(`[Cloudinary Media API] Found ${result?.assets?.length || 0} items (page ${page}) from database`)

    } catch (dbError) {
      console.warn('[Cloudinary Media API] Database not ready:', dbError)

      // Check if this is a table missing error
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      const isTableMissing = errorMessage.includes('relation "media_assets" does not exist') ||
                            errorMessage.includes('table "media_assets" does not exist') ||
                            errorMessage.includes('does not exist') ||
                            errorMessage.includes('Failed to search media assets')

      databaseReady = !isTableMissing

      // Fallback: Return empty result with setup instructions
      result = {
        assets: [],
        total: 0,
        page: 1,
        limit: 50,
        has_next: false,
        has_prev: false
      }

      stats = {
        total_assets: 0,
        total_images: 0,
        total_videos: 0,
        total_size: 0,
        synced_assets: 0,
        pending_assets: 0,
        error_assets: 0
      }
    }

    return NextResponse.json({
      success: databaseReady,
      items: result?.assets || [],
      pagination: {
        page: result?.page || 1,
        limit: result?.limit || 50,
        total: result?.total || 0,
        pages: Math.ceil((result?.total || 0) / (result?.limit || 50)),
        has_next: result?.has_next || false,
        has_prev: result?.has_prev || false
      },
      stats: {
        total_images: stats?.total_images || 0,
        total_videos: stats?.total_videos || 0,
        total_files: stats?.total_assets || 0,
        total_size: stats?.total_size || 0
      },
      sync_status: {
        last_sync: new Date().toISOString(),
        is_synced: databaseReady && (stats?.pending_assets || 0) === 0 && (stats?.error_assets || 0) === 0,
        pending_operations: (stats?.pending_assets || 0) + (stats?.error_assets || 0),
        synced_assets: stats?.synced_assets || 0,
        error_assets: stats?.error_assets || 0,
        database_ready: databaseReady
      },
      database_setup: {
        ready: databaseReady,
        message: databaseReady
          ? 'Database is properly configured'
          : 'Database setup required - run the SQL script from docs/full-complete-supabase-script.md',
        setup_endpoint: '/api/setup-media-db',
        script_location: 'docs/full-complete-supabase-script.md'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Media API] Fetch failed:', error)

    // Return empty result with error information
    return NextResponse.json({
      success: false,
      items: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
        has_next: false,
        has_prev: false
      },
      stats: {
        total_images: 0,
        total_videos: 0,
        total_files: 0,
        total_size: 0
      },
      sync_status: {
        last_sync: new Date().toISOString(),
        is_synced: false,
        pending_operations: 0,
        database_ready: false
      },
      database_setup: {
        ready: false,
        message: 'Database setup required - run the SQL script from docs/full-complete-supabase-script.md',
        setup_endpoint: '/api/setup-media-db',
        script_location: 'docs/full-complete-supabase-script.md'
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * DELETE /api/cloudinary/media
 * Delete media items with bidirectional sync
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[Cloudinary Media API] Processing delete request...')

    // Parse query parameters for public IDs
    const { searchParams } = new URL(request.url)
    const queryPublicIds = searchParams.get('public_ids')?.split(',').filter(Boolean) || []

    // Also check request body for public IDs (for POST-style requests from real-time handlers)
    let bodyPublicIds: string[] = []
    try {
      const body = await request.json()
      bodyPublicIds = body.public_ids || []
      console.log('[Cloudinary Media API] 📄 Request body public_ids:', bodyPublicIds)
    } catch {
      // No body or invalid JSON, use query params only
      console.log('[Cloudinary Media API] 📄 No request body, using query params only')
    }

    // Combine both sources and remove duplicates
    const publicIds = [...new Set([...queryPublicIds, ...bodyPublicIds])]

    if (publicIds.length === 0) {
      console.error('[Cloudinary Media API] ❌ No public_ids provided')
      return NextResponse.json({
        success: false,
        error: 'No public IDs provided for deletion',
        message: 'Provide public_ids as query parameter (?public_ids=id1,id2) or in request body {"public_ids": ["id1", "id2"]}',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    console.log(`[Cloudinary Media API] 🗑️ Deleting ${publicIds.length} items:`, publicIds)

    const results = {
      deleted: [] as string[],
      failed: [] as {
        public_id: string,
        error: string,
        cloudinary_success?: boolean,
        database_success?: boolean,
        cloudinary_error?: string
      }[]
    }

    // Process each deletion - DELETE FROM BOTH CLOUDINARY AND DATABASE
    for (const publicId of publicIds) {
      try {
        console.log(`[Cloudinary Media API] Processing deletion for: ${publicId}`)

        // Get asset info first
        const asset = await SupabaseMediaService.getMediaAssetByPublicId(publicId)

        if (!asset) {
          console.warn(`[Cloudinary Media API] Asset not found in database: ${publicId}`)
          // Still try to delete from Cloudinary in case it exists there
        }

        // STEP 1: Delete from Cloudinary first
        let cloudinaryDeleteSuccess = false
        let cloudinaryErrorDetails = null

        try {
          console.log(`[Cloudinary Media API] Deleting from Cloudinary: ${publicId}`)

          // Check if cloudinary instance is available
          if (!cloudinary) {
            throw new Error('Cloudinary instance not available - check environment variables')
          }

          // Get the resource type from the database asset
          const rawResourceType = asset?.resource_type || 'image'
          console.log(`[Cloudinary Media API] Using resource type: ${rawResourceType}`)

          let cloudinaryResult

          // Try with the known resource type first
          try {
            // Ensure we use a valid Cloudinary resource type
            const destroyResourceType: 'image' | 'video' | 'raw' =
              rawResourceType === 'video' ? 'video' :
              rawResourceType === 'raw' ? 'raw' : 'image'

            cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
              resource_type: destroyResourceType,
              invalidate: true
            })
          } catch (firstAttemptError) {
            console.log(`[Cloudinary Media API] First attempt failed with ${rawResourceType}, trying different types:`, firstAttemptError)

            // Try different resource types
            let success = false
            for (const tryType of ['image', 'video', 'raw'] as const) {
              try {
                cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
                  resource_type: tryType,
                  invalidate: true
                })
                success = true
                break
              } catch (attemptError) {
                console.log(`[Cloudinary Media API] Failed with ${tryType}:`, attemptError)
              }
            }

            if (!success) {
              throw new Error('Failed to delete with any resource type')
            }
          }

          console.log(`[Cloudinary Media API] Cloudinary delete result for ${publicId}:`, JSON.stringify(cloudinaryResult, null, 2))

          if (cloudinaryResult.result === 'ok') {
            cloudinaryDeleteSuccess = true
            console.log(`[Cloudinary Media API] ✅ Successfully deleted from Cloudinary: ${publicId}`)
          } else if (cloudinaryResult.result === 'not found') {
            cloudinaryDeleteSuccess = true
            console.log(`[Cloudinary Media API] ⚠️ Asset not found in Cloudinary (already deleted?): ${publicId}`)
          } else {
            cloudinaryErrorDetails = `Unexpected result: ${cloudinaryResult.result}`
            console.error(`[Cloudinary Media API] ❌ Cloudinary delete failed for ${publicId}:`, cloudinaryResult.result)
          }

        } catch (cloudinaryError: unknown) {
          // Properly extract error details from Cloudinary error object
          if (cloudinaryError && typeof cloudinaryError === 'object') {
            const errorObj = cloudinaryError as Record<string, unknown>
            cloudinaryErrorDetails = JSON.stringify({
              message: errorObj.message || 'Unknown error',
              http_code: errorObj.http_code || 'Unknown',
              error: errorObj.error || cloudinaryError,
              name: errorObj.name || 'CloudinaryError'
            })
          } else {
            cloudinaryErrorDetails = String(cloudinaryError)
          }

          console.error(`[Cloudinary Media API] ❌ Cloudinary delete error for ${publicId}:`, cloudinaryError)
          console.error(`[Cloudinary Media API] Error details:`, {
            error_type: cloudinaryError instanceof Error ? cloudinaryError.constructor.name : typeof cloudinaryError,
            error_message: cloudinaryErrorDetails,
            http_code: (cloudinaryError as Record<string, unknown>)?.http_code,
            cloudinary_available: !!cloudinary,
            env_vars: {
              cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              api_key: !!process.env.CLOUDINARY_API_KEY,
              api_secret: !!process.env.CLOUDINARY_API_SECRET
            }
          })
        }

        // STEP 2: HARD DELETE from database (not soft delete)
        let databaseDeleteSuccess = false
        if (asset) {
          try {
            console.log(`[Cloudinary Media API] HARD DELETING from database: ${publicId}`)

            // HARD DELETE: Actually remove the record from database
            await SupabaseMediaService.hardDeleteMediaAsset(publicId)

            databaseDeleteSuccess = true
            console.log(`[Cloudinary Media API] Successfully HARD DELETED from database: ${publicId}`)

          } catch (databaseError) {
            console.error(`[Cloudinary Media API] Database delete error for ${publicId}:`, databaseError)
          }
        } else {
          // No database record to delete
          databaseDeleteSuccess = true
        }

        // STEP 3: Evaluate overall success
        if (cloudinaryDeleteSuccess && databaseDeleteSuccess) {
          results.deleted.push(publicId)
          console.log(`[Cloudinary Media API] ✅ Successfully processed deletion: ${publicId}`)
        } else {
          const errorDetails = []
          if (!cloudinaryDeleteSuccess) {
            errorDetails.push(`Cloudinary: ${cloudinaryErrorDetails || 'Unknown error'}`)
          }
          if (!databaseDeleteSuccess) {
            errorDetails.push('Database: Delete failed')
          }

          results.failed.push({
            public_id: publicId,
            error: `Failed to delete - ${errorDetails.join(', ')}`,
            cloudinary_success: cloudinaryDeleteSuccess,
            database_success: databaseDeleteSuccess,
            cloudinary_error: cloudinaryErrorDetails || undefined
          })

          console.error(`[Cloudinary Media API] ❌ Failed to delete ${publicId}:`, {
            cloudinary_success: cloudinaryDeleteSuccess,
            database_success: databaseDeleteSuccess,
            cloudinary_error: cloudinaryErrorDetails
          })
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.failed.push({ public_id: publicId, error: errorMsg })
        console.error(`[Cloudinary Media API] Failed to delete ${publicId}:`, error)
      }
    }

    return NextResponse.json({
      success: results.failed.length === 0,
      message: `Deleted ${results.deleted.length} items, ${results.failed.length} failed`,
      deleted: results.deleted,
      failed: results.failed,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Media API] Delete operation failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Delete operation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}


