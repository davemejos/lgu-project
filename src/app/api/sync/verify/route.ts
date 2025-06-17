/**
 * Sync Verification API Route
 * 
 * Provides endpoints for verifying sync integrity between Cloudinary and Supabase.
 * Helps identify missing assets, conflicts, and provides recommendations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { BidirectionalSyncService } from '@/lib/bidirectionalSyncService'

/**
 * GET /api/sync/verify
 * Verify sync integrity between Cloudinary and Supabase
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Sync Verify API] Starting sync integrity verification...')

    const startTime = Date.now()
    
    // Perform sync verification
    const verificationResult = await BidirectionalSyncService.verifySyncIntegrity()
    
    const processingTime = Date.now() - startTime

    console.log(`[Sync Verify API] Verification completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString(),
      summary: {
        total_cloudinary_assets: verificationResult.cloudinary_count,
        total_database_assets: verificationResult.database_count,
        missing_in_database: verificationResult.missing_in_database.length,
        missing_in_cloudinary: verificationResult.missing_in_cloudinary.length,
        sync_conflicts: verificationResult.sync_conflicts.length,
        is_perfectly_synced: verificationResult.success
      }
    })

  } catch (error) {
    console.error('[Sync Verify API] Verification failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sync verification failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/sync/verify
 * Verify and optionally fix sync issues
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Sync Verify API] Starting verification with auto-fix...')

    const body = await request.json()
    const { auto_fix = false, fix_missing_in_database = false, fix_conflicts = false } = body

    const startTime = Date.now()
    
    // First, perform verification
    const verificationResult = await BidirectionalSyncService.verifySyncIntegrity()
    
    let fixResults = {
      fixed_missing_in_database: 0,
      fixed_conflicts: 0,
      fix_errors: [] as string[]
    }

    // Apply fixes if requested
    if (auto_fix || fix_missing_in_database || fix_conflicts) {
      console.log('[Sync Verify API] Applying fixes...')

      // Fix missing assets in database
      if ((auto_fix || fix_missing_in_database) && verificationResult.missing_in_database.length > 0) {
        try {
          const syncResult = await BidirectionalSyncService.performFullSync({
            batch_size: 100
          })
          
          if (syncResult.success) {
            fixResults.fixed_missing_in_database = syncResult.synced_items
          } else {
            fixResults.fix_errors.push(`Failed to sync missing assets: ${syncResult.errors.join(', ')}`)
          }
        } catch (error) {
          fixResults.fix_errors.push(`Sync operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Fix conflicts by re-syncing
      if ((auto_fix || fix_conflicts) && verificationResult.sync_conflicts.length > 0) {
        let conflictsFixed = 0
        
        for (const conflict of verificationResult.sync_conflicts) {
          try {
            const syncResult = await BidirectionalSyncService.syncSingleAsset(conflict.public_id)
            if (syncResult.success) {
              conflictsFixed++
            } else {
              fixResults.fix_errors.push(`Failed to fix conflict for ${conflict.public_id}: ${syncResult.errors.join(', ')}`)
            }
          } catch (error) {
            fixResults.fix_errors.push(`Failed to fix conflict for ${conflict.public_id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
        
        fixResults.fixed_conflicts = conflictsFixed
      }
    }

    const processingTime = Date.now() - startTime

    console.log(`[Sync Verify API] Verification and fixes completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      fixes_applied: auto_fix || fix_missing_in_database || fix_conflicts,
      fix_results: fixResults,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString(),
      summary: {
        total_cloudinary_assets: verificationResult.cloudinary_count,
        total_database_assets: verificationResult.database_count,
        missing_in_database: verificationResult.missing_in_database.length,
        missing_in_cloudinary: verificationResult.missing_in_cloudinary.length,
        sync_conflicts: verificationResult.sync_conflicts.length,
        is_perfectly_synced: verificationResult.success && fixResults.fix_errors.length === 0,
        fixes: {
          missing_assets_fixed: fixResults.fixed_missing_in_database,
          conflicts_fixed: fixResults.fixed_conflicts,
          fix_errors: fixResults.fix_errors.length
        }
      }
    })

  } catch (error) {
    console.error('[Sync Verify API] Verification with fixes failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sync verification with fixes failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
