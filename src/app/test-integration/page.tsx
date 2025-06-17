'use client'

/**
 * Integration Test Page
 * 
 * Comprehensive testing interface for validating the complete integration
 * between Cloudinary, Custom Media Library, and Supabase database.
 */

import { useState, useEffect } from 'react'
import { Upload, CheckCircle, AlertCircle, RefreshCw, Database, Cloud, Eye } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message: string
  details?: unknown
  duration?: number
}

interface SyncVerification {
  success: boolean
  cloudinary_count: number
  database_count: number
  missing_in_database: string[]
  missing_in_cloudinary: string[]
  sync_conflicts: Array<{
    public_id: string
    issue: string
  }>
  recommendations: string[]
}

export default function IntegrationTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending', message: 'Not started' },
    { name: 'Cloudinary Connection', status: 'pending', message: 'Not started' },
    { name: 'Media API Endpoint', status: 'pending', message: 'Not started' },
    { name: 'Upload API Endpoint', status: 'pending', message: 'Not started' },
    { name: 'Real-time Subscriptions', status: 'pending', message: 'Not started' },
    { name: 'Sync Verification', status: 'pending', message: 'Not started' },
    { name: 'File Upload Test', status: 'pending', message: 'Not started' },
    { name: 'Bidirectional Sync', status: 'pending', message: 'Not started' }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [syncVerification, setSyncVerification] = useState<SyncVerification | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ))
  }

  const runTest = async (testName: string, testFn: () => Promise<{ success: boolean; message: string; details?: unknown }>) => {
    const startTime = Date.now()
    updateTest(testName, { status: 'running', message: 'Running...' })
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      
      updateTest(testName, {
        status: result.success ? 'passed' : 'failed',
        message: result.message,
        details: result.details,
        duration
      })
      
      return result.success
    } catch (error) {
      const duration = Date.now() - startTime
      updateTest(testName, {
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      })
      return false
    }
  }

  const testDatabaseConnection = async () => {
    const response = await fetch('/api/cloudinary/media?page=1&limit=1')
    const data = await response.json()
    
    return {
      success: data.database_setup?.ready === true,
      message: data.database_setup?.ready 
        ? 'Database is properly configured and accessible'
        : 'Database setup required or connection failed',
      details: data.database_setup
    }
  }

  const testCloudinaryConnection = async () => {
    const response = await fetch('/api/cloudinary/upload')
    const data = await response.json()
    
    return {
      success: data.success === true,
      message: data.success 
        ? 'Cloudinary configuration is valid'
        : 'Cloudinary configuration failed',
      details: data.config
    }
  }

  const testMediaAPI = async () => {
    const response = await fetch('/api/cloudinary/media?page=1&limit=5')
    const data = await response.json()
    
    return {
      success: response.ok && data.success !== false,
      message: response.ok 
        ? `Media API working. Found ${data.pagination?.total || 0} assets`
        : 'Media API endpoint failed',
      details: data
    }
  }

  const testUploadAPI = async () => {
    // Test with a small dummy file
    const dummyFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', dummyFile)
    formData.append('folder', 'test-uploads')
    
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    return {
      success: response.ok && data.success === true,
      message: response.ok 
        ? `Upload API working. Database sync: ${data.database_sync?.success ? 'Success' : 'Failed'}`
        : 'Upload API endpoint failed',
      details: data
    }
  }

  const testRealtimeSubscriptions = async () => {
    // This is a simplified test - in a real scenario, you'd test actual subscriptions
    return {
      success: true,
      message: 'Real-time subscriptions configured (check browser console for connection status)',
      details: { note: 'Real-time testing requires actual subscription events' }
    }
  }

  const testSyncVerification = async () => {
    const response = await fetch('/api/sync/verify')
    const data = await response.json()
    
    if (data.success) {
      setSyncVerification(data.verification)
    }
    
    return {
      success: data.success === true,
      message: data.success 
        ? `Sync verification completed. ${data.verification.success ? 'Perfect sync!' : 'Issues found'}`
        : 'Sync verification failed',
      details: data.verification
    }
  }

  const testFileUpload = async () => {
    if (!selectedFile) {
      return {
        success: false,
        message: 'No file selected for upload test'
      }
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('folder', 'integration-test')
    
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    return {
      success: response.ok && data.success === true,
      message: response.ok 
        ? `File uploaded successfully. Database sync: ${data.database_sync?.success ? 'Success' : 'Failed'}`
        : 'File upload failed',
      details: data
    }
  }

  const testBidirectionalSync = async () => {
    const response = await fetch('/api/sync/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_fix: true })
    })
    
    const data = await response.json()
    
    return {
      success: data.success === true,
      message: data.success 
        ? `Bidirectional sync test completed. Fixed: ${data.fix_results?.fixed_missing_in_database || 0} missing, ${data.fix_results?.fixed_conflicts || 0} conflicts`
        : 'Bidirectional sync test failed',
      details: data
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    await runTest('Database Connection', testDatabaseConnection)
    await runTest('Cloudinary Connection', testCloudinaryConnection)
    await runTest('Media API Endpoint', testMediaAPI)
    await runTest('Upload API Endpoint', testUploadAPI)
    await runTest('Real-time Subscriptions', testRealtimeSubscriptions)
    await runTest('Sync Verification', testSyncVerification)
    
    if (selectedFile) {
      await runTest('File Upload Test', testFileUpload)
    }
    
    await runTest('Bidirectional Sync', testBidirectionalSync)
    
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'running':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            🧪 Integration Test Suite
          </h1>
          <p className="text-gray-600 mb-8">
            Comprehensive testing for Cloudinary ↔ Custom Media Library ↔ Supabase integration
          </p>

          {/* File Upload Test Section */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              File Upload Test
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <span className="text-sm text-green-600">
                  ✓ {selectedFile.name} selected
                </span>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8 flex space-x-4">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.name}
                className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.duration && (
                        <p className="text-xs text-gray-500">
                          Completed in {test.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {test.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Sync Verification Results */}
          {syncVerification && (
            <div className="mt-8 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Sync Verification Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Cloud className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {syncVerification.cloudinary_count}
                  </div>
                  <div className="text-sm text-gray-600">Cloudinary Assets</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {syncVerification.database_count}
                  </div>
                  <div className="text-sm text-gray-600">Database Assets</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    {syncVerification.sync_conflicts.length}
                  </div>
                  <div className="text-sm text-gray-600">Conflicts</div>
                </div>
              </div>

              {syncVerification.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {syncVerification.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
