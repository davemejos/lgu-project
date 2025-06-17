/**
 * Cloudinary Webhook Handler
 * 
 * This creates the correct webhook endpoint that Cloudinary expects.
 * Redirects to the existing webhook handler to maintain compatibility.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [WEBHOOK RECEIVED] Cloudinary webhook received at /api/webhooks/cloudinary')

    // Get the request body and headers
    const body = await request.text()
    const headers = new Headers()

    // Parse the body to check notification_type
    let parsedBody: any = {}
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      console.error('❌ [WEBHOOK ERROR] Failed to parse webhook body as JSON:', parseError)
    }

    // Log webhook details for debugging
    console.log('📋 [WEBHOOK DETAILS]', {
      url: request.url,
      method: request.method,
      notification_type: parsedBody.notification_type,
      public_id: parsedBody.public_id,
      resource_type: parsedBody.resource_type,
      headers: Object.fromEntries(request.headers.entries()),
      body_preview: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
      body_length: body.length
    })

    // CRITICAL: Check if this is an upload notification
    if (parsedBody.notification_type === 'upload') {
      console.log('🚀 [UPLOAD WEBHOOK] This is an UPLOAD notification! Processing...')
      console.log('📄 [UPLOAD DETAILS]', {
        public_id: parsedBody.public_id,
        original_filename: parsedBody.original_filename,
        resource_type: parsedBody.resource_type,
        bytes: parsedBody.bytes,
        format: parsedBody.format,
        created_at: parsedBody.created_at
      })
    } else if (parsedBody.notification_type === 'delete') {
      console.log('🗑️ [DELETE WEBHOOK] This is a DELETE notification! Processing...')
      console.log('📄 [DELETE DETAILS]', {
        resources: parsedBody.resources,
        public_id: parsedBody.public_id,
        resource_type: parsedBody.resource_type
      })
    } else {
      console.log(`ℹ️ [OTHER WEBHOOK] Notification type: ${parsedBody.notification_type || 'UNKNOWN'}`)
    }

    // Copy all headers from the original request
    request.headers.forEach((value, key) => {
      headers.set(key, value)
    })

    console.log('🔄 [WEBHOOK FORWARD] Forwarding to /api/cloudinary/webhook...')

    // Forward to the actual webhook handler (use localhost for internal forwarding)
    const forwardUrl = `http://localhost:3001/api/cloudinary/webhook`
    console.log('🔄 [WEBHOOK FORWARD] Forwarding to:', forwardUrl)

    const response = await fetch(forwardUrl, {
      method: 'POST',
      headers,
      body
    })

    const result = await response.json()

    console.log('✅ [WEBHOOK RESULT]', {
      status: response.status,
      success: result.success,
      message: result.message
    })

    return NextResponse.json(result, { status: response.status })

  } catch (error) {
    console.error('❌ [WEBHOOK ERROR] Failed to forward webhook:', error)

    return NextResponse.json(
      {
        error: 'Webhook forwarding failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Cloudinary webhook endpoint',
    correct_endpoint: `${request.nextUrl.origin}/api/cloudinary/webhook`,
    redirect_active: true
  })
}
