/**
 * Supabase Media Service
 * 
 * Enterprise-grade database service for media library with perfect bidirectional sync.
 * Handles all database operations for media assets with Supabase integration.
 * 
 * Features:
 * - 🗄️ Complete CRUD operations for media assets
 * - 🔄 Sync status management
 * - 📊 Real-time statistics
 * - 🔍 Advanced search and filtering
 * - 📝 Audit trail logging
 * - 🔒 Enterprise-grade error handling
 * - ⚡ Optimized queries with indexes
 * 
 * @author LGU Project Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'

// Types
export interface MediaAsset {
  id: string
  cloudinary_public_id: string
  cloudinary_version: number
  cloudinary_signature: string
  cloudinary_etag?: string
  original_filename?: string
  display_name?: string
  file_size: number
  mime_type: string
  format: string
  width?: number
  height?: number
  duration?: number
  folder?: string
  tags: string[]
  description?: string
  alt_text?: string
  secure_url: string
  url: string
  thumbnail_url?: string
  resource_type: 'image' | 'video' | 'raw'
  access_mode: 'public' | 'authenticated'
  uploaded_by?: string
  used_in_personnel?: number
  used_in_documents?: number
  created_at: string
  updated_at: string
  cloudinary_created_at?: string
  sync_status: 'synced' | 'pending' | 'error'
  last_synced_at: string
  sync_error_message?: string
  sync_retry_count: number
  deleted_at?: string
  deleted_by?: string
}

export interface MediaSyncLog {
  id: string
  operation: 'upload' | 'delete' | 'update' | 'restore'
  status: 'synced' | 'pending' | 'error'
  media_asset_id?: string
  cloudinary_public_id: string
  source: 'cloudinary' | 'admin' | 'api' | 'webhook'
  triggered_by?: string
  error_message?: string
  error_code?: string
  retry_count: number
  processing_time_ms?: number
  file_size?: number
  operation_data?: Record<string, unknown>
  webhook_data?: Record<string, unknown>
  created_at: string
  completed_at?: string
}

export interface MediaStats {
  total_assets: number
  total_images: number
  total_videos: number
  total_raw: number
  total_size: number
  synced_assets: number
  pending_assets: number
  error_assets: number
}

export interface MediaSearchOptions {
  search?: string
  folder?: string
  resource_type?: 'image' | 'video' | 'raw'
  tags?: string[]
  sync_status?: 'synced' | 'pending' | 'error'
  uploaded_by?: string
  date_from?: string
  date_to?: string
  min_size?: number
  max_size?: number
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Supabase Media Service Class
 */
export class SupabaseMediaService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /**
   * Get the Supabase client instance
   * @returns Supabase client for database operations
   */
  static getClient() {
    return this.supabase
  }

  /**
   * Create or update media asset in database
   */
  static async upsertMediaAsset(asset: Partial<MediaAsset>): Promise<MediaAsset> {
    try {
      console.log('[SupabaseMediaService] Upserting media asset:', asset.cloudinary_public_id)

      const { data, error } = await this.supabase
        .from('media_assets')
        .upsert({
          ...asset,
          updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'cloudinary_public_id'
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to upsert media asset: ${error.message}`)
      }

      return data as MediaAsset
    } catch (error) {
      console.error('[SupabaseMediaService] Upsert failed:', error)
      throw error
    }
  }

  /**
   * Get media asset by Cloudinary public ID
   */
  static async getMediaAssetByPublicId(publicId: string): Promise<MediaAsset | null> {
    try {
      const { data, error } = await this.supabase
        .from('media_assets')
        .select('*')
        .eq('cloudinary_public_id', publicId)
        .is('deleted_at', null)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to get media asset: ${error.message}`)
      }

      return data as MediaAsset | null
    } catch (error) {
      console.error('[SupabaseMediaService] Get asset failed:', error)
      return null
    }
  }

  /**
   * Search media assets with advanced filtering
   */
  static async searchMediaAssets(options: MediaSearchOptions = {}): Promise<{
    assets: MediaAsset[]
    total: number
    page: number
    limit: number
    has_next: boolean
    has_prev: boolean
  }> {
    try {
      const {
        search,
        folder,
        resource_type,
        tags,
        sync_status,
        uploaded_by,
        date_from,
        date_to,
        min_size,
        max_size,
        page = 1,
        limit = 50,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = options

      let query = this.supabase
        .from('media_assets')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`original_filename.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (folder) {
        query = query.eq('folder', folder)
      }

      if (resource_type) {
        query = query.eq('resource_type', resource_type)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags)
      }

      if (sync_status) {
        query = query.eq('sync_status', sync_status)
      }

      if (uploaded_by) {
        query = query.eq('uploaded_by', uploaded_by)
      }

      if (date_from) {
        query = query.gte('created_at', date_from)
      }

      if (date_to) {
        query = query.lte('created_at', date_to)
      }

      if (min_size) {
        query = query.gte('file_size', min_size)
      }

      if (max_size) {
        query = query.lte('file_size', max_size)
      }

      // Apply sorting and pagination
      const offset = (page - 1) * limit
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to search media assets: ${error.message}`)
      }

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        assets: data as MediaAsset[],
        total,
        page,
        limit,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    } catch (error) {
      console.error('[SupabaseMediaService] Search failed:', error)
      throw error
    }
  }

  /**
   * Get media statistics
   */
  static async getMediaStats(): Promise<MediaStats> {
    try {
      // Try the function first
      const { data: functionData, error: functionError } = await this.supabase
        .rpc('get_media_statistics')

      if (!functionError && functionData) {
        return functionData[0] as MediaStats
      }

      // Fallback: Calculate stats manually
      console.log('[SupabaseMediaService] Function not available, calculating stats manually...')

      const { data: assets, error } = await this.supabase
        .from('media_assets')
        .select('resource_type, file_size, sync_status')
        .is('deleted_at', null)

      if (error) {
        console.error('[SupabaseMediaService] Failed to get media assets for stats:', error)
        throw error
      }

      const stats = {
        total_assets: assets?.length || 0,
        total_images: assets?.filter(a => a.resource_type === 'image').length || 0,
        total_videos: assets?.filter(a => a.resource_type === 'video').length || 0,
        total_raw: assets?.filter(a => a.resource_type === 'raw').length || 0,
        total_size: assets?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0,
        synced_assets: assets?.filter(a => a.sync_status === 'synced').length || 0,
        pending_assets: assets?.filter(a => a.sync_status === 'pending').length || 0,
        error_assets: assets?.filter(a => a.sync_status === 'error').length || 0
      }

      return stats
    } catch (error) {
      console.error('[SupabaseMediaService] Get stats failed:', error)
      // Return default stats on error
      return {
        total_assets: 0,
        total_images: 0,
        total_videos: 0,
        total_raw: 0,
        total_size: 0,
        synced_assets: 0,
        pending_assets: 0,
        error_assets: 0
      }
    }
  }

  /**
   * Soft delete media asset
   */
  static async softDeleteMediaAsset(publicId: string, deletedBy?: string): Promise<boolean> {
    try {
      console.log('[SupabaseMediaService] Soft deleting media asset:', publicId)

      const { data, error } = await this.supabase
        .rpc('soft_delete_media_asset', {
          asset_id: publicId,
          deleted_by_user: deletedBy
        })

      if (error) {
        throw new Error(`Failed to soft delete media asset: ${error.message}`)
      }

      return data as boolean
    } catch (error) {
      console.error('[SupabaseMediaService] Soft delete failed:', error)
      throw error
    }
  }

  /**
   * Hard delete media asset (permanently remove from database)
   */
  static async hardDeleteMediaAsset(publicId: string): Promise<boolean> {
    try {
      console.log('[SupabaseMediaService] Hard deleting media asset:', publicId)

      // First get the asset ID for related record cleanup
      const { data: asset } = await this.supabase
        .from('media_assets')
        .select('id')
        .eq('cloudinary_public_id', publicId)
        .single()

      if (asset) {
        // Delete related records to avoid foreign key constraints
        await this.supabase
          .from('media_usage')
          .delete()
          .eq('media_asset_id', asset.id)
      }

      // Then delete the main record
      const { error } = await this.supabase
        .from('media_assets')
        .delete()
        .eq('cloudinary_public_id', publicId)

      if (error) {
        throw new Error(`Failed to hard delete media asset: ${error.message}`)
      }

      console.log('[SupabaseMediaService] Successfully hard deleted media asset:', publicId)
      return true
    } catch (error) {
      console.error('[SupabaseMediaService] Hard delete failed:', error)
      throw error
    }
  }

  /**
   * Update sync status
   */
  static async updateSyncStatus(
    publicId: string,
    status: 'synced' | 'pending' | 'error',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('update_media_sync_status', {
          asset_id: publicId,
          new_status: status,
          error_msg: errorMessage
        })

      if (error) {
        throw new Error(`Failed to update sync status: ${error.message}`)
      }

      return data as boolean
    } catch (error) {
      console.error('[SupabaseMediaService] Update sync status failed:', error)
      throw error
    }
  }

  /**
   * Log sync operation
   */
  static async logSyncOperation(log: Partial<MediaSyncLog>): Promise<MediaSyncLog> {
    try {
      const { data, error } = await this.supabase
        .from('media_sync_log')
        .insert({
          ...log,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to log sync operation: ${error.message}`)
      }

      return data as MediaSyncLog
    } catch (error) {
      console.error('[SupabaseMediaService] Log sync operation failed:', error)
      throw error
    }
  }

  /**
   * Queue Cloudinary cleanup operation
   */
  static async queueCloudinaryCleanup(
    publicId: string,
    resourceType: string = 'image',
    options: {
      originalFilename?: string
      fileSize?: number
      folder?: string
      deletionReason?: string
      triggerSource?: string
      triggeredBy?: string
    } = {}
  ): Promise<string> {
    try {
      console.log('[SupabaseMediaService] Queueing Cloudinary cleanup:', publicId)

      const { data, error } = await this.supabase
        .rpc('queue_cloudinary_cleanup', {
          public_id: publicId,
          resource_type: resourceType,
          original_filename: options.originalFilename,
          file_size: options.fileSize,
          folder: options.folder,
          deletion_reason: options.deletionReason || 'manual_deletion',
          trigger_source: options.triggerSource || 'api',
          triggered_by_user: options.triggeredBy
        })

      if (error) {
        throw new Error(`Failed to queue Cloudinary cleanup: ${error.message}`)
      }

      return data as string
    } catch (error) {
      console.error('[SupabaseMediaService] Queue cleanup failed:', error)
      throw error
    }
  }

  /**
   * Get pending cleanup items
   */
  static async getPendingCleanupItems(limit: number = 10): Promise<Array<{
    id: string
    cloudinary_public_id: string
    resource_type: string
    original_filename?: string
    file_size?: number
    folder?: string
    deletion_reason: string
    trigger_source: string
    triggered_by?: string
    queued_at: string
    processing_attempts: number
    max_attempts: number
  }>> {
    try {
      console.log('[SupabaseMediaService] Getting pending cleanup items...')

      const { data, error } = await this.supabase
        .rpc('get_pending_cleanup_items', { limit_count: limit })

      if (error) {
        throw new Error(`Failed to get pending cleanup items: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('[SupabaseMediaService] Get pending cleanup items failed:', error)
      throw error
    }
  }

  /**
   * Update cleanup queue status
   */
  static async updateCleanupQueueStatus(
    queueId: string,
    status: string,
    cloudinaryResponse?: unknown,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      console.log('[SupabaseMediaService] Updating cleanup queue status:', queueId, status)

      const { data, error } = await this.supabase
        .rpc('update_cleanup_queue_status', {
          queue_id: queueId,
          new_status: status,
          cloudinary_response: cloudinaryResponse ? JSON.stringify(cloudinaryResponse) : null,
          error_msg: errorMessage
        })

      if (error) {
        throw new Error(`Failed to update cleanup queue status: ${error.message}`)
      }

      return data as boolean
    } catch (error) {
      console.error('[SupabaseMediaService] Update cleanup queue status failed:', error)
      throw error
    }
  }
}
