/**
 * Email Send API Route
 * 
 * Professional API endpoint for sending emails through Resend
 * Supports multiple email types with proper validation and error handling
 * 
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailService } from '@/lib/emailService'
import { createClient } from '@/utils/supabase/server'

// Validation schemas
const baseEmailSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  recipientName: z.string().min(1, 'Recipient name is required')
})

const welcomeEmailSchema = baseEmailSchema.extend({
  type: z.literal('welcome'),
  loginUrl: z.string().url().optional()
})

const notificationEmailSchema = baseEmailSchema.extend({
  type: z.literal('notification'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional()
})

const systemAlertEmailSchema = baseEmailSchema.extend({
  type: z.literal('system-alert'),
  alertType: z.enum(['info', 'warning', 'error', 'success']),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  details: z.string().optional(),
  timestamp: z.string().datetime().optional()
})

const testEmailSchema = z.object({
  type: z.literal('test'),
  recipientEmail: z.string().email('Invalid email address')
})

const emailRequestSchema = z.discriminatedUnion('type', [
  welcomeEmailSchema,
  notificationEmailSchema,
  systemAlertEmailSchema,
  testEmailSchema
])

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
    const validatedData = emailRequestSchema.parse(body)

    console.log(`[EmailAPI] Processing ${validatedData.type} email request from user: ${user.email}`)

    let result

    // Handle different email types
    switch (validatedData.type) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(
          validatedData.recipientEmail,
          validatedData.recipientName,
          validatedData.loginUrl
        )
        break

      case 'notification':
        result = await EmailService.sendNotification(
          validatedData.recipientEmail,
          {
            recipientName: validatedData.recipientName,
            subject: validatedData.subject,
            message: validatedData.message,
            actionUrl: validatedData.actionUrl,
            actionText: validatedData.actionText
          }
        )
        break

      case 'system-alert':
        result = await EmailService.sendSystemAlert(
          validatedData.recipientEmail,
          {
            recipientName: validatedData.recipientName,
            alertType: validatedData.alertType,
            subject: validatedData.subject,
            message: validatedData.message,
            details: validatedData.details,
            timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date()
          }
        )
        break

      case 'test':
        result = await EmailService.sendTestEmail(validatedData.recipientEmail)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Return result
    if (result.success) {
      console.log(`[EmailAPI] Email sent successfully. Message ID: ${result.messageId}`)
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      })
    } else {
      console.error(`[EmailAPI] Failed to send email: ${result.error}`)
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[EmailAPI] Validation error:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[EmailAPI] Unexpected error:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// GET method for health check
export async function GET() {
  try {
    const configValidation = EmailService.validateConfig()
    
    return NextResponse.json({
      status: 'Email service is running',
      emailEnabled: EmailService.isEmailEnabled(),
      configuration: {
        valid: configValidation.valid,
        errors: configValidation.errors
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Email service health check failed',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
