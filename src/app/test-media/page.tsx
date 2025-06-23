'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Database, RefreshCw, Image, CheckCircle, AlertCircle } from 'lucide-react'
import NextImage from 'next/image'

export default function TestMediaPage() {
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' | 'info' }>()
  const [mediaItems, setMediaItems] = useState<Array<{
    secure_url: string;
    original_filename?: string;
    cloudinary_public_id: string;
    format?: string;
    file_size: number;
    width?: number;
    height?: number;
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const showResult = (message: string, type: 'success' | 'error' | 'info') => {
    setResult({ message, type })
  }

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'test-uploads')
    formData.append('description', 'Test upload from test page')

    try {
      setIsLoading(true)
      showResult('Uploading...', 'info')

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        showResult(
          `✅ Upload successful!\nPublic ID: ${result.data.public_id}\nDatabase Sync: ${
            result.database_sync?.success ? '✅ Success' : '❌ Failed'
          }${result.warnings?.length ? '\nWarnings: ' + result.warnings.join(', ') : ''}`,
          'success'
        )
        // Reload media after successful upload
        loadMedia()
      } else {
        showResult(`❌ Upload failed: ${result.error || 'Unknown error'}`, 'error')
      }
    } catch (error) {
      showResult(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabase = useCallback(async () => {
    try {
      setIsLoading(true)
      showResult('Testing database...', 'info')

      const response = await fetch('/api/setup-media-db')
      const result = await response.json()

      if (result.success) {
        showResult('✅ Database is properly configured!', 'success')
      } else {
        showResult(`⚠️ Database issues: ${result.message}`, 'error')
      }
    } catch (error) {
      showResult(`❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const testSync = async () => {
    try {
      setIsLoading(true)
      showResult('Testing sync...', 'info')

      const response = await fetch('/api/cloudinary/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (result.success) {
        showResult(
          `✅ Sync successful! Synced: ${result.data.synced_items}, Updated: ${result.data.updated_items}`,
          'success'
        )
      } else {
        showResult(`⚠️ Sync completed with issues: ${result.message}`, 'error')
      }
    } catch (error) {
      showResult(`❌ Sync test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedia = async () => {
    try {
      setIsLoading(true)
      showResult('Loading media...', 'info')

      const response = await fetch('/api/cloudinary/media')
      const result = await response.json()

      if (result.success && result.items.length > 0) {
        showResult(`✅ Found ${result.items.length} media items`, 'success')
        setMediaItems(result.items)
      } else {
        showResult(
          `📭 No media items found. Database ready: ${result.database_setup?.ready}`,
          'info'
        )
        setMediaItems([])
      }
    } catch (error) {
      showResult(`❌ Load media failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-test database on component mount
  useEffect(() => {
    testDatabase()
  }, [testDatabase])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            🧪 Media Library Test
          </h1>
          <p className="text-gray-600 mb-8">Test file upload and database persistence</p>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={uploadFile}
              className="mb-4"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">Select an image or video file to test upload</p>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testDatabase}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Database className="h-4 w-4 mr-2" />
              Test Database
            </button>
            <button
              onClick={testSync}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Sync
            </button>
            <button
              onClick={loadMedia}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Image className="h-4 w-4 mr-2" aria-label="Load media" />
              Load Media
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                result.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : result.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start">
                {result.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                ) : result.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2 mt-0.5 animate-spin" />
                )}
                <pre className="whitespace-pre-wrap text-sm">{result.message}</pre>
              </div>
            </div>
          )}

          {/* Media Items Display */}
          {mediaItems.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Media Items ({mediaItems.length})</h3>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 break-inside-avoid mb-4">
                    <NextImage
                      src={item.secure_url}
                      alt={item.original_filename || item.cloudinary_public_id}
                      width={300}
                      height={200}
                      className="w-full h-auto object-contain rounded mb-2"
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                    <h4 className="font-medium text-sm truncate">
                      {item.original_filename || item.cloudinary_public_id}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.format?.toUpperCase()} • {(item.file_size / 1024).toFixed(1)} KB
                    </p>
                    {item.width && item.height && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.width} × {item.height} px
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-600">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
