/**
 * Upload Progress Indicator - Phase 2 Implementation
 * 
 * Real-time upload progress tracking component with:
 * - Live progress bars
 * - Status indicators
 * - Error handling
 * - Optimistic UI feedback
 * 
 * @author LGU Project Team
 * @version 2.0.0
 */

'use client'

import { useAppSelector } from '@/lib/store'
import { CheckCircle, AlertCircle, Upload, Loader2, X } from 'lucide-react'

interface UploadProgressIndicatorProps {
  className?: string
  showCompleted?: boolean
  autoHide?: boolean
}

export default function UploadProgressIndicator({
  className = '',
  showCompleted = true,
  autoHide = true
}: UploadProgressIndicatorProps) {
  const uploads = useAppSelector(state => state.media.uploads)
  
  const uploadEntries = Object.entries(uploads)
  const activeUploads = uploadEntries.filter(([, progress]) =>
    progress.status !== 'complete' || showCompleted
  )

  // Auto-hide when no active uploads
  if (autoHide && activeUploads.length === 0) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 space-y-2 ${className}`}>
      {activeUploads.map(([tempId, progress]) => (
        <UploadProgressItem
          key={tempId}
          tempId={tempId}
          progress={progress}
        />
      ))}
    </div>
  )
}

interface UploadProgress {
  status: 'uploading' | 'processing' | 'syncing' | 'complete' | 'error' | 'verifying'
  progress: number
  file_name: string
  public_id?: string
  error_message?: string
  sync_status?: 'pending' | 'synced' | 'error'
  database_synced?: boolean
  cloudinary_synced?: boolean
  retry_count?: number
}

interface UploadProgressItemProps {
  tempId: string
  progress: UploadProgress
}

function UploadProgressItem({ progress }: UploadProgressItemProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'syncing':
        return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
      case 'verifying':
        return <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
      case 'complete':
        if (progress.database_synced && progress.cloudinary_synced) {
          return <CheckCircle className="h-4 w-4 text-green-500" />
        } else {
          return <AlertCircle className="h-4 w-4 text-yellow-500" />
        }
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Upload className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'uploading':
        return 'bg-blue-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'syncing':
        return 'bg-purple-500'
      case 'complete':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return 'Uploading to Cloudinary...'
      case 'processing':
        return 'Processing upload...'
      case 'syncing':
        return 'Syncing to database...'
      case 'verifying':
        return 'Verifying sync integrity...'
      case 'complete':
        if (progress.database_synced && progress.cloudinary_synced) {
          return '✅ Upload complete & synced!'
        } else if (progress.database_synced) {
          return '⚠️ Uploaded but sync pending'
        } else {
          return '⚠️ Upload complete, sync failed'
        }
      case 'error':
        const retryText = progress.retry_count ? ` (Retry ${progress.retry_count})` : ''
        return progress.error_message || `Upload failed${retryText}`
      default:
        return 'Preparing...'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {progress.file_name}
            </p>
            {progress.status === 'complete' && (
              <button
                onClick={() => {
                  // Dispatch clear progress action
                  // This would be handled by the parent component
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            {getStatusText()}
          </p>
          
          {progress.status !== 'error' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          )}
          
          {progress.status !== 'error' && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.progress}%</span>
              {progress.public_id && (
                <span className="truncate ml-2">ID: {progress.public_id}</span>
              )}
            </div>
          )}
          
          {progress.status === 'error' && progress.error_message && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {progress.error_message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Upload Progress for Inline Display
 */
export function CompactUploadProgress({ className = '' }: { className?: string }) {
  const uploads = useAppSelector(state => state.media.uploads)
  const uploadEntries = Object.entries(uploads)
  const activeUploads = uploadEntries.filter(([, progress]) =>
    progress.status !== 'complete'
  )

  if (activeUploads.length === 0) {
    return null
  }

  const totalProgress = activeUploads.reduce((sum, [, progress]) => sum + progress.progress, 0)
  const averageProgress = totalProgress / activeUploads.length

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-20">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">
        {activeUploads.length} uploading
      </span>
    </div>
  )
}

/**
 * Upload Status Badge
 */
export function UploadStatusBadge({ className = '' }: { className?: string }) {
  const uploads = useAppSelector(state => state.media.uploads)
  const uploadEntries = Object.entries(uploads)
  
  const activeUploads = uploadEntries.filter(([, progress]) =>
    progress.status !== 'complete' && progress.status !== 'error'
  )
  const completedUploads = uploadEntries.filter(([, progress]) =>
    progress.status === 'complete'
  )
  const errorUploads = uploadEntries.filter(([, progress]) =>
    progress.status === 'error'
  )

  if (uploadEntries.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {activeUploads.length > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{activeUploads.length} uploading</span>
        </div>
      )}
      
      {completedUploads.length > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <CheckCircle className="h-3 w-3" />
          <span>{completedUploads.length} completed</span>
        </div>
      )}
      
      {errorUploads.length > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>{errorUploads.length} failed</span>
        </div>
      )}
    </div>
  )
}
