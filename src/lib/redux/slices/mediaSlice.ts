/**
 * Media Slice - Real-time Media Management with Optimistic Updates
 * 
 * Enterprise-grade Redux slice for managing media library state with:
 * - Real-time Supabase subscriptions
 * - Optimistic UI updates
 * - Upload progress tracking
 * - Error handling and rollback
 * - Sync status management
 * 
 * Phase 2 Implementation - Eliminates setTimeout delays
 * 
 * @author LGU Project Team
 * @version 2.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { MediaAsset } from '@/lib/database.types'

// Types

export interface UploadProgress {
  file_name: string
  progress: number
  status: 'uploading' | 'processing' | 'syncing' | 'complete' | 'error' | 'verifying'
  error_message?: string
  public_id?: string
  sync_status?: 'pending' | 'synced' | 'error'
  database_synced?: boolean
  cloudinary_synced?: boolean
  retry_count?: number
}

export interface OptimisticItem {
  id: string
  tempId: string
  asset: Partial<MediaAsset>
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

export interface MediaState {
  // Core data
  items: MediaAsset[]
  total: number
  
  // Pagination
  page: number
  limit: number
  hasMore: boolean
  
  // Loading states
  isLoading: boolean
  isLoadingMore: boolean
  isSyncing: boolean
  
  // Upload tracking
  uploads: Record<string, UploadProgress>
  
  // Optimistic updates
  optimisticItems: OptimisticItem[]
  
  // Real-time subscription
  subscriptionActive: boolean
  
  // Search and filters
  searchQuery: string
  filters: {
    folder?: string
    resource_type?: 'image' | 'video' | 'raw'
    sync_status?: 'synced' | 'pending' | 'error'
  }
  
  // Error handling
  error: string | null
  lastError: string | null
  
  // Sync status
  syncStatus: {
    lastSync: string
    isSynced: boolean
    pendingOperations: number
  }
}

const initialState: MediaState = {
  items: [],
  total: 0,
  page: 1,
  limit: 50,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  isSyncing: false,
  uploads: {},
  optimisticItems: [],
  subscriptionActive: false,
  searchQuery: '',
  filters: {},
  error: null,
  lastError: null,
  syncStatus: {
    lastSync: '',
    isSynced: true,
    pendingOperations: 0
  }
}

// Async thunks
export const loadMediaItems = createAsyncThunk(
  'media/loadItems',
  async (params: { page?: number; append?: boolean; search?: string } = {}) => {
    const { page = 1, append = false, search = '' } = params
    
    const response = await fetch(`/api/cloudinary/media?page=${page}&limit=50&search=${encodeURIComponent(search)}`)
    
    if (!response.ok) {
      throw new Error('Failed to load media items')
    }
    
    const data = await response.json()
    return { ...data, append }
  }
)

export const uploadFile = createAsyncThunk(
  'media/uploadFile',
  async (params: { file: File; folder?: string }, { dispatch }) => {
    const { file, folder = 'lgu-uploads/media' } = params
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Start upload progress tracking
    dispatch(updateUploadProgress({
      tempId,
      progress: {
        file_name: file.name,
        progress: 0,
        status: 'uploading'
      }
    }))
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('description', `Media upload: ${file.name}`)
    
    try {
      // Upload to Cloudinary
      dispatch(updateUploadProgress({
        tempId,
        progress: { file_name: file.name, progress: 50, status: 'processing' }
      }))
      
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const result = await response.json()
      
      // Check database sync status
      const databaseSynced = result.database_sync?.success || false
      const cloudinarySynced = true // Upload was successful

      dispatch(updateUploadProgress({
        tempId,
        progress: {
          file_name: file.name,
          progress: 75,
          status: 'syncing',
          public_id: result.data.public_id,
          cloudinary_synced: cloudinarySynced,
          database_synced: databaseSynced
        }
      }))

      // Simulate webhook for immediate sync if database sync failed
      if (!databaseSynced) {
        try {
          await fetch('/api/cloudinary/webhook', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_id: result.data.public_id,
              action: 'upload'
            })
          })

          // Update progress to show verification
          dispatch(updateUploadProgress({
            tempId,
            progress: {
              file_name: file.name,
              progress: 90,
              status: 'verifying',
              public_id: result.data.public_id,
              cloudinary_synced: cloudinarySynced,
              database_synced: false
            }
          }))

          // Wait a moment for sync to complete
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (syncError) {
          console.warn('Immediate sync failed:', syncError)
        }
      }

      dispatch(updateUploadProgress({
        tempId,
        progress: {
          file_name: file.name,
          progress: 100,
          status: 'complete',
          public_id: result.data.public_id,
          cloudinary_synced: cloudinarySynced,
          database_synced: databaseSynced,
          sync_status: databaseSynced ? 'synced' : 'pending'
        }
      }))
      
      return { ...result, tempId }
      
    } catch (error) {
      dispatch(updateUploadProgress({
        tempId,
        progress: {
          file_name: file.name,
          progress: 0,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Upload failed'
        }
      }))
      throw error
    }
  }
)

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    // Real-time subscription management
    setSubscriptionActive: (state, action: PayloadAction<boolean>) => {
      state.subscriptionActive = action.payload
    },
    
    // Optimistic updates
    addOptimisticItem: (state, action: PayloadAction<{ tempId: string; asset: Partial<MediaAsset> }>) => {
      const { tempId, asset } = action.payload
      state.optimisticItems.push({
        id: tempId,
        tempId,
        asset,
        status: 'pending',
        timestamp: Date.now()
      })
    },
    
    confirmOptimisticItem: (state, action: PayloadAction<{ tempId: string; confirmedAsset: MediaAsset }>) => {
      const { tempId, confirmedAsset } = action.payload
      
      // Remove from optimistic items
      state.optimisticItems = state.optimisticItems.filter(item => item.tempId !== tempId)
      
      // Add to actual items if not already present
      const exists = state.items.find(item => item.cloudinary_public_id === confirmedAsset.cloudinary_public_id)
      if (!exists) {
        state.items.unshift(confirmedAsset)
        state.total += 1
      }
    },
    
    rollbackOptimisticItem: (state, action: PayloadAction<string>) => {
      const tempId = action.payload
      state.optimisticItems = state.optimisticItems.filter(item => item.tempId !== tempId)
    },
    
    // Real-time updates from Supabase
    handleRealtimeInsert: (state, action: PayloadAction<MediaAsset>) => {
      const newAsset = action.payload
      const exists = state.items.find(item => item.cloudinary_public_id === newAsset.cloudinary_public_id)
      
      if (!exists) {
        state.items.unshift(newAsset)
        state.total += 1
      }
    },
    
    handleRealtimeUpdate: (state, action: PayloadAction<MediaAsset>) => {
      const updatedAsset = action.payload
      const index = state.items.findIndex(item => item.id === updatedAsset.id)
      
      if (index !== -1) {
        state.items[index] = updatedAsset
      }
    },
    
    handleRealtimeDelete: (state, action: PayloadAction<string>) => {
      const deletedId = action.payload
      state.items = state.items.filter(item => item.id !== deletedId)
      state.total = Math.max(0, state.total - 1)
    },
    
    // Upload progress tracking
    updateUploadProgress: (state, action: PayloadAction<{ tempId: string; progress: UploadProgress }>) => {
      const { tempId, progress } = action.payload
      state.uploads[tempId] = progress
    },
    
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      const tempId = action.payload
      delete state.uploads[tempId]
    },
    
    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.page = 1 // Reset pagination
    },
    
    setFilters: (state, action: PayloadAction<Partial<MediaState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1 // Reset pagination
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      if (action.payload) {
        state.lastError = action.payload
      }
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Sync status
    updateSyncStatus: (state, action: PayloadAction<Partial<MediaState['syncStatus']>>) => {
      state.syncStatus = { ...state.syncStatus, ...action.payload }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Load media items
      .addCase(loadMediaItems.pending, (state, action) => {
        const append = action.meta.arg?.append
        if (append) {
          state.isLoadingMore = true
        } else {
          state.isLoading = true
        }
        state.error = null
      })
      .addCase(loadMediaItems.fulfilled, (state, action) => {
        const { items, pagination, append } = action.payload
        
        if (append) {
          state.items.push(...items)
          state.isLoadingMore = false
        } else {
          state.items = items
          state.isLoading = false
        }
        
        state.total = pagination.total
        state.page = pagination.page
        state.hasMore = pagination.has_next
      })
      .addCase(loadMediaItems.rejected, (state, action) => {
        state.isLoading = false
        state.isLoadingMore = false
        state.error = action.error.message || 'Failed to load media items'
      })
      
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.error = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const { tempId } = action.payload
        // Clear upload progress after successful upload
        setTimeout(() => {
          delete state.uploads[tempId]
        }, 3000) // Keep progress visible for 3 seconds
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.error = action.error.message || 'Upload failed'
      })
  }
})

export const {
  setSubscriptionActive,
  addOptimisticItem,
  confirmOptimisticItem,
  rollbackOptimisticItem,
  handleRealtimeInsert,
  handleRealtimeUpdate,
  handleRealtimeDelete,
  updateUploadProgress,
  clearUploadProgress,
  setSearchQuery,
  setFilters,
  setError,
  clearError,
  updateSyncStatus
} = mediaSlice.actions

export default mediaSlice.reducer
