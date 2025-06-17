/**
 * Email Test API Route
 * 
 * Professional API endpoint for testing email functionality
 * Allows administrators to verify Resend integration
 * 
 * POST /api/email/test
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailService } from '@/lib/emailService'
import { createClient } from '@/utils/supabase/server'

// Validation schema
const testEmailSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  testType: z.enum(['basic', 'welcome', 'notification', 'system-alert']).default('basic')
})

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { recipientEmail, testType } = testEmailSchema.parse(body)

    console.log(`[EmailTestAPI] Processing ${testType} test email to: ${recipientEmail}`)

    let result

    // Handle different test types
    switch (testType) {
      case 'basic':
        result = await EmailService.sendTestEmail(recipientEmail)
        break

      case 'welcome':
        result = await EmailService.sendWelcomeEmail(
          recipientEmail,
          'Test User',
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
        )
        break

      case 'notification':
        result = await EmailService.sendNotification(
          recipientEmail,
          {
            recipientName: 'Test User',
            subject: 'Test Notification Email',
            message: 'This is a test notification email to verify that the notification system is working correctly.\n\nIf you receive this email, the Resend integration is functioning properly!',
            actionUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            actionText: 'Go to Dashboard'
          }
        )
        break

      case 'system-alert':
        result = await EmailService.sendSystemAlert(
          recipientEmail,
          {
            recipientName: 'Administrator',
            alertType: 'info',
            subject: 'Test System Alert',
            message: 'This is a test system alert email to verify that the alert notification system is working correctly.',
            details: 'Test Details:\n- Email service: Resend\n- Template: SystemAlertEmailTemplate\n- Status: Testing\n- Integration: Successful',
            timestamp: new Date()
          }
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        )
    }

    // Return result
    if (result.success) {
      console.log(`[EmailTestAPI] Test email sent successfully. Message ID: ${result.messageId}`)
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        testType,
        recipientEmail,
        message: `${testType} test email sent successfully`,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error(`[EmailTestAPI] Failed to send test email: ${result.error}`)
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          testType,
          recipientEmail,
          details: result.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[EmailTestAPI] Validation error:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[EmailTestAPI] Unexpected error:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// GET method for configuration check
export async function GET() {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const configValidation = EmailService.validateConfig()
    
    return NextResponse.json({
      status: 'Email test service is ready',
      emailEnabled: EmailService.isEmailEnabled(),
      configuration: {
        valid: configValidation.valid,
        errors: configValidation.errors
      },
      availableTestTypes: ['basic', 'welcome', 'notification', 'system-alert'],
      testEmailAddress: process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Email test service health check failed',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
