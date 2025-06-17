'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Database, ExternalLink, Copy, RefreshCw } from 'lucide-react'

export default function QuickSetupPage() {
  const [setupStatus, setSetupStatus] = useState<{
    success: boolean;
    setup_status?: {
      database_connected: boolean;
      tables_exist: boolean;
      functions_exist: boolean;
    };
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const checkSetup = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/setup-media-db')
      const data = await response.json()
      setSetupStatus(data)
    } catch (error) {
      console.error('Setup check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const runSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/cloudinary/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, batch_size: 50 })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ Sync completed! ${data.data.synced_items} items synced to database.`)
        // Recheck setup after sync
        await checkSetup()
      } else {
        alert('❌ Sync failed: ' + data.error)
      }
    } catch (error) {
      alert('❌ Sync error: ' + error)
    } finally {
      setIsSyncing(false)
    }
  }

  const copyScript = () => {
    const scriptContent = `-- Copy this entire script and run it in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/lkolpgpmdculqqfqyzaf/sql

-- This will create all the media library tables and functions
-- After running this, click "Run Sync" below to import your Cloudinary files

-- The complete script is in: docs/full-complete-supabase-script.md
-- Copy the ENTIRE content of that file and paste it in Supabase SQL Editor`

    navigator.clipboard.writeText(scriptContent).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Quick Media Library Setup
            </h1>
            <p className="text-gray-600">
              Fix the persistence issue in 2 simple steps
            </p>
          </div>

          {/* Current Issue */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">🔍 Current Issue:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✅ Files upload to Cloudinary successfully</li>
              <li>❌ Files don&apos;t persist in custom media library after refresh</li>
              <li>🔧 <strong>Cause:</strong> Database tables not set up yet</li>
            </ul>
          </div>

          {/* Step 1: Check Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Check Database Status</h2>
              <button
                onClick={checkSetup}
                disabled={isChecking}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Status'}
              </button>
            </div>

            {setupStatus && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    {setupStatus.setup_status?.database_connected ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span>Database Connected</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.setup_status?.tables_exist ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span>Media Tables</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.setup_status?.functions_exist ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span>Database Functions</span>
                  </div>
                  <div className="flex items-center">
                    {setupStatus.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">Ready for Sync</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Setup Database */}
          {setupStatus && !setupStatus.success && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Set Up Database</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">📋 Instructions:</h3>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li>1. Open Supabase SQL Editor (link below)</li>
                    <li>2. Copy the complete script from <code>docs/full-complete-supabase-script.md</code></li>
                    <li>3. Paste and run the entire script</li>
                    <li>4. Come back and click &quot;Check Status&quot; again</li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <a
                    href="https://supabase.com/dashboard/project/lkolpgpmdculqqfqyzaf/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase SQL Editor
                  </a>
                  
                  <button
                    onClick={copyScript}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copySuccess ? 'Copied!' : 'Copy Instructions'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Sync Files */}
          {setupStatus && setupStatus.success && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Sync Existing Files</h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 mb-4">
                  ✅ Database is ready! Now sync your existing Cloudinary files to the database.
                </p>
                <button
                  onClick={runSync}
                  disabled={isSyncing}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Database className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Run Sync from Cloudinary'}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {setupStatus && setupStatus.success && (
            <div className="text-center">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  🎉 Setup Complete!
                </h3>
                <p className="text-green-800 mb-4">
                  Your media library is now ready with persistent storage.
                </p>
                <div className="space-x-3">
                  <a
                    href="/admin/media"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Open Media Library
                  </a>
                  <a
                    href="/test-media-sync"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Full Tests
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Auto-check on load */}
          {!setupStatus && (
            <div className="text-center">
              <button
                onClick={checkSetup}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Database className="h-5 w-5 mr-2" />
                Start Setup Check
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
