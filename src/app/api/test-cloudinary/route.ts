/**
 * Cloudinary Test API Route
 * 
 * Simple API route to test Cloudinary configuration and connectivity.
 * This endpoint verifies that the Cloudinary SDK is properly configured
 * and can communicate with the Cloudinary service.
 */

import { NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

/**
 * GET /api/test-cloudinary
 * Test Cloudinary configuration and connectivity
 */
export async function GET() {
  try {
    console.log('[Test Cloudinary] Testing configuration...')

    // Check environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Cloudinary environment variables',
          details: {
            cloudName: !!cloudName,
            apiKey: !!apiKey,
            apiSecret: !!apiSecret
          }
        },
        { status: 400 }
      )
    }

    // Test Cloudinary API connectivity by getting account details
    try {
      if (!cloudinary) {
        throw new Error('Cloudinary not initialized')
      }

      const result = await cloudinary.api.ping()
      console.log('[Test Cloudinary] Ping successful:', result)

      // Get basic account info
      const usage = await cloudinary.api.usage()
      console.log('[Test Cloudinary] Usage info retrieved')

      return NextResponse.json({
        success: true,
        message: 'Cloudinary configuration is working correctly',
        data: {
          cloudName,
          apiConnected: true,
          pingResult: result,
          usage: {
            plan: usage.plan,
            credits: usage.credits,
            objects: usage.objects,
            bandwidth: usage.bandwidth,
            storage: usage.storage,
            requests: usage.requests,
            resources: usage.resources,
            derived_resources: usage.derived_resources
          },
          timestamp: new Date().toISOString()
        }
      })

    } catch (apiError) {
      console.error('[Test Cloudinary] API test failed:', apiError)
      
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary API connection failed',
          details: apiError instanceof Error ? apiError.message : 'Unknown API error',
          cloudName,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Test Cloudinary] Configuration test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cloudinary configuration test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/test-cloudinary
 * Test upload functionality with a sample image
 */
export async function POST() {
  try {
    console.log('[Test Cloudinary] Testing upload functionality...')

    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

    // Upload test image
    if (!cloudinary) {
      throw new Error('Cloudinary not initialized')
    }

    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      upload_preset: 'lgu_project',
      folder: 'lgu-uploads/test',
      public_id: `test-${Date.now()}`,
      tags: ['test', 'api-test', 'lgu-project'],
      resource_type: 'image'
    })

    console.log('[Test Cloudinary] Upload successful:', uploadResult.public_id)

    // Clean up - delete the test image
    try {
      if (cloudinary) {
        await cloudinary.uploader.destroy(uploadResult.public_id)
      }
      console.log('[Test Cloudinary] Test image cleaned up')
    } catch (cleanupError) {
      console.warn('[Test Cloudinary] Cleanup failed:', cleanupError)
    }

    return NextResponse.json({
      success: true,
      message: 'Upload test completed successfully',
      data: {
        uploadResult: {
          public_id: uploadResult.public_id,
          version: uploadResult.version,
          signature: uploadResult.signature,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resource_type: uploadResult.resource_type,
          created_at: uploadResult.created_at,
          tags: uploadResult.tags,
          bytes: uploadResult.bytes,
          url: uploadResult.url,
          secure_url: uploadResult.secure_url,
          folder: uploadResult.folder
        },
        cleanedUp: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[Test Cloudinary] Upload test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Upload test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
