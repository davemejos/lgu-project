/**
 * Cloudinary Client-Side Utilities
 * 
 * This module provides client-side utilities for Cloudinary integration.
 * It handles URL generation and transformations without requiring server-side modules.
 * 
 * Features:
 * - URL generation with transformations
 * - Client-safe configuration
 * - Image optimization helpers
 * - Responsive image utilities
 * 
 * Usage:
 * ```typescript
 * import { generateCloudinaryUrl, getOptimizedImageUrl } from '@/lib/cloudinaryClient'
 * 
 * const url = generateCloudinaryUrl('my-image', { width: 300, height: 300 })
 * ```
 */

/**
 * Cloudinary configuration constants
 */
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  baseUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''}`
} as const

/**
 * Upload presets configuration
 */
export const UPLOAD_PRESETS = {
  LGU_PROJECT: 'lgu_project',
  PERSONNEL: 'lgu_project',
  DOCUMENTS: 'lgu_project',
  MEDIA: 'lgu_project'
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
 * Transformation options interface
 */
export interface TransformationOptions {
  width?: number
  height?: number
  crop?: string
  gravity?: string
  quality?: string | number
  format?: string
  fetch_format?: string
  dpr?: string | number
  flags?: string
  effect?: string
  overlay?: string
  underlay?: string
  border?: string
  radius?: string | number
  angle?: number
  opacity?: number
  background?: string
  color?: string
  [key: string]: unknown
}

/**
 * Generate a Cloudinary URL with transformations (client-side safe)
 * @param publicId - Public ID of the image
 * @param transformations - Transformation options
 * @returns string - Cloudinary URL
 */
export function generateCloudinaryUrl(
  publicId: string,
  transformations: TransformationOptions = {}
): string {
  if (!CLOUDINARY_CONFIG.cloudName) {
    console.warn('[CloudinaryClient] Cloud name not configured')
    return ''
  }

  if (!publicId) {
    console.warn('[CloudinaryClient] Public ID is required')
    return ''
  }

  try {
    // Build transformation string
    const transformParts: string[] = []

    // Add each transformation parameter
    Object.entries(transformations).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert camelCase to snake_case for Cloudinary API
        const cloudinaryKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        transformParts.push(`${cloudinaryKey}_${value}`)
      }
    })

    // Build the URL
    const transformString = transformParts.length > 0 ? `/${transformParts.join(',')}` : ''
    const url = `${CLOUDINARY_CONFIG.baseUrl}/image/upload${transformString}/${publicId}`

    return url

  } catch (error) {
    console.error('[CloudinaryClient] URL generation failed:', error)
    return ''
  }
}

/**
 * Get optimized image URL for different use cases (client-side safe)
 */
export const getOptimizedImageUrl = {
  /**
   * Profile photo optimization
   */
  profile: (publicId: string, size: number = 200) => 
    generateCloudinaryUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto',
      dpr: 'auto'
    }),

  /**
   * Thumbnail optimization
   */
  thumbnail: (publicId: string, width: number = 150, height: number = 150) =>
    generateCloudinaryUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
      dpr: 'auto'
    }),

  /**
   * Full size image optimization
   */
  fullSize: (publicId: string, maxWidth: number = 1200) =>
    generateCloudinaryUrl(publicId, {
      width: maxWidth,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
      dpr: 'auto'
    }),

  /**
   * Document preview optimization
   */
  document: (publicId: string, width: number = 800) =>
    generateCloudinaryUrl(publicId, {
      width,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
      dpr: 'auto'
    }),

  /**
   * Responsive image with multiple sizes
   */
  responsive: (publicId: string, sizes: number[] = [300, 600, 900, 1200]) =>
    sizes.map(size => ({
      size,
      url: generateCloudinaryUrl(publicId, {
        width: size,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
        dpr: 'auto'
      })
    })),

  /**
   * Natural aspect ratio optimization for media libraries
   */
  natural: (publicId: string, maxWidth: number = 400) =>
    generateCloudinaryUrl(publicId, {
      width: maxWidth,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
      dpr: 'auto'
    })
}

/**
 * Generate srcSet for responsive images
 * @param publicId - Public ID of the image
 * @param sizes - Array of widths
 * @returns string - srcSet string
 */
export function generateSrcSet(
  publicId: string,
  sizes: number[] = [300, 600, 900, 1200]
): string {
  return sizes
    .map(size => {
      const url = generateCloudinaryUrl(publicId, {
        width: size,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
        dpr: 'auto'
      })
      return `${url} ${size}w`
    })
    .join(', ')
}

/**
 * Check if a URL is a Cloudinary URL
 * @param url - URL to check
 * @returns boolean
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com')
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns string - Public ID or empty string
 */
export function extractPublicIdFromUrl(url: string): string {
  try {
    if (!isCloudinaryUrl(url)) {
      return ''
    }

    // Match pattern: .../image/upload/[transformations/]public_id.format
    const match = url.match(/\/image\/upload\/(?:.*\/)?([^\/]+?)(?:\.[^.]+)?$/)
    return match ? match[1] : ''

  } catch (error) {
    console.error('[CloudinaryClient] Failed to extract public ID:', error)
    return ''
  }
}

/**
 * Validate Cloudinary configuration
 * @returns boolean - True if configuration is valid
 */
export function validateCloudinaryConfig(): boolean {
  const isValid = !!(CLOUDINARY_CONFIG.cloudName)
  
  if (!isValid) {
    console.error('[CloudinaryClient] Invalid configuration:', {
      cloudName: !!CLOUDINARY_CONFIG.cloudName
    })
  }

  return isValid
}

/**
 * Get Cloudinary configuration for client-side use
 * @returns object - Safe configuration object
 */
export function getCloudinaryConfig() {
  return {
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPresets: UPLOAD_PRESETS,
    folders: CLOUDINARY_FOLDERS,
    isConfigured: validateCloudinaryConfig()
  }
}
