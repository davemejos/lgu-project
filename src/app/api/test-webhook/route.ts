/**
 * Test Webhook Endpoint
 * 
 * This endpoint simulates a Cloudinary webhook to test if your webhook processing
 * works correctly. Use this to debug webhook issues.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { test_public_id = 'test-webhook-file' } = await request.json()

    // Create a realistic webhook payload that Cloudinary would send
    const webhookPayload = {
      notification_type: 'upload',
      timestamp: new Date().toISOString(),
      request_id: `test_${Date.now()}`,
      public_id: test_public_id,
      version: 1,
      width: 800,
      height: 600,
      format: 'jpg',
      resource_type: 'image',
      created_at: new Date().toISOString(),
      bytes: 125000,
      type: 'upload',
      etag: `test_etag_${Date.now()}`,
      url: `http://res.cloudinary.com/demo/image/upload/${test_public_id}.jpg`,
      secure_url: `https://res.cloudinary.com/demo/image/upload/${test_public_id}.jpg`,
      asset_folder: 'test-uploads',
      display_name: 'Test Webhook File',
      original_filename: 'test-file.jpg',
      tags: ['test', 'webhook', 'lgu-project']
    }

    // Create signature for webhook verification
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const payloadString = JSON.stringify(webhookPayload)
    
    // Generate signature (this would normally be done by Cloudinary)
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'CLOUDINARY_API_SECRET not configured',
        message: 'Cannot generate webhook signature without API secret'
      }, { status: 500 })
    }

    const signature = crypto
      .createHash('sha1')
      .update(payloadString + timestamp + apiSecret)
      .digest('hex')

    console.log('[Test Webhook] Sending simulated webhook to your endpoint...')

    // Send the webhook to your actual webhook endpoint
    const webhookUrl = `${request.nextUrl.origin}/api/cloudinary/webhook`
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cld-signature': signature,
        'x-cld-timestamp': timestamp
      },
      body: payloadString
    })

    const webhookResult = await webhookResponse.json()

    console.log('[Test Webhook] Webhook response:', webhookResult)

    return NextResponse.json({
      success: true,
      message: 'Test webhook sent successfully',
      test_data: {
        webhook_url: webhookUrl,
        payload: webhookPayload,
        signature_generated: true,
        webhook_response: webhookResult,
        webhook_status: webhookResponse.status
      },
      instructions: [
        'Check your Media Center to see if the test file appears',
        'Check server logs for webhook processing messages',
        'If successful, your webhook setup is working correctly'
      ]
    })

  } catch (error) {
    console.error('[Test Webhook] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send test webhook'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook Test Endpoint',
    usage: 'POST with optional { "test_public_id": "your-test-id" }',
    purpose: 'Simulate a Cloudinary upload webhook to test your webhook processing'
  })
}
