import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 404 Icon */}
        <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Search className="h-10 w-10 text-blue-600" />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600">
            The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/admin"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Admin Dashboard
          </Link>

          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
