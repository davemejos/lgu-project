/**
 * Email Service - Professional Resend Integration
 * 
 * This service handles all email operations using Resend API.
 * It provides a clean interface for sending various types of emails
 * with proper error handling and logging.
 * 
 * Features:
 * - Welcome emails for new users
 * - Notification emails for system events
 * - Test emails for admin verification
 * - Professional email templates
 * - Error handling and logging
 * 
 * Usage:
 * ```typescript
 * import { EmailService } from '@/lib/emailService'
 * 
 * await EmailService.sendWelcomeEmail('user@example.com', 'John Doe')
 * await EmailService.sendNotification('admin@example.com', 'System Alert', 'Message')
 * ```
 */

import { Resend } from 'resend'
import { WelcomeEmailTemplate } from './email-templates/WelcomeEmailTemplate'
import { NotificationEmailTemplate } from './email-templates/NotificationEmailTemplate'
import { SystemAlertEmailTemplate } from './email-templates/SystemAlertEmailTemplate'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration from environment variables
const EMAIL_CONFIG = {
  fromEmail: process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  fromName: process.env.EMAIL_FROM_NAME || 'LGU Project',
  replyTo: process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev',
  enableNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true'
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface NotificationEmailData {
  recipientName: string
  subject: string
  message: string
  actionUrl?: string
  actionText?: string
}

export interface SystemAlertEmailData {
  recipientName: string
  alertType: 'info' | 'warning' | 'error' | 'success'
  subject: string
  message: string
  details?: string
  timestamp?: Date
}

/**
 * Main Email Service Class
 */
export class EmailService {
  
  /**
   * Check if email notifications are enabled
   */
  static isEmailEnabled(): boolean {
    return EMAIL_CONFIG.enableNotifications
  }

  /**
   * Validate email configuration
   */
  static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!process.env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is not configured')
    }
    
    if (!EMAIL_CONFIG.fromEmail) {
      errors.push('NEXT_PUBLIC_RESEND_FROM_EMAIL is not configured')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
    loginUrl?: string
  ): Promise<EmailResult> {
    try {
      if (!this.isEmailEnabled()) {
        console.log('[EmailService] Email notifications are disabled')
        return { success: true, messageId: 'disabled' }
      }

      const { valid, errors } = this.validateConfig()
      if (!valid) {
        console.error('[EmailService] Configuration errors:', errors)
        return { success: false, error: `Configuration error: ${errors.join(', ')}` }
      }

      console.log(`[EmailService] Sending welcome email to: ${recipientEmail}`)

      const { data, error } = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [recipientEmail],
        subject: `Welcome to ${EMAIL_CONFIG.fromName}!`,
        react: WelcomeEmailTemplate({
          recipientName,
          loginUrl: loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
        }),
        replyTo: EMAIL_CONFIG.replyTo
      })

      if (error) {
        console.error('[EmailService] Error sending welcome email:', error)
        return { success: false, error: error.message }
      }

      console.log(`[EmailService] Welcome email sent successfully. ID: ${data?.id}`)
      return { success: true, messageId: data?.id }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[EmailService] Exception sending welcome email:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send notification email
   */
  static async sendNotification(
    recipientEmail: string,
    emailData: NotificationEmailData
  ): Promise<EmailResult> {
    try {
      if (!this.isEmailEnabled()) {
        console.log('[EmailService] Email notifications are disabled')
        return { success: true, messageId: 'disabled' }
      }

      const { valid, errors } = this.validateConfig()
      if (!valid) {
        console.error('[EmailService] Configuration errors:', errors)
        return { success: false, error: `Configuration error: ${errors.join(', ')}` }
      }

      console.log(`[EmailService] Sending notification email to: ${recipientEmail}`)

      const { data, error } = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [recipientEmail],
        subject: emailData.subject,
        react: NotificationEmailTemplate(emailData),
        replyTo: EMAIL_CONFIG.replyTo
      })

      if (error) {
        console.error('[EmailService] Error sending notification email:', error)
        return { success: false, error: error.message }
      }

      console.log(`[EmailService] Notification email sent successfully. ID: ${data?.id}`)
      return { success: true, messageId: data?.id }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[EmailService] Exception sending notification email:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send system alert email
   */
  static async sendSystemAlert(
    recipientEmail: string,
    emailData: SystemAlertEmailData
  ): Promise<EmailResult> {
    try {
      if (!this.isEmailEnabled()) {
        console.log('[EmailService] Email notifications are disabled')
        return { success: true, messageId: 'disabled' }
      }

      const { valid, errors } = this.validateConfig()
      if (!valid) {
        console.error('[EmailService] Configuration errors:', errors)
        return { success: false, error: `Configuration error: ${errors.join(', ')}` }
      }

      console.log(`[EmailService] Sending system alert email to: ${recipientEmail}`)

      const { data, error } = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [recipientEmail],
        subject: `[${emailData.alertType.toUpperCase()}] ${emailData.subject}`,
        react: SystemAlertEmailTemplate({
          ...emailData,
          timestamp: emailData.timestamp || new Date()
        }),
        replyTo: EMAIL_CONFIG.replyTo
      })

      if (error) {
        console.error('[EmailService] Error sending system alert email:', error)
        return { success: false, error: error.message }
      }

      console.log(`[EmailService] System alert email sent successfully. ID: ${data?.id}`)
      return { success: true, messageId: data?.id }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[EmailService] Exception sending system alert email:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send test email for admin verification
   */
  static async sendTestEmail(recipientEmail: string): Promise<EmailResult> {
    try {
      const { valid, errors } = this.validateConfig()
      if (!valid) {
        console.error('[EmailService] Configuration errors:', errors)
        return { success: false, error: `Configuration error: ${errors.join(', ')}` }
      }

      console.log(`[EmailService] Sending test email to: ${recipientEmail}`)

      const { data, error } = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [recipientEmail],
        subject: `Test Email from ${EMAIL_CONFIG.fromName}`,
        react: NotificationEmailTemplate({
          recipientName: 'Administrator',
          subject: 'Email Service Test',
          message: 'This is a test email to verify that the Resend email service is working correctly. If you receive this email, the integration is successful!',
          actionUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          actionText: 'Go to Dashboard'
        }),
        replyTo: EMAIL_CONFIG.replyTo
      })

      if (error) {
        console.error('[EmailService] Error sending test email:', error)
        return { success: false, error: error.message }
      }

      console.log(`[EmailService] Test email sent successfully. ID: ${data?.id}`)
      return { success: true, messageId: data?.id }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[EmailService] Exception sending test email:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

// Export default instance for convenience
export default EmailService
