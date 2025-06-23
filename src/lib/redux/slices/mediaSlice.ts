/**
 * Media Slice - Simple Media Management
 *
 * Simplified Redux slice for managing media library state with:
 * - Basic CRUD operations
 * - Upload progress tracking
 * - Search and filtering
 * - Error handling
 *
 * @author LGU Project Team
 * @version 3.0.0 - Simplified direct integration
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { MediaAsset } from '@/lib/database.types'

// Types

export interface UploadProgress {
  file_name: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error_message?: string
  public_id?: string
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

  // Upload tracking
  uploads: Record<string, UploadProgress>

  // Search and filters
  searchQuery: string
  filters: {
    folder?: string
    resource_type?: 'image' | 'video' | 'raw'
  }

  // Error handling
  error: string | null
}

const initialState: MediaState = {
  items: [],
  total: 0,
  page: 1,
  limit: 50,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  uploads: {},
  searchQuery: '',
  filters: {},
  error: null
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

      dispatch(updateUploadProgress({
        tempId,
        progress: {
          file_name: file.name,
          progress: 100,
          status: 'complete',
          public_id: result.data.public_id
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
    },

    clearError: (state) => {
      state.error = null
    },

    // Simple refresh action to reload items after upload
    refreshItems: (state) => {
      // This will trigger a reload in the component
      state.page = state.page
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
  updateUploadProgress,
  clearUploadProgress,
  setSearchQuery,
  setFilters,
  setError,
  clearError,
  refreshItems
} = mediaSlice.actions

export default mediaSlice.reducer
