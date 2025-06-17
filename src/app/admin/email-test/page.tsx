/**
 * Email Test Page
 * 
 * Professional admin page for testing Resend email integration
 * Allows administrators to send test emails and verify functionality
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Form validation schema
const testEmailSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  testType: z.enum(['basic', 'welcome', 'notification', 'system-alert'])
})

type TestEmailForm = z.infer<typeof testEmailSchema>

interface TestResult {
  success: boolean
  messageId?: string
  error?: string
  testType?: string
  timestamp?: string
}

export default function EmailTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [serviceStatus, setServiceStatus] = useState<{
    emailEnabled: boolean;
    configuration?: {
      valid: boolean;
      errors?: string[];
    };
    availableTestTypes?: string[];
    error?: string;
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm<TestEmailForm>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      recipientEmail: 'davemejos2020@gmail.com',
      testType: 'basic'
    }
  })

  // Check service status
  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/email/test')
      const data = await response.json()
      setServiceStatus(data)
    } catch (error) {
      console.error('Error checking service status:', error)
      setServiceStatus({ emailEnabled: false, error: 'Failed to check service status' })
    }
  }

  // Send test email
  const onSubmit = async (data: TestEmailForm) => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          messageId: result.messageId,
          testType: result.testType,
          timestamp: result.timestamp
        })
      } else {
        setTestResult({
          success: false,
          error: result.error || 'Failed to send test email'
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Service Test</h1>
          <p className="mt-2 text-gray-600">
            Test the Resend email integration and verify that emails are being sent correctly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Test Email</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  {...register('recipientEmail')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.recipientEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientEmail.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type
                </label>
                <select
                  {...register('testType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic Test Email</option>
                  <option value="welcome">Welcome Email Template</option>
                  <option value="notification">Notification Email Template</option>
                  <option value="system-alert">System Alert Email Template</option>
                </select>
                {errors.testType && (
                  <p className="mt-1 text-sm text-red-600">{errors.testType.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </button>
            </form>

            {/* Test Result */}
            {testResult && (
              <div className={`mt-6 p-4 rounded-md ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? '✅ Email Sent Successfully' : '❌ Email Failed'}
                </h3>
                <div className={`mt-2 text-sm ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.success ? (
                    <div>
                      <p><strong>Message ID:</strong> {testResult.messageId}</p>
                      <p><strong>Test Type:</strong> {testResult.testType}</p>
                      <p><strong>Timestamp:</strong> {testResult.timestamp}</p>
                    </div>
                  ) : (
                    <p><strong>Error:</strong> {testResult.error}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
              <button
                onClick={checkServiceStatus}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Refresh
              </button>
            </div>

            {serviceStatus ? (
              <div className="space-y-3">
                {serviceStatus.error ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">❌ {serviceStatus.error}</p>
                  </div>
                ) : (
                  <>
                    <div className={`p-3 rounded-md ${
                      serviceStatus.emailEnabled 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        serviceStatus.emailEnabled ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {serviceStatus.emailEnabled ? '✅ Email Enabled' : '⚠️ Email Disabled'}
                      </p>
                    </div>

                    <div className={`p-3 rounded-md ${
                      serviceStatus.configuration?.valid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        serviceStatus.configuration?.valid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {serviceStatus.configuration?.valid ? '✅ Configuration Valid' : '❌ Configuration Invalid'}
                      </p>
                      {serviceStatus.configuration?.errors && serviceStatus.configuration.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-700">
                          {serviceStatus.configuration.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {serviceStatus.availableTestTypes && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800 mb-2">Available Test Types:</p>
                        <ul className="text-sm text-blue-700">
                          {serviceStatus.availableTestTypes.map((type: string) => (
                            <li key={type}>• {type}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click &quot;Refresh&quot; to check service status</p>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900">Basic Test</h3>
              <p className="text-sm text-gray-600 mt-1">Simple test email with basic content</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900">Welcome Email</h3>
              <p className="text-sm text-gray-600 mt-1">Professional welcome email for new users</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900">Notification</h3>
              <p className="text-sm text-gray-600 mt-1">General notification email template</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900">System Alert</h3>
              <p className="text-sm text-gray-600 mt-1">Critical system alert with styling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
