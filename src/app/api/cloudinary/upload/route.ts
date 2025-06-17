/**
 * Cloudinary Upload API Route
 * 
 * Handles server-side uploads to Cloudinary for the LGU Project.
 * Provides secure upload functionality with proper validation and error handling.
 * 
 * Features:
 * - File validation (type, size)
 * - Secure uploads with API keys
 * - Database integration for metadata storage
 * - Error handling and logging
 * - Support for multiple file types
 * 
 * Usage:
 * POST /api/cloudinary/upload
 * Content-Type: multipart/form-data
 * Body: { file: File, folder?: string, tags?: string[] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from '@/lib/cloudinary'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'
import { createClient } from '@/utils/supabase/server'

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]



/**
 * POST /api/cloudinary/upload
 * Upload files to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cloudinary API] Upload request received')

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || CLOUDINARY_FOLDERS.MEDIA
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []
    const public_id = formData.get('public_id') as string
    const personnel_id = formData.get('personnel_id') ? parseInt(formData.get('personnel_id') as string) : undefined
    const document_type = formData.get('document_type') as string
    const description = formData.get('description') as string

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size ${file.size} exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes` },
        { status: 400 }
      )
    }

    console.log('[Cloudinary API] File validation passed:', {
      name: file.name,
      type: file.type,
      size: file.size,
      folder
    })

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file, {
      folder,
      tags: ['lgu-project', ...tags],
      public_id,
      resource_type: 'auto'
    })

    console.log('[Cloudinary API] Upload successful:', uploadResult.public_id)

    // Phase 2 Enhancement: Immediate database sync + webhook simulation
    let databaseSyncSuccess = false
    let databaseSyncError = null
    let immediateSync = false

    try {
      // Get the current user for uploaded_by field (required for RLS)
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.warn('[Cloudinary API] No authenticated user found for upload:', authError?.message)
        // For now, we'll continue without user ID, but this should be addressed
      }

      const mediaAsset = {
        cloudinary_public_id: uploadResult.public_id,
        cloudinary_version: uploadResult.version,
        cloudinary_signature: uploadResult.signature,
        cloudinary_etag: uploadResult.etag,
        original_filename: uploadResult.original_filename || file.name,
        display_name: uploadResult.original_filename || file.name, // Add display_name
        file_size: uploadResult.bytes,
        mime_type: file.type,
        format: uploadResult.format,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        folder: uploadResult.folder,
        tags: uploadResult.tags || [],
        description: description,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        resource_type: uploadResult.resource_type as 'image' | 'video' | 'raw',
        cloudinary_created_at: uploadResult.created_at,
        sync_status: 'synced' as const,
        uploaded_by: user?.id || null, // Add uploaded_by for RLS
        used_in_personnel: personnel_id,
        access_mode: 'public' as const // Add access_mode with default
      }

      await SupabaseMediaService.upsertMediaAsset(mediaAsset)

      // Log the upload operation
      await SupabaseMediaService.logSyncOperation({
        operation: 'upload',
        status: 'synced',
        cloudinary_public_id: uploadResult.public_id,
        source: 'admin',
        file_size: uploadResult.bytes,
        operation_data: {
          upload_result: uploadResult,
          personnel_id,
          document_type
        }
      })

      databaseSyncSuccess = true
      console.log('[Cloudinary API] Media asset saved to database for bidirectional sync')

      // Phase 2 Enhancement: Trigger immediate webhook simulation for real-time updates
      try {
        console.log('[Cloudinary API] [Phase 2] Triggering immediate webhook simulation...')

        const webhookSimulation = {
          notification_type: 'upload',
          timestamp: new Date().toISOString(),
          request_id: `upload_${Date.now()}`,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          created_at: uploadResult.created_at,
          tags: uploadResult.tags || [],
          source: 'upload_api'
        }

        // Import the webhook handler function
        const { BidirectionalSyncService } = await import('@/lib/bidirectionalSyncService')
        await BidirectionalSyncService.handleCloudinaryWebhook(webhookSimulation)

        immediateSync = true
        console.log('[Cloudinary API] [Phase 2] Immediate webhook simulation completed successfully!')

      } catch (webhookError) {
        console.warn('[Cloudinary API] [Phase 2] Immediate webhook simulation failed:', webhookError)
        // Don't fail the upload if webhook simulation fails
      }

    } catch (dbError) {
      console.error('[Cloudinary API] Database sync failed:', dbError)
      databaseSyncError = dbError instanceof Error ? dbError.message : 'Database sync failed'

      // Don't fail the upload if database save fails, but try to log it
      try {
        await SupabaseMediaService.logSyncOperation({
          operation: 'upload',
          status: 'error',
          cloudinary_public_id: uploadResult.public_id,
          source: 'admin',
          error_message: databaseSyncError,
          file_size: uploadResult.bytes
        })
      } catch (logError) {
        console.error('[Cloudinary API] Failed to log sync error:', logError)
      }
    }

    // Return success response with database sync status
    return NextResponse.json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        version: uploadResult.version,
        signature: uploadResult.signature,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type,
        created_at: uploadResult.created_at,
        tags: uploadResult.tags,
        bytes: uploadResult.bytes,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,
        folder: uploadResult.folder,
        original_filename: uploadResult.original_filename
      },
      database_sync: {
        success: databaseSyncSuccess,
        error: databaseSyncError,
        immediate_sync: immediateSync,
        message: databaseSyncSuccess
          ? immediateSync
            ? '[Phase 2] File uploaded, synced to database, and real-time updates triggered!'
            : 'File uploaded and synced to database successfully'
          : 'File uploaded to Cloudinary but database sync failed - run database setup script'
      },
      warnings: databaseSyncSuccess ? [] : [
        'Database sync failed - media will not persist on refresh',
        'Run the SQL script from docs/full-complete-supabase-script.md to enable persistence',
        'Then use the sync button to import existing files'
      ]
    })

  } catch (error) {
    console.error('[Cloudinary API] Upload failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cloudinary/upload
 * Get upload configuration and limits
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        maxFileSize: MAX_FILE_SIZE,
        allowedFileTypes: ALLOWED_FILE_TYPES,
        folders: CLOUDINARY_FOLDERS,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      }
    })
  } catch (error) {
    console.error('[Cloudinary API] Config fetch failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}
