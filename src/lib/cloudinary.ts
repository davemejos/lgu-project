/**
 * Cloudinary Configuration and Utilities
 *
 * This module provides configuration and utility functions for Cloudinary integration
 * in the LGU Project. It handles image uploads, transformations, and media management.
 *
 * Features:
 * - Cloudinary client configuration (server-side only)
 * - Upload utilities with preset handling
 * - Image transformation helpers
 * - Media library integration
 *
 * Usage:
 * ```typescript
 * // Server-side only
 * import { cloudinary, uploadToCloudinary } from '@/lib/cloudinary'
 *
 * const result = await uploadToCloudinary(file, { folder: 'personnel' })
 * ```
 */

// Only import Cloudinary SDK on server-side
let cloudinary: typeof import('cloudinary').v2 | null = null

// Initialize Cloudinary on server-side
async function initCloudinary() {
  if (typeof window === 'undefined' && !cloudinary) {
    const cloudinaryModule = await import('cloudinary')
    cloudinary = cloudinaryModule.v2

    // Configure Cloudinary
    if (cloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      })
    }
  }
  return cloudinary
}

// Validate required environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables:', {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret
  })
}

// Cloudinary will be configured in initCloudinary function

/**
 * Cloudinary upload presets configuration
 */
export const UPLOAD_PRESETS = {
  LGU_PROJECT: 'lgu_project', // Main upload preset for LGU project
  PERSONNEL: 'lgu_project',   // Personnel photos
  DOCUMENTS: 'lgu_project',   // Document uploads
  MEDIA: 'lgu_project'        // General media uploads
} as const

/**
 * Cloudinary folders configuration
 */
export const CLOUDINARY_FOLDERS = {
  PERSONNEL: 'lgu-uploads/personnel',
  DOCUMENTS: 'lgu-uploads/documents',
  MEDIA: 'lgu-uploads/media',
  TEMP: 'lgu-uploads/temp'
} as const

/**
 * Upload options interface
 */
export interface CloudinaryUploadOptions {
  folder?: string
  public_id?: string
  tags?: string[]
  transformation?: Record<string, unknown>[]
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
  format?: string
  quality?: string | number
  width?: number
  height?: number
  crop?: string
}

/**
 * Upload result interface
 */
export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
  api_key: string
}

/**
 * Upload a file to Cloudinary (server-side only)
 * @param file - File to upload (can be File object, Buffer, or base64 string)
 * @param options - Upload options
 * @returns Promise<CloudinaryUploadResult>
 */
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const cloudinaryInstance = await initCloudinary()
  if (!cloudinaryInstance) {
    throw new Error('Cloudinary is not available. This function can only be used server-side.')
  }

  try {
    console.log('[Cloudinary] Starting upload with options:', options)

    // Convert File to base64 if needed
    let uploadData: string
    if (file instanceof File) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      uploadData = `data:${file.type};base64,${base64}`
    } else if (Buffer.isBuffer(file)) {
      uploadData = `data:application/octet-stream;base64,${file.toString('base64')}`
    } else {
      uploadData = file
    }

    // Default upload options
    const uploadOptions = {
      upload_preset: UPLOAD_PRESETS.LGU_PROJECT,
      folder: options.folder || CLOUDINARY_FOLDERS.MEDIA,
      resource_type: options.resource_type || 'auto',
      tags: ['lgu-project', ...(options.tags || [])],
      ...options
    }

    const result = await cloudinaryInstance.uploader.upload(uploadData, uploadOptions)

    console.log('[Cloudinary] Upload successful:', result.public_id)
    return result as unknown as CloudinaryUploadResult

  } catch (error) {
    console.error('[Cloudinary] Upload failed:', error)
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a file from Cloudinary (server-side only)
 * @param publicId - Public ID of the file to delete
 * @param resourceType - Type of resource (image, video, raw)
 * @returns Promise<any>
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<Record<string, unknown>> {
  const cloudinaryInstance = await initCloudinary()
  if (!cloudinaryInstance) {
    throw new Error('Cloudinary is not available. This function can only be used server-side.')
  }

  try {
    console.log('[Cloudinary] Deleting file:', publicId)

    const result = await cloudinaryInstance.uploader.destroy(publicId, {
      resource_type: resourceType
    })

    console.log('[Cloudinary] Delete result:', result)
    return result

  } catch (error) {
    console.error('[Cloudinary] Delete failed:', error)
    throw new Error(`Cloudinary delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId - Public ID of the image
 * @param transformations - Transformation options
 * @returns string - Cloudinary URL
 */
export async function generateCloudinaryUrl(
  publicId: string,
  transformations: Record<string, unknown> = {}
): Promise<string> {
  try {
    const cloudinaryInstance = await initCloudinary()
    if (!cloudinaryInstance) {
      console.error('[Cloudinary] Not available for URL generation')
      return ''
    }

    return cloudinaryInstance.url(publicId, {
      secure: true,
      ...transformations
    })
  } catch (error) {
    console.error('[Cloudinary] URL generation failed:', error)
    return ''
  }
}

/**
 * Get optimized image URL for different use cases
 */
export const getOptimizedImageUrl = {
  /**
   * Profile photo optimization
   */
  profile: async (publicId: string, size: number = 200) =>
    await generateCloudinaryUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto'
    }),

  /**
   * Thumbnail optimization
   */
  thumbnail: async (publicId: string, width: number = 150, height: number = 150) =>
    await generateCloudinaryUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),

  /**
   * Full size image optimization
   */
  fullSize: async (publicId: string, maxWidth: number = 1200) =>
    await generateCloudinaryUrl(publicId, {
      width: maxWidth,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),

  /**
   * Document preview optimization
   */
  document: async (publicId: string, width: number = 800) =>
    await generateCloudinaryUrl(publicId, {
      width,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    })
}

// Export the configured Cloudinary instance
export { cloudinary }

// Export configuration constants
export const CLOUDINARY_CONFIG = {
  cloudName,
  apiKey,
  // Don't export apiSecret for security
} as const
