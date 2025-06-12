/**
 * Client-Side Authentication Guard
 * 
 * This component protects routes by checking authentication status
 * and redirecting to login if user is not authenticated.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/SupabaseAuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated, redirect to login
        const currentPath = window.location.pathname
        const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
        router.push(loginUrl)
      } else {
        // User is authenticated or auth not required
        setIsChecking(false)
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading state while checking authentication
  if (loading || (requireAuth && isChecking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show error state if authentication is required but user is not authenticated
  if (requireAuth && !user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">Please sign in to access this page.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push(redirectTo)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render children if authentication check passes
  return <>{children}</>
}
