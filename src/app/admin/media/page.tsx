'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import NextImage from 'next/image'
import { Camera, Image, Video, Upload, Download, Trash2, Search, Grid, List, RefreshCw, RotateCw, CheckCircle, AlertCircle } from 'lucide-react'
import SyncStatusIndicators, { CompactSyncIndicator, FloatingSyncStatus } from '@/components/sync/SyncStatusIndicators'
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

interface SyncStatus {
  last_sync: string
  is_synced: boolean
  pending_operations: number
  database_ready?: boolean
}

interface DatabaseSetup {
  ready: boolean
  message: string
  setup_endpoint: string
  script_location: string
}

/**
 * MediaThumbnail Component - Natural aspect ratio image display
 */
function MediaThumbnail({
  publicId,
  secureUrl,
  resourceType,
  format,
  alt,
  width,
  height,
  className
}: {
  publicId: string
  secureUrl: string
  resourceType: string
  format: string
  alt: string
  width?: number
  height?: number
  className?: string
}) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  console.log(`🔍 MediaThumbnail rendering:`, { publicId, secureUrl, resourceType, format, width, height })

  // Handle image load success
  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${secureUrl}`)
    setIsLoading(false)
    setImageError(false)
  }

  // Handle image load error
  const handleImageError = () => {
    console.error(`❌ Image failed to load: ${secureUrl}`)
    setIsLoading(false)
    setImageError(true)
  }

  // For videos, show video icon with natural dimensions
  if (resourceType === 'video') {
    return (
      <div className={`${className} relative bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center min-h-[120px]`}>
        <div className="text-center">
          <Video className="h-12 w-12 text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-purple-700 font-medium">{format?.toUpperCase()}</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading && !imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 min-h-[120px]`}>
        <div className="animate-pulse text-center">
          <Image className="h-8 w-8 text-blue-400 mx-auto mb-1" aria-label="Loading" />
          <p className="text-xs text-blue-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state with fallback
  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 min-h-[120px]`}>
        <div className="text-center">
          <Image className="h-8 w-8 text-red-500 mx-auto mb-1" aria-label="Error" />
          <p className="text-xs text-red-600 font-medium">{format?.toUpperCase()}</p>
          <p className="text-xs text-red-500">Failed to load</p>
        </div>
      </div>
    )
  }

  // For images, display with natural aspect ratio
  return (
    <NextImage
      src={secureUrl}
      alt={alt}
      width={300}
      height={200}
      className={`${className} max-w-full h-auto`}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        objectFit: 'contain',
        display: 'block',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    last_sync: '',
    is_synced: true,
    pending_operations: 0,
    database_ready: false
  })
  const [databaseSetup, setDatabaseSetup] = useState<DatabaseSetup>({
    ready: false,
    message: '',
    setup_endpoint: '',
    script_location: ''
  })
  const [webhookStatus, setWebhookStatus] = useState<{
    configured: boolean
    lastActivity: string | null
    endpoint: string
  }>({
    configured: false,
    lastActivity: null,
    endpoint: ''
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
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

        // Update sync status
        setSyncStatus(data.sync_status || {
          last_sync: '',
          is_synced: true,
          pending_operations: 0,
          database_ready: false
        })

        // Update database setup status
        setDatabaseSetup(data.database_setup || {
          ready: false,
          message: 'Database status unknown',
          setup_endpoint: '/api/setup-media-db',
          script_location: 'docs/full-complete-supabase-script.md'
        })

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

  /**
   * Check database setup status
   */
  const checkDatabaseSetup = async () => {
    try {
      const response = await fetch('/api/setup-media-db')
      const data = await response.json()

      setDatabaseSetup({
        ready: data.success,
        message: data.message,
        setup_endpoint: '/api/setup-media-db',
        script_location: 'docs/full-complete-supabase-script.md'
      })

      return data.success
    } catch (error) {
      console.error('Database setup check failed:', error)
      return false
    }
  }

  /**
   * Check webhook configuration status
   */
  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('/api/cloudinary/webhook')
      const data = await response.json()

      if (data.success) {
        setWebhookStatus({
          configured: true,
          lastActivity: data.recent_activity?.recent_logs?.[0]?.timestamp || null,
          endpoint: data.webhook_config?.endpoint || ''
        })
        console.log('🔗 Webhook Status:', data.webhook_config)
      } else {
        setWebhookStatus({
          configured: false,
          lastActivity: null,
          endpoint: ''
        })
      }
    } catch (error) {
      console.error('❌ Webhook status check failed:', error)
      setWebhookStatus({
        configured: false,
        lastActivity: null,
        endpoint: ''
      })
    }
  }

  /**
   * Sync with Cloudinary
   */
  const syncWithCloudinary = async () => {
    setIsSyncing(true)
    try {
      // First check if database is ready
      const dbReady = await checkDatabaseSetup()
      if (!dbReady) {
        console.warn('Database not ready for sync')
        return
      }

      const response = await fetch('/api/cloudinary/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Sync completed:', data)

        // Refresh media items after sync
        await loadMediaItems(1, false)

        // Show success message (you could add a toast notification here)
        console.log(`✅ Sync completed: ${data.data.synced_items} items synced`)
      } else {
        console.error('Sync failed:', await response.text())
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
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
   * Handle direct file upload with webhook testing
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Store successful upload results for immediate UI updates
      const successfulUploads: Array<any> = []

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
          const newMediaItem = {
            id: result.data.public_id, // Use public_id as fallback ID
            public_id: result.data.public_id,
            cloudinary_public_id: result.data.public_id,
            secure_url: result.data.secure_url,
            url: result.data.url,
            original_filename: file.name,
            display_name: file.name,
            file_size: result.data.bytes,
            bytes: result.data.bytes, // Compatibility field
            format: result.data.format,
            width: result.data.width,
            height: result.data.height,
            resource_type: result.data.resource_type,
            folder: result.data.folder,
            tags: result.data.tags || [],
            created_at: result.data.created_at || new Date().toISOString(),
            cloudinary_version: result.data.version,
            sync_status: 'synced'
          }

          successfulUploads.push(newMediaItem)

          // IMMEDIATELY add to UI - no waiting for webhooks!
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

      // Background: Trigger webhook for database consistency (but UI is already updated)
      console.log('🔄 Background: Triggering webhook sync for database consistency...')

      for (const upload of successfulUploads) {
        try {
          await fetch('/api/cloudinary/webhook', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_id: upload.public_id,
              action: 'upload'
            })
          })
          console.log('✅ Background sync triggered for:', upload.public_id)
        } catch (syncError) {
          console.warn('⚠️ Background sync failed (UI already updated):', syncError)
        }
      }

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
   * Initialize component
   */
  useEffect(() => {
    const initializeComponent = async () => {
      // Check database setup first
      await checkDatabaseSetup()
      // Check webhook configuration
      await checkWebhookStatus()
      // Then load media items
      await loadMediaItems(1, false)
    }

    initializeComponent()
  }, [loadMediaItems])

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

  // Load media items on component mount
  useEffect(() => {
    loadMediaItems()
  }, [loadMediaItems])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Media Center</h1>
            <p className="text-purple-100 text-lg">Manage photos, videos, and media files</p>
            {/* Phase 3: Compact Sync Status in Header */}
            <div className="mt-3">
              <CompactSyncIndicator className="text-white" />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Camera className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Phase 3: Sync Status Panel */}
      <SyncStatusIndicators className="mb-6" showDetails={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Image className="h-6 w-6 text-purple-600" aria-label="Images icon" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_images.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.total_videos.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.total_files.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.total_size)}</p>
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
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              {syncStatus.is_synced ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-xs text-gray-600">
                {syncStatus.is_synced ? 'Synced' : `${syncStatus.pending_operations} pending`}
              </span>
            </div>

            {/* Webhook Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              {webhookStatus.configured ? (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-600">
                {webhookStatus.configured ? 'Webhook Active' : 'Webhook Not Set'}
              </span>
              {!webhookStatus.configured && (
                <a
                  href="/admin/webhook-setup"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  title="Setup webhooks to sync files uploaded directly to Cloudinary"
                >
                  Setup
                </a>
              )}
            </div>

            {/* Sync Button */}
            <button
              onClick={syncWithCloudinary}
              disabled={isSyncing}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Sync all files from Cloudinary to database"
            >
              <RotateCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync from Cloudinary'}
            </button>

            {/* Webhook Test Button */}
            <button
              onClick={checkWebhookStatus}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Test webhook configuration"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Webhook
            </button>

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
              Media Library
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

            {!databaseSetup.ready && !searchQuery && (
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-800">Database Setup Required</h3>
                </div>
                <p className="text-red-700 mb-4">{databaseSetup.message}</p>
                <div className="space-y-3 text-sm text-red-600">
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="font-semibold mb-2">🚨 CRITICAL: Media files will disappear on refresh until database is set up!</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Copy the complete SQL script from <code className="bg-red-200 px-1 rounded">docs/full-complete-supabase-script.md</code></li>
                      <li>Open your Supabase dashboard → SQL Editor</li>
                      <li>Paste and execute the entire script</li>
                      <li>Refresh this page to verify setup</li>
                      <li>Click &quot;Sync from Cloudinary&quot; to import existing files</li>
                    </ol>
                  </div>
                  <button
                    onClick={checkDatabaseSetup}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Database Setup
                  </button>
                </div>
              </div>
            )}

            {!searchQuery && databaseSetup.ready && (
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
                  <p>🔄 Perfect bidirectional sync with database</p>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">✅ Database Ready:</p>
                    <p className="text-green-700 text-xs mt-1">
                      Your media library is properly configured for bidirectional sync.
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      Files will persist after refresh and sync perfectly with Cloudinary.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Media Grid - Google Images Style with Natural Aspect Ratios */}
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={`${item.public_id}-${item.version || item.etag}`}
                  className={`group relative bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer break-inside-avoid mb-4 ${
                    selectedItems.includes(item.public_id)
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleItemSelection(item.public_id)}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.public_id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {selectedItems.includes(item.public_id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Media Preview with Natural Aspect Ratio */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {item.public_id ? (
                      <MediaThumbnail
                        publicId={item.public_id}
                        secureUrl={item.secure_url}
                        resourceType={item.resource_type}
                        format={item.format}
                        alt={item.original_filename || item.public_id}
                        width={item.width}
                        height={item.height}
                        className="w-full"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" aria-label="File preview" />
                      </div>
                    )}

                    {/* Format Badge */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {item.format?.toUpperCase()}
                    </div>
                  </div>

                  {/* Media Info */}
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 truncate mb-1" title={item.original_filename || item.public_id}>
                      {item.original_filename || item.public_id}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{item.format?.toUpperCase()}</span>
                      <span>{formatFileSize(item.bytes)}</span>
                    </div>
                    {item.width && item.height && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.width} × {item.height} px
                      </p>
                    )}
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

      {/* Phase 3: Floating Sync Status Widget */}
      <FloatingSyncStatus />
    </div>
  )
}
