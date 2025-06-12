/**
 * Health Check Page
 * This page helps diagnose deployment issues by showing environment status
 */

import Link from 'next/link'

export default function HealthPage() {
  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    googleAI: !!process.env.GOOGLE_AI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Application Health Check
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Environment Variables Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(envStatus).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      value 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {typeof value === 'boolean' ? (value ? '✓ Set' : '✗ Missing') : value || 'Not Set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Application Status
              </h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">
                  ✓ Application is running successfully
                </p>
                <p className="text-sm text-green-600 mt-1">
                  If you can see this page, your Next.js deployment is working.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                >
                  → Go to Home Page
                </Link>
                <Link
                  href="/admin"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                >
                  → Go to Admin Panel
                </Link>
                <Link
                  href="/auth/login"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                >
                  → Go to Login Page
                </Link>
              </div>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>This page can be accessed at: /health</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
