'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertCircle, RefreshCw, Database, RotateCw, Trash2 } from 'lucide-react'

interface SetupStatus {
  success: boolean
  setup_status: {
    database_connected: boolean
    tables_exist: boolean
    functions_exist: boolean
    indexes_exist: boolean
    rls_enabled: boolean
    initial_stats: Record<string, unknown> | null
    errors: string[]
    warnings: string[]
  }
  environment_check: {
    supabase_url: boolean
    supabase_service_key: boolean
    cloudinary_cloud_name: boolean
    cloudinary_api_key: boolean
    cloudinary_api_secret: boolean
  }
  next_steps: string[]
}



export default function TestMediaSyncPage() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  /**
   * Check database setup
   */
  const checkSetup = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/setup-media-db')
      const data = await response.json()
      setSetupStatus(data)
      
      if (data.success) {
        addTestResult('✅ Database setup verification passed')
      } else {
        addTestResult('❌ Database setup has issues')
      }
    } catch (error) {
      console.error('Setup check failed:', error)
      addTestResult('❌ Setup check failed: ' + error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Test sync functionality
   */
  const testSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/cloudinary/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, batch_size: 10 })
      })
      
      const data = await response.json()

      
      if (data.success) {
        addTestResult(`✅ Sync completed: ${data.data.synced_items} synced, ${data.data.updated_items} updated`)
      } else {
        addTestResult('❌ Sync failed: ' + data.error)
      }
    } catch (error) {
      console.error('Sync test failed:', error)
      addTestResult('❌ Sync test failed: ' + error)
    } finally {
      setIsSyncing(false)
    }
  }

  /**
   * Test media API
   */
  const testMediaAPI = async () => {
    try {
      addTestResult('🔍 Testing media API...')
      const response = await fetch('/api/cloudinary/media?limit=5')
      const data = await response.json()

      if (data.success) {
        addTestResult(`✅ Media API working: Found ${data.items.length} items`)
        addTestResult(`📊 Stats: ${data.stats.total_files} total files, ${data.stats.total_size} bytes`)
      } else {
        addTestResult('❌ Media API failed: ' + data.error)
      }
    } catch (error) {
      addTestResult('❌ Media API test failed: ' + error)
    }
  }

  /**
   * Add test result
   */
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  /**
   * Clear test results
   */
  const clearResults = () => {
    setTestResults([])
  }

  // Check setup on component mount
  useEffect(() => {
    checkSetup()
  }, [checkSetup])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Media Library Bidirectional Sync Test
            </h1>
            <p className="text-gray-600">
              Verify that your media library is properly configured for enterprise-grade bidirectional sync
            </p>
          </div>

          {/* Setup Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Database Setup Status</h2>
              <button
                onClick={checkSetup}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Checking...' : 'Recheck'}
              </button>
            </div>

            {setupStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    {setupStatus.setup_status.database_connected ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Database Connected</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.setup_status.tables_exist ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Tables Exist</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.setup_status.functions_exist ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Functions Exist</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {setupStatus.environment_check.supabase_url ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Supabase URL</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.environment_check.cloudinary_cloud_name ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>Cloudinary Config</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">Overall Status</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Bidirectional Sync</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Media API */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Database className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">Test Media API</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Test the media API and database connection
                </p>
                <button
                  onClick={testMediaAPI}
                  className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test API
                </button>
              </div>

              {/* Test Sync */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <RotateCw className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-900">Test Sync</h3>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Manually trigger sync from Cloudinary to database
                </p>
                <button
                  onClick={testSync}
                  disabled={isSyncing}
                  className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  <RotateCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Run Sync'}
                </button>
              </div>

              {/* View Database */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Database className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-purple-900">View Database</h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Check media assets in admin panel
                </p>
                <a
                  href="/admin/media"
                  className="w-full inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Open Media Center
                </a>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <button
                onClick={clearResults}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
              <div className="font-mono text-sm text-green-400">
                {testResults.length === 0 ? (
                  <div className="text-gray-500">No test results yet. Run some tests above.</div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {setupStatus && !setupStatus.success && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                {setupStatus.next_steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
