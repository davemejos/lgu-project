'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Global Error]:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Application Error
              </h1>
              <p className="text-lg text-gray-600">
                We encountered a critical error. Please try refreshing the page.
              </p>
              
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                  <p className="text-sm text-red-700 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </button>

              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-500">
              <p>
                If this problem persists, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
