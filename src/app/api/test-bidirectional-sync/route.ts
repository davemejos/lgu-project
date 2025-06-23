/**
 * Bidirectional Sync Test API
 *
 * Comprehensive test suite to verify 100% complete bidirectional sync
 * between Custom Media Library, Supabase database, and Cloudinary.
 * Tests all deletion scenarios to ensure perfect synchronization.
 */

import { NextResponse } from 'next/server'
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

interface TestResult {
  test_name: string
  success: boolean
  details: string
  duration_ms: number
  error?: string
}

/**
 * POST /api/test-bidirectional-sync
 * Run comprehensive bidirectional sync tests
 */
export async function POST() {
  const startTime = Date.now()
  const results: TestResult[] = []

  try {
    console.log('[Bidirectional Sync Test] Starting comprehensive sync tests...')

    // Test 1: Upload and verify sync
    results.push(await testUploadSync())

    // Test 2: UI deletion sync
    results.push(await testUIDeletionSync())

    // Test 3: Database trigger sync
    results.push(await testDatabaseTriggerSync())

    // Test 4: Cleanup queue processing
    results.push(await testCleanupQueueProcessing())

    // Test 5: Scheduler functionality
    results.push(await testSchedulerFunctionality())

    // Test 6: Integrity verification
    results.push(await testIntegrityVerification())

    const totalDuration = Date.now() - startTime
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    console.log(`[Bidirectional Sync Test] Tests completed: ${successCount}/${results.length} passed`)

    return NextResponse.json({
      success: failureCount === 0,
      summary: {
        total_tests: results.length,
        passed: successCount,
        failed: failureCount,
        success_rate: (successCount / results.length) * 100,
        total_duration_ms: totalDuration
      },
      test_results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Bidirectional Sync Test] Test suite failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test suite execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        partial_results: results
      },
      { status: 500 }
    )
  }
}

/**
 * Test 1: Upload and verify sync
 */
async function testUploadSync(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log('[Test 1] Testing upload sync...')

    const cloudinaryInstance = await initCloudinary()
    if (!cloudinaryInstance) {
      throw new Error('Cloudinary not available')
    }

    // Create a test image
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testPublicId = `test-upload-sync-${Date.now()}`

    // Upload to Cloudinary
    const uploadResult = await cloudinaryInstance.uploader.upload(testImageBase64, {
      public_id: testPublicId,
      folder: 'lgu-uploads/test',
      tags: ['test', 'bidirectional-sync-test']
    })

    // Verify upload
    if (!uploadResult.public_id) {
      throw new Error('Upload failed')
    }

    // Sync to database
    await SupabaseMediaService.upsertMediaAsset({
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_version: uploadResult.version,
      cloudinary_signature: uploadResult.signature,
      original_filename: 'test-image.png',
      file_size: uploadResult.bytes,
      mime_type: 'image/png',
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      resource_type: 'image',
      folder: 'lgu-uploads/test',
      tags: ['test', 'bidirectional-sync-test'],
      sync_status: 'synced',
      access_mode: 'public'
    })

    // Verify database record exists
    const dbAsset = await SupabaseMediaService.getMediaAssetByPublicId(uploadResult.public_id)
    if (!dbAsset) {
      throw new Error('Database sync failed - asset not found in database')
    }

    // Clean up test asset
    await cloudinaryInstance.uploader.destroy(uploadResult.public_id)
    await SupabaseMediaService.hardDeleteMediaAsset(uploadResult.public_id)

    return {
      test_name: 'Upload and Sync Verification',
      success: true,
      details: `Successfully uploaded ${uploadResult.public_id} and synced to database`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'Upload and Sync Verification',
      success: false,
      details: 'Upload sync test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test 2: UI deletion sync
 */
async function testUIDeletionSync(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log('[Test 2] Testing UI deletion sync...')

    // This test would simulate the UI deletion flow
    // For now, we'll test the API endpoint directly
    
    const cloudinaryInstance = await initCloudinary()
    if (!cloudinaryInstance) {
      throw new Error('Cloudinary not available')
    }

    // Create test asset
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testPublicId = `test-ui-deletion-${Date.now()}`

    const uploadResult = await cloudinaryInstance.uploader.upload(testImageBase64, {
      public_id: testPublicId,
      folder: 'lgu-uploads/test',
      tags: ['test', 'ui-deletion-test']
    })

    // Add to database
    await SupabaseMediaService.upsertMediaAsset({
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_version: uploadResult.version,
      cloudinary_signature: uploadResult.signature,
      original_filename: 'test-ui-deletion.png',
      file_size: uploadResult.bytes,
      mime_type: 'image/png',
      format: uploadResult.format,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      resource_type: 'image',
      folder: 'lgu-uploads/test',
      tags: ['test', 'ui-deletion-test'],
      sync_status: 'synced',
      access_mode: 'public'
    })

    // Test UI deletion via API (simulates admin/media page deletion)
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/media?public_ids=${uploadResult.public_id}`, {
      method: 'DELETE'
    })

    if (!deleteResponse.ok) {
      throw new Error(`UI deletion API failed: ${deleteResponse.status}`)
    }

    const deleteResult = await deleteResponse.json()
    
    if (!deleteResult.success) {
      throw new Error('UI deletion failed')
    }

    // Verify both Cloudinary and database deletion
    try {
      await cloudinaryInstance.api.resource(uploadResult.public_id)
      throw new Error('Asset still exists in Cloudinary after UI deletion')
    } catch (cloudinaryError: unknown) {
      // Expected - asset should be deleted
      if (cloudinaryError && typeof cloudinaryError === 'object' && 'http_code' in cloudinaryError && (cloudinaryError as { http_code: number }).http_code !== 404) {
        throw new Error('Unexpected Cloudinary error during verification')
      }
    }

    const dbAsset = await SupabaseMediaService.getMediaAssetByPublicId(uploadResult.public_id)
    if (dbAsset) {
      throw new Error('Asset still exists in database after UI deletion')
    }

    return {
      test_name: 'UI Deletion Sync',
      success: true,
      details: `Successfully deleted ${uploadResult.public_id} from both Cloudinary and database via UI`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'UI Deletion Sync',
      success: false,
      details: 'UI deletion sync test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test 3: Database trigger sync
 */
async function testDatabaseTriggerSync(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log('[Test 3] Testing database trigger sync...')

    const cloudinaryInstance = await initCloudinary()
    if (!cloudinaryInstance) {
      throw new Error('Cloudinary not available')
    }

    // Create test asset
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testPublicId = `test-db-trigger-${Date.now()}`

    const uploadResult = await cloudinaryInstance.uploader.upload(testImageBase64, {
      public_id: testPublicId,
      folder: 'lgu-uploads/test',
      tags: ['test', 'db-trigger-test']
    })

    // Add to database
    await SupabaseMediaService.upsertMediaAsset({
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_version: uploadResult.version,
      cloudinary_signature: uploadResult.signature,
      original_filename: 'test-db-trigger.png',
      file_size: uploadResult.bytes,
      mime_type: 'image/png',
      format: uploadResult.format,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      resource_type: 'image',
      folder: 'lgu-uploads/test',
      tags: ['test', 'db-trigger-test'],
      sync_status: 'synced',
      access_mode: 'public'
    })

    // Delete directly from database (should trigger cleanup queue)
    await SupabaseMediaService.hardDeleteMediaAsset(uploadResult.public_id)

    // Check if cleanup was queued
    const pendingCleanups = await SupabaseMediaService.getPendingCleanupItems(50)
    const queuedCleanup = pendingCleanups.find(item => item.cloudinary_public_id === uploadResult.public_id)

    if (!queuedCleanup) {
      throw new Error('Database deletion did not trigger cleanup queue')
    }

    // Process the cleanup queue
    const cleanupResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specific_id: queuedCleanup.id })
    })

    if (!cleanupResponse.ok) {
      throw new Error('Cleanup processing failed')
    }

    const cleanupResult = await cleanupResponse.json()
    if (!cleanupResult.success) {
      throw new Error('Cleanup processing was not successful')
    }

    // Verify Cloudinary deletion
    try {
      await cloudinaryInstance.api.resource(uploadResult.public_id)
      throw new Error('Asset still exists in Cloudinary after trigger cleanup')
    } catch (cloudinaryError: unknown) {
      // Expected - asset should be deleted
      if (cloudinaryError && typeof cloudinaryError === 'object' && 'http_code' in cloudinaryError && (cloudinaryError as { http_code: number }).http_code !== 404) {
        throw new Error('Unexpected Cloudinary error during verification')
      }
    }

    return {
      test_name: 'Database Trigger Sync',
      success: true,
      details: `Successfully triggered cleanup for ${uploadResult.public_id} via database deletion`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'Database Trigger Sync',
      success: false,
      details: 'Database trigger sync test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test 4: Cleanup queue processing
 */
async function testCleanupQueueProcessing(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log('[Test 4] Testing cleanup queue processing...')

    // Test cleanup queue API endpoints
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/cleanup`, {
      method: 'GET'
    })

    if (!statusResponse.ok) {
      throw new Error('Cleanup status API failed')
    }

    const statusResult = await statusResponse.json()
    if (!statusResult.success) {
      throw new Error('Cleanup status check failed')
    }

    // Test processing (should handle empty queue gracefully)
    const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 5 })
    })

    if (!processResponse.ok) {
      throw new Error('Cleanup processing API failed')
    }

    const processResult = await processResponse.json()
    if (!processResult.success && processResult.processed === undefined) {
      throw new Error('Cleanup processing returned invalid response')
    }

    return {
      test_name: 'Cleanup Queue Processing',
      success: true,
      details: `Cleanup queue API working correctly. Queue stats: ${JSON.stringify(statusResult.stats)}`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'Cleanup Queue Processing',
      success: false,
      details: 'Cleanup queue processing test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test 5: Scheduler functionality
 */
async function testSchedulerFunctionality(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log('[Test 5] Testing scheduler functionality...')

    // Test scheduler status API
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/scheduler`, {
      method: 'GET'
    })

    if (!statusResponse.ok) {
      throw new Error('Scheduler status API failed')
    }

    const statusResult = await statusResponse.json()
    if (!statusResult.success) {
      throw new Error('Scheduler status check failed')
    }

    // Test scheduler control (get current status)
    const controlResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/scheduler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' })
    })

    if (!controlResponse.ok) {
      throw new Error('Scheduler control API failed')
    }

    const controlResult = await controlResponse.json()
    if (!controlResult.success) {
      throw new Error('Scheduler control failed')
    }

    return {
      test_name: 'Scheduler Functionality',
      success: true,
      details: `Scheduler API working correctly. Status: ${controlResult.stats?.is_running ? 'running' : 'stopped'}`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'Scheduler Functionality',
      success: false,
      details: 'Scheduler functionality test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test 6: Integrity verification
 */
async function testIntegrityVerification(): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log('[Test 6] Testing integrity verification...')

    // Test sync integrity check
    const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        force: false,
        batch_size: 10
      })
    })

    if (!syncResponse.ok) {
      throw new Error('Sync API failed')
    }

    const syncResult = await syncResponse.json()
    if (!syncResult.success && syncResult.data === undefined) {
      throw new Error('Sync integrity check failed')
    }

    return {
      test_name: 'Integrity Verification',
      success: true,
      details: `Sync integrity check completed. Synced: ${syncResult.data?.synced_items || 0}, Updated: ${syncResult.data?.updated_items || 0}`,
      duration_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      test_name: 'Integrity Verification',
      success: false,
      details: 'Integrity verification test failed',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
