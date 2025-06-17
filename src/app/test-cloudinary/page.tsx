/**
 * Cloudinary Integration Test Page
 * 
 * This page is for testing the Cloudinary integration in the LGU Project.
 * It provides a simple interface to test upload functionality and verify
 * that images appear in the Cloudinary Media Library.
 * 
 * Features tested:
 * - Upload Widget functionality
 * - Image display with transformations
 * - Error handling
 * - Success callbacks
 */

'use client'

import { useState } from 'react'
import { Upload, CheckCircle, XCircle, Image as ImageIcon, Trash2 } from 'lucide-react'
import CloudinaryUploadWidget, { CloudinaryUploadResult } from '@/components/CloudinaryUploadWidget'
import { CloudinaryImagePresets } from '@/components/CloudinaryImage'

interface UploadedImage {
  id: string
  public_id: string
  url: string
  secure_url: string
  original_filename?: string
  format: string
  bytes: number
  width?: number
  height?: number
  created_at: string
}

export default function TestCloudinaryPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [apiTestMessage, setApiTestMessage] = useState('')

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    console.log('✅ Upload successful:', result)
    
    const newImage: UploadedImage = {
      id: result.info.public_id,
      public_id: result.info.public_id,
      url: result.info.url,
      secure_url: result.info.secure_url,
      original_filename: result.info.original_filename,
      format: result.info.format,
      bytes: result.info.bytes,
      width: result.info.width,
      height: result.info.height,
      created_at: result.info.created_at
    }

    setUploadedImages(prev => [newImage, ...prev])
    setUploadStatus('success')
    setUploadMessage(`Successfully uploaded: ${result.info.original_filename || result.info.public_id}`)
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle')
      setUploadMessage('')
    }, 3000)
  }

  /**
   * Handle upload error
   */
  const handleUploadError = (error: { message?: string }) => {
    console.error('❌ Upload failed:', error)
    setUploadStatus('error')
    setUploadMessage(`Upload failed: ${error.message || 'Unknown error'}`)
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      setUploadStatus('idle')
      setUploadMessage('')
    }, 5000)
  }

  /**
   * Handle upload widget open
   */
  const handleUploadOpen = () => {
    setUploadStatus('uploading')
    setUploadMessage('Upload widget opened...')
  }

  /**
   * Handle upload widget close
   */
  const handleUploadClose = () => {
    if (uploadStatus === 'uploading') {
      setUploadStatus('idle')
      setUploadMessage('')
    }
  }

  /**
   * Test API connectivity
   */
  const testApiConnectivity = async () => {
    setApiTestStatus('testing')
    setApiTestMessage('Testing Cloudinary API connectivity...')

    try {
      const response = await fetch('/api/test-cloudinary')
      const result = await response.json()

      if (result.success) {
        setApiTestStatus('success')
        setApiTestMessage('✅ API connectivity test passed!')
      } else {
        setApiTestStatus('error')
        setApiTestMessage(`❌ API test failed: ${result.error}`)
      }
    } catch (error) {
      setApiTestStatus('error')
      setApiTestMessage(`❌ API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setApiTestStatus('idle')
      setApiTestMessage('')
    }, 5000)
  }

  /**
   * Test upload functionality via API
   */
  const testApiUpload = async () => {
    setApiTestStatus('testing')
    setApiTestMessage('Testing upload functionality via API...')

    try {
      const response = await fetch('/api/test-cloudinary', { method: 'POST' })
      const result = await response.json()

      if (result.success) {
        setApiTestStatus('success')
        setApiTestMessage('✅ Upload test passed!')
      } else {
        setApiTestStatus('error')
        setApiTestMessage(`❌ Upload test failed: ${result.error}`)
      }
    } catch (error) {
      setApiTestStatus('error')
      setApiTestMessage(`❌ Upload test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setApiTestStatus('idle')
      setApiTestMessage('')
    }, 5000)
  }

  /**
   * Remove image from list
   */
  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cloudinary Integration Test
            </h1>
            <p className="text-gray-600 mb-6">
              Test the Cloudinary upload functionality and verify images appear in your Media Library
            </p>
            
            {/* Upload Widget */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-wrap gap-4 justify-center">
                <CloudinaryUploadWidget
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  onOpen={handleUploadOpen}
                  onClose={handleUploadClose}
                  folder="lgu-uploads/test"
                  multiple={true}
                  maxFiles={5}
                  buttonText="Test Upload Widget"
                  variant="primary"
                  size="lg"
                />

                <button
                  onClick={testApiConnectivity}
                  disabled={apiTestStatus === 'testing'}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {apiTestStatus === 'testing' ? 'Testing...' : 'Test API Connection'}
                </button>

                <button
                  onClick={testApiUpload}
                  disabled={apiTestStatus === 'testing'}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {apiTestStatus === 'testing' ? 'Testing...' : 'Test API Upload'}
                </button>
              </div>

              {/* Status Messages */}
              {uploadMessage && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  uploadStatus === 'success' ? 'bg-green-100 text-green-700' :
                  uploadStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {getStatusIcon()}
                  <span className="text-sm font-medium">{uploadMessage}</span>
                </div>
              )}

              {apiTestMessage && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  apiTestStatus === 'success' ? 'bg-green-100 text-green-700' :
                  apiTestStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {apiTestStatus === 'testing' && <Upload className="h-5 w-5 animate-pulse" />}
                  {apiTestStatus === 'success' && <CheckCircle className="h-5 w-5" />}
                  {apiTestStatus === 'error' && <XCircle className="h-5 w-5" />}
                  <span className="text-sm font-medium">{apiTestMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cloud Name:</span>
              <span className="ml-2 text-gray-600">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Upload Preset:</span>
              <span className="ml-2 text-gray-600">lgu_project</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Upload Folder:</span>
              <span className="ml-2 text-gray-600">lgu-uploads/test</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Uploads:</span>
              <span className="ml-2 text-gray-600">{uploadedImages.length}</span>
            </div>
          </div>
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Uploaded Images ({uploadedImages.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <CloudinaryImagePresets.Thumbnail
                      src={image.public_id}
                      alt={image.original_filename || 'Uploaded image'}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {image.original_filename || 'Untitled'}
                      </h3>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Format: {image.format.toUpperCase()}</div>
                      <div>Size: {formatFileSize(image.bytes)}</div>
                      {image.width && image.height && (
                        <div>Dimensions: {image.width} × {image.height}</div>
                      )}
                      <div>Public ID: {image.public_id}</div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <a
                        href={image.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        View Original
                      </a>
                      <a
                        href={`https://console.cloudinary.com/console/c-${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/media_library/search?q=${encodeURIComponent(image.public_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                      >
                        View in Cloudinary
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uploadedImages.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h3>
            <p className="text-gray-500">
              Upload some images using the button above to test the Cloudinary integration
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
