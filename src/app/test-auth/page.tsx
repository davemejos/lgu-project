/**
 * Supabase Authentication Test Page
 * 
 * This page tests the new Supabase authentication system
 * and provides debugging information for development.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/SupabaseAuthProvider'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function TestAuthPage() {
  const { user, session, loading, signOut } = useAuth()
  const [authTests, setAuthTests] = useState<Array<{
    name: string;
    status: 'success' | 'error' | 'running';
    message: string;
    details?: unknown;
  }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const supabase = createClient()

  const runAuthTests = useCallback(async () => {
    setIsRunning(true)
    const tests = []

    // Test 1: Check if Supabase client is initialized
    tests.push({
      name: 'Supabase Client Initialization',
      status: !!supabase ? 'success' as const : 'error' as const,
      message: !!supabase ? 'Client initialized successfully' : 'Client failed to initialize'
    })

    // Test 2: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    tests.push({
      name: 'Environment Variables',
      status: hasUrl && hasKey ? 'success' as const : 'error' as const,
      message: `URL: ${hasUrl ? 'Set' : 'Missing'}, Key: ${hasKey ? 'Set' : 'Missing'}`
    })

    // Test 3: Check current session
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      tests.push({
        name: 'Session Check',
        status: 'success' as const,
        message: currentSession ? `User: ${currentSession.user.email}` : 'No active session'
      })
    } catch (error) {
      tests.push({
        name: 'Session Check',
        status: 'error' as const,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // Test 4: Check auth state listener
    tests.push({
      name: 'Auth State Listener',
      status: user !== undefined ? 'success' as const : 'error' as const,
      message: user ? `Listening for user: ${user.email}` : 'No user detected'
    })

    // Test 5: Check middleware protection
    tests.push({
      name: 'Middleware Protection',
      status: 'running' as const,
      message: 'Visit /admin to test route protection'
    })

    setAuthTests(tests)
    setIsRunning(false)
  }, [user, supabase])

  useEffect(() => {
    runAuthTests()
  }, [user, session, runAuthTests])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'running': return 'ℹ️'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Supabase Authentication Test
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Test and debug the new Supabase authentication system
            </p>
          </div>

          <div className="p-6">
            {/* Current Auth State */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Authentication State</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Loading:</p>
                    <p className="text-sm text-gray-900">{loading ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">User:</p>
                    <p className="text-sm text-gray-900">{user ? user.email : 'Not authenticated'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Session:</p>
                    <p className="text-sm text-gray-900">{session ? 'Active' : 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">User ID:</p>
                    <p className="text-sm text-gray-900">{user?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Tests */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Authentication Tests</h2>
                <button
                  onClick={runAuthTests}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Tests'}
                </button>
              </div>

              <div className="space-y-3">
                {authTests.map((test, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getStatusIcon(test.status)}</span>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                          <p className="text-sm text-gray-600">{test.message}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Go to Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Go to Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Go to Admin Dashboard
                    </Link>
                    <button
                      onClick={signOut}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </>
                )}
                <Link
                  href="/test-supabase"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Database Tests
                </Link>
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
              <p className="text-sm text-blue-700">
                Email: <code className="bg-blue-100 px-1 rounded">demo@admin.com</code>
              </p>
              <p className="text-sm text-blue-700">
                Password: <code className="bg-blue-100 px-1 rounded">demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
