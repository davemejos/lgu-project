/**
 * Webhook Configuration API
 * 
 * Provides the correct webhook URLs for Cloudinary configuration.
 * Automatically detects environment and provides appropriate URLs.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the base URL from environment or request
    const envWebhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL
    const requestOrigin = request.nextUrl.origin
    
    // Determine the correct base URL
    let baseUrl: string
    
    if (envWebhookUrl) {
      // Use environment variable if set (for ngrok or custom domains)
      baseUrl = envWebhookUrl
    } else {
      // Fall back to request origin (for production)
      baseUrl = requestOrigin
    }
    
    // Construct webhook URLs
    const webhookUrls = {
      cloudinary: `${baseUrl}/api/webhooks/cloudinary`,
      cloudinary_alt: `${baseUrl}/api/cloudinary/webhook`, // Alternative endpoint
    }
    
    // Detect environment
    const isNgrok = baseUrl.includes('ngrok')
    const isLocalhost = baseUrl.includes('localhost')
    const isDevelopment = isNgrok || isLocalhost
    
    const config = {
      environment: isDevelopment ? 'development' : 'production',
      base_url: baseUrl,
      webhook_urls: webhookUrls,
      instructions: {
        cloudinary_setup: `Set your Cloudinary webhook URL to: ${webhookUrls.cloudinary}`,
        supported_events: ['upload', 'delete', 'update'],
        notes: isDevelopment 
          ? 'Development mode detected. Update NEXT_PUBLIC_WEBHOOK_BASE_URL in .env.local when ngrok URL changes.'
          : 'Production mode. Webhook URLs are stable.'
      }
    }
    
    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[Webhook Config API] Failed to generate config:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate webhook configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
