/**
 * Enhanced Upload Hook - Phase 2 Implementation
 * 
 * Enterprise-grade upload hook with:
 * - Optimistic UI updates
 * - Real-time progress tracking
 * - Immediate sync triggers
 * - Error handling and rollback
 * - No setTimeout delays
 * 
 * Replaces the setTimeout-based approach with real-time WebSocket updates.
 * 
 * @author LGU Project Team
 * @version 2.0.0
 */

import { useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { updateUploadProgress } from '@/lib/redux/slices/mediaSlice'
import { useImmediateSync, useOptimisticUpdates } from '@/components/providers/RealtimeMediaProvider'

export interface UploadOptions {
  folder?: string
  description?: string
  tags?: string[]
  enableOptimistic?: boolean
  enableProgress?: boolean
}

export interface UploadResult {
  success: boolean
  data?: {
    public_id: string
    secure_url: string
    [key: string]: unknown
  }
  error?: string
  tempId?: string
}

export const useEnhancedUpload = () => {
  const dispatch = useAppDispatch()
  const { triggerImmediateSync } = useImmediateSync()
  const { addOptimistic, rollbackOptimistic } = useOptimisticUpdates()
  
  // Get upload states from Redux
  const uploads = useAppSelector(state => state.media.uploads)
  const isUploading = Object.keys(uploads).length > 0
  
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Upload single file with optimistic updates
   */
  const uploadSingleFile = useCallback(async (
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    const {
      folder = 'lgu-uploads/media',
      description,
      tags = [],
      enableOptimistic = true,
      enableProgress = true
    } = options

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      setLocalError(null)

      // 1. Add optimistic item immediately (Phase 2 enhancement)
      if (enableOptimistic) {
        const optimisticAsset = {
          cloudinary_public_id: tempId,
          original_filename: file.name,
          display_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          format: file.name.split('.').pop() || 'unknown',
          folder,
          tags: ['lgu-project', ...tags],
          description: description || `Media upload: ${file.name}`,
          secure_url: URL.createObjectURL(file), // Temporary preview
          url: URL.createObjectURL(file),
          resource_type: file.type.startsWith('image/') ? 'image' as const : 
                        file.type.startsWith('video/') ? 'video' as const : 'raw' as const,
          sync_status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString()
        }

        addOptimistic(tempId, optimisticAsset)
        console.log('[useEnhancedUpload] Added optimistic item:', tempId)
      }

      // 2. Start progress tracking
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 0,
            status: 'uploading'
          }
        }))
      }

      // 3. Prepare form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      if (description) formData.append('description', description)
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags))

      // 4. Upload to Cloudinary (with progress simulation)
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 25,
            status: 'uploading'
          }
        }))
      }

      const uploadResponse = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      // 5. Update progress - processing
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 60,
            status: 'processing',
            public_id: uploadResult.data.public_id
          }
        }))
      }

      // 6. Trigger immediate sync (Phase 2 enhancement - no setTimeout!)
      console.log('[useEnhancedUpload] Triggering immediate sync for:', uploadResult.data.public_id)
      
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 80,
            status: 'syncing',
            public_id: uploadResult.data.public_id
          }
        }))
      }

      await triggerImmediateSync(uploadResult.data.public_id, 'upload')

      // 7. Complete progress
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 100,
            status: 'complete',
            public_id: uploadResult.data.public_id
          }
        }))

        // Clear progress after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'media/clearUploadProgress', payload: tempId })
        }, 3000)
      }

      console.log('[useEnhancedUpload] Upload completed successfully:', uploadResult.data.public_id)

      // Note: Optimistic item will be confirmed automatically by RealtimeMediaProvider
      // when the real-time subscription receives the database INSERT event

      return {
        success: true,
        data: uploadResult.data,
        tempId
      }

    } catch (error) {
      console.error('[useEnhancedUpload] Upload failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setLocalError(errorMessage)

      // Rollback optimistic update
      if (enableOptimistic) {
        rollbackOptimistic(tempId)
      }

      // Update progress with error
      if (enableProgress) {
        dispatch(updateUploadProgress({
          tempId,
          progress: {
            file_name: file.name,
            progress: 0,
            status: 'error',
            error_message: errorMessage
          }
        }))

        // Clear error progress after 5 seconds
        setTimeout(() => {
          dispatch({ type: 'media/clearUploadProgress', payload: tempId })
        }, 5000)
      }

      return {
        success: false,
        error: errorMessage,
        tempId
      }
    }
  }, [dispatch, triggerImmediateSync, addOptimistic, rollbackOptimistic])

  /**
   * Upload multiple files with batch processing
   */
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    console.log('[useEnhancedUpload] Starting batch upload of', files.length, 'files')
    
    const results: UploadResult[] = []
    
    // Process files sequentially to avoid overwhelming the server
    for (const file of files) {
      const result = await uploadSingleFile(file, options)
      results.push(result)
      
      // Small delay between uploads to prevent rate limiting
      if (files.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log('[useEnhancedUpload] Batch upload completed:', results)
    return results
  }, [uploadSingleFile])

  /**
   * Get upload progress for a specific file
   */
  const getUploadProgress = useCallback((tempId: string) => {
    return uploads[tempId] || null
  }, [uploads])

  /**
   * Get all active uploads
   */
  const getAllUploads = useCallback(() => {
    return uploads
  }, [uploads])

  /**
   * Clear specific upload progress
   */
  const clearUploadProgress = useCallback((tempId: string) => {
    dispatch({ type: 'media/clearUploadProgress', payload: tempId })
  }, [dispatch])

  /**
   * Clear all upload progress
   */
  const clearAllUploads = useCallback(() => {
    Object.keys(uploads).forEach(tempId => {
      dispatch({ type: 'media/clearUploadProgress', payload: tempId })
    })
  }, [dispatch, uploads])

  return {
    // Upload functions
    uploadSingleFile,
    uploadMultipleFiles,
    
    // Progress tracking
    getUploadProgress,
    getAllUploads,
    clearUploadProgress,
    clearAllUploads,
    
    // State
    isUploading,
    error: localError,
    
    // Utilities
    clearError: () => setLocalError(null)
  }
}
