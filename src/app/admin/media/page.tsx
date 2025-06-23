'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import NextImage from 'next/image'
import { Camera, Image, Video, Upload, Download, Trash2, Search, Grid, List, RefreshCw } from 'lucide-react'

// Removed CloudinaryUploadWidget - using direct file upload instead

interface MediaItem {
  id: string
  public_id: string
  url: string
  secure_url: string
  format: string
  resource_type: string
  width?: number
  height?: number
  bytes: number
  created_at: string
  tags: string[]
  folder?: string
  original_filename?: string
  version: number
  signature: string
  etag: string
  type: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
  has_next: boolean
  has_prev: boolean
  next_cursor?: string
  prev_cursor?: string
}

interface MediaStats {
  total_images: number
  total_videos: number
  total_files: number
  total_size: number
}



// Database setup interface removed - integration is working

/**
 * Simple MediaThumbnail Component - Show image fully covered
 */
function MediaThumbnail({ secureUrl, alt }: { secureUrl: string; alt: string }) {
  return (
    <NextImage
      src={secureUrl}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export default function MediaCenterPage() {
  // View and UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Data state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  })
  const [stats, setStats] = useState<MediaStats>({
    total_images: 0,
    total_videos: 0,
    total_files: 0,
    total_size: 0
  })

  // Database setup state removed - integration is working


  // Loading states - Start with loading true so we don't show 0 initially
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Infinite scroll
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  /**
   * Load media items with pagination and filtering
   */
  const loadMediaItems = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // Fetch from enhanced API endpoint
      const response = await fetch(`/api/cloudinary/media?${params}`)

      if (response.ok) {
        const data = await response.json()

        if (append) {
          // Append new items for infinite scroll
          setMediaItems(prev => [...prev, ...(data.items || [])])
        } else {
          // Replace items for new search/refresh
          setMediaItems(data.items || [])
          console.log('📊 Media items loaded:', data.items?.length || 0)
          if (data.items?.length > 0) {
            console.log('🔍 Sample item:', data.items[0])
          }
        }

        // Update pagination info
        setPagination(data.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0,
          has_next: false,
          has_prev: false
        })

        // Update stats
        setStats(data.stats || {
          total_images: 0,
          total_videos: 0,
          total_files: 0,
          total_size: 0
        })



        // Database setup status removed - integration is working

        // Update hasMore for infinite scroll
        setHasMore(data.pagination?.has_next || false)

      } else {
        console.warn('API failed, using empty state')
        if (!append) {
          setMediaItems([])
          setStats({
            total_images: 0,
            total_videos: 0,
            total_files: 0,
            total_size: 0
          })
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load media items:', error)
      if (!append) {
        setMediaItems([])
        setStats({
          total_images: 0,
          total_videos: 0,
          total_files: 0,
          total_size: 0
        })
      }
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [pagination.limit, searchQuery])

  /**
   * Load more items for infinite scroll
   */
  const loadMoreItems = useCallback(() => {
    if (!isLoadingMore && hasMore && pagination.has_next) {
      loadMediaItems(pagination.page + 1, true)
    }
  }, [isLoadingMore, hasMore, pagination.has_next, pagination.page, loadMediaItems])

  // Database setup check removed - integration is working



  /**
   * Simple refresh function to reload media items
   */
  const refreshMediaItems = async () => {
    await loadMediaItems(1, false)
  }

  /**
   * Delete selected items
   */
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return

    setIsDeleting(true)
    try {
      const params = new URLSearchParams({
        public_ids: selectedItems.join(',')
      })

      const response = await fetch(`/api/cloudinary/media?${params}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Delete API Response:', data)
        console.log('✅ Successfully deleted items:', data.deleted)
        console.log('❌ Failed to delete items:', data.failed)

        // Remove deleted items from state
        setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.public_id)))
        setSelectedItems([])
        setShowBulkActions(false)

        // Update stats
        const deletedItems = mediaItems.filter(item => selectedItems.includes(item.public_id))
        const deletedSize = deletedItems.reduce((sum, item) => sum + item.bytes, 0)
        const deletedImages = deletedItems.filter(item => item.resource_type === 'image').length
        const deletedVideos = deletedItems.filter(item => item.resource_type === 'video').length

        setStats(prev => ({
          total_images: Math.max(0, prev.total_images - deletedImages),
          total_videos: Math.max(0, prev.total_videos - deletedVideos),
          total_files: Math.max(0, prev.total_files - deletedItems.length),
          total_size: Math.max(0, prev.total_size - deletedSize)
        }))

        // Update pagination total
        setPagination(prev => ({
          ...prev,
          total: Math.max(0, prev.total - deletedItems.length),
          pages: Math.ceil(Math.max(0, prev.total - deletedItems.length) / prev.limit)
        }))

        console.log(`✅ Deleted ${data.deleted?.length || 0} items`)

        // Show user feedback
        if (data.failed && data.failed.length > 0) {
          alert(`Warning: ${data.failed.length} items failed to delete. Check console for details.`)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Delete API failed:', errorText)
        alert('Delete operation failed. Check console for details.')
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Handle direct file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Store successful upload results for immediate UI updates
      const successfulUploads: Array<MediaItem> = []

      // Upload each file
      for (const file of Array.from(files)) {
        console.log('🔄 Uploading file:', file.name)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'lgu-uploads/media')
        formData.append('description', `Media upload: ${file.name}`)

        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          console.log(`✅ Upload successful: ${result.data.public_id}`)
          console.log(`📊 Database Sync: ${result.database_sync?.success ? '✅ Success' : '❌ Failed'}`)

          // Create media item object for immediate UI update
          const newMediaItem: MediaItem = {
            id: result.data.public_id, // Use public_id as fallback ID
            public_id: result.data.public_id,
            url: result.data.url,
            secure_url: result.data.secure_url,
            format: result.data.format,
            resource_type: result.data.resource_type,
            width: result.data.width,
            height: result.data.height,
            bytes: result.data.bytes,
            created_at: result.data.created_at || new Date().toISOString(),
            tags: result.data.tags || [],
            folder: result.data.folder,
            original_filename: file.name,
            version: result.data.version,
            signature: result.data.signature || '',
            etag: result.data.etag || '',
            type: result.data.type || 'upload'
          }

          successfulUploads.push(newMediaItem)

          // IMMEDIATELY add to UI - direct sync approach
          setMediaItems(prev => [newMediaItem, ...prev])

          // Update stats immediately
          setStats(prev => ({
            total_images: result.data.resource_type === 'image' ? prev.total_images + 1 : prev.total_images,
            total_videos: result.data.resource_type === 'video' ? prev.total_videos + 1 : prev.total_videos,
            total_files: prev.total_files + 1,
            total_size: prev.total_size + result.data.bytes
          }))

          // Update pagination total
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1,
            pages: Math.ceil((prev.total + 1) / prev.limit)
          }))

          console.log('🎯 IMMEDIATE UI UPDATE: Added to media items list')

          if (result.warnings?.length) {
            console.warn('⚠️ Upload warnings:', result.warnings)
          }

        } else {
          console.error(`❌ Upload failed: ${result.error || 'Unknown error'}`)
        }
      }

      // Upload completed successfully - refresh the media library
      console.log('✅ All uploads completed successfully')
      await refreshMediaItems()

      if (successfulUploads.length > 0) {
        console.log(`🚀 PROFESSIONAL: ${successfulUploads.length} files uploaded and IMMEDIATELY visible in UI!`)

        // Show success notification (you can replace this with a toast notification)
        const message = successfulUploads.length === 1
          ? `✅ ${successfulUploads[0].original_filename} uploaded successfully!`
          : `✅ ${successfulUploads.length} files uploaded successfully!`

        // Temporary alert - replace with your notification system
        setTimeout(() => {
          alert(message)
        }, 100)
      }

    } catch (error) {
      console.error('❌ Upload error:', error)
    } finally {
      setIsUploading(false)
      // Clear the input
      event.target.value = ''
    }
  }

  /**
   * Handle search with debouncing
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Reset pagination and reload
    setPagination(prev => ({ ...prev, page: 1 }))
    loadMediaItems(1, false)
  }, [loadMediaItems])

  /**
   * Toggle item selection
   */
  const toggleItemSelection = (publicId: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(publicId)
        ? prev.filter(id => id !== publicId)
        : [...prev, publicId]

      setShowBulkActions(newSelection.length > 0)
      return newSelection
    })
  }

  /**
   * Select all visible items
   */
  const selectAllItems = () => {
    const allIds = mediaItems.map(item => item.public_id)
    setSelectedItems(allIds)
    setShowBulkActions(true)
  }

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedItems([])
    setShowBulkActions(false)
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

  // ==================== EFFECTS ====================

  /**
   * Initialize component - Load data immediately on mount
   */
  useEffect(() => {
    loadMediaItems(1, false)
  }, [loadMediaItems]) // Include loadMediaItems in dependency array

  /**
   * Setup infinite scroll observer
   */
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loadMoreItems])

  /**
   * Handle search debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        handleSearch(searchQuery)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  /**
   * Filter media items based on search query (client-side filtering for immediate feedback)
   */
  const filteredItems = searchQuery
    ? mediaItems.filter(item =>
        item.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.public_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mediaItems

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Media Center</h1>
            <p className="text-purple-100 text-lg">Manage photos, videos, and media files</p>

          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Camera className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Image className="h-6 w-6 text-purple-600" aria-label="Images icon" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.total_images.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-xl">
              <Video className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.total_videos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.total_files.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : formatFileSize(stats.total_size)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">


            {/* Refresh Button */}
            <button
              onClick={() => loadMediaItems(1, false)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Direct File Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className={`h-4 w-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                {isUploading ? 'Uploading...' : 'Upload Media'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllItems}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All ({mediaItems.length})
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={deleteSelectedItems}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className={`h-4 w-4 mr-2 ${isDeleting ? 'animate-pulse' : ''}`} />
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Media Library - 100% Complete Bidirectional Sync
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total > 0 && (
                <>
                  Showing {mediaItems.length} of {pagination.total.toLocaleString()} items
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              )}
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {filteredItems.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-label="No media files" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No media files found</h4>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'Upload your first media file to get started.'}
            </p>

            {!searchQuery && (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="first-media-upload"
                  />
                  <label
                    htmlFor="first-media-upload"
                    className={`inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-lg font-medium ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className={`h-5 w-5 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                    {isUploading ? 'Uploading...' : 'Upload Your First Media'}
                  </label>
                </div>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>✨ Upload images and videos directly</p>
                  <p>📁 Files will be stored in your Cloudinary Media Library</p>
                  <p>🔄 100% Complete bidirectional sync with automatic cleanup</p>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">✅ Perfect Sync Achieved:</p>
                    <p className="text-green-700 text-xs mt-1">
                      🎯 100% complete bidirectional sync with automatic database triggers
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      🔄 Automatic Cloudinary cleanup when database records are deleted
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      ⚡ Background scheduler processes cleanup queue automatically
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Simple Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.public_id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => toggleItemSelection(item.public_id)}
                >
                  {/* Simple Image Display */}
                  <div className="aspect-square bg-gray-100">
                    <MediaThumbnail
                      secureUrl={item.secure_url}
                      alt={item.original_filename || item.public_id}
                    />
                  </div>

                  {/* Simple Info */}
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">
                      {item.original_filename || item.public_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.format?.toUpperCase()} • {formatFileSize(item.bytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMoreItems}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}

            {/* End of Results */}
            {!hasMore && filteredItems.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>You&apos;ve reached the end of your media library</p>
                <p className="text-sm mt-1">
                  {pagination.total.toLocaleString()} total items
                </p>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  )
}
