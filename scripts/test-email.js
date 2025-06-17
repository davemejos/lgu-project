/**
 * Email Service Test Script
 * 
 * Simple Node.js script to test Resend email integration
 * Run with: node scripts/test-email.js
 */

const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

async function testEmailService() {
  console.log('🧪 Testing Resend Email Service...\n')

  // Check environment variables
  console.log('📋 Environment Check:')
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   FROM_EMAIL: ${process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || '❌ Missing'}`)
  console.log(`   EMAIL_ENABLED: ${process.env.ENABLE_EMAIL_NOTIFICATIONS || '❌ Missing'}`)
  console.log(`   FROM_NAME: ${process.env.EMAIL_FROM_NAME || '❌ Missing'}`)
  console.log('')

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env.local')
    process.exit(1)
  }

  if (!process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL) {
    console.error('❌ NEXT_PUBLIC_RESEND_FROM_EMAIL is not set in .env.local')
    process.exit(1)
  }

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    console.log('📧 Sending test email...')
    
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'LGU Project'} <${process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL}>`,
      to: ['davemejos2020@gmail.com'],
      subject: 'Test Email from LGU Project - Resend Integration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; text-align: center;">🎉 Email Service Test</h1>
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #166534; margin-top: 0;">✅ Success!</h2>
            <p style="color: #166534; margin-bottom: 0;">
              Your Resend email integration is working correctly! This test email was sent from your LGU Project application.
            </p>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Test Details:</h3>
            <ul style="color: #374151;">
              <li><strong>Service:</strong> Resend Email API</li>
              <li><strong>From:</strong> ${process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
            </ul>
          </div>
          <p style="color: #6b7280; text-align: center; font-size: 14px;">
            This email was sent by the LGU Project Email Service Test Script
          </p>
        </div>
      `
    })

    if (error) {
      console.error('❌ Failed to send email:', error)
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log(`   Message ID: ${data.id}`)
    console.log(`   To: davemejos2020@gmail.com`)
    console.log(`   From: ${process.env.EMAIL_FROM_NAME} <${process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL}>`)
    console.log('')
    console.log('🎉 Resend integration is working correctly!')
    console.log('📧 Check your email inbox for the test message.')

  } catch (error) {
    console.error('❌ Error testing email service:', error.message)
    process.exit(1)
  }
}

// Run the test
testEmailService()
