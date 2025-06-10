/**
 * Legacy Sign-in Page Redirect
 *
 * This page redirects to the new Supabase authentication login page
 * to maintain backward compatibility with existing links.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Get any redirect parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get('redirectTo')

    // Redirect to the new login page with parameters preserved
    const newUrl = redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login'

    router.replace(newUrl)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Redirecting to Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we redirect you to the new authentication system...
          </p>
        </div>
      </div>
    </div>
  )
}
