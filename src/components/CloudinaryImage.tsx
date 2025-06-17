/**
 * Cloudinary Image Component
 * 
 * A reusable component that wraps the Cloudinary CldImage component for the LGU Project.
 * Provides optimized image delivery with automatic format selection and responsive sizing.
 * 
 * Features:
 * - Automatic optimization (format, quality)
 * - Responsive sizing
 * - Lazy loading
 * - Error handling with fallback
 * - Accessibility support
 * - Various preset configurations
 * 
 * Usage:
 * ```tsx
 * <CloudinaryImage
 *   src="personnel/john-doe"
 *   alt="John Doe Profile"
 *   width={200}
 *   height={200}
 *   preset="profile"
 * />
 * ```
 */

'use client'

import { CldImage } from 'next-cloudinary'
import { useState } from 'react'
import NextImage from 'next/image'
import { User, FileText, Image as ImageIcon } from 'lucide-react'

/**
 * Props for CloudinaryImage component
 */
export interface CloudinaryImageProps {
  /** Cloudinary public ID */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image width */
  width: number
  /** Image height */
  height: number
  /** Preset configuration */
  preset?: 'profile' | 'thumbnail' | 'fullSize' | 'document' | 'media'
  /** Custom transformations */
  transformations?: Record<string, unknown>
  /** CSS classes */
  className?: string
  /** Loading priority */
  priority?: boolean
  /** Placeholder while loading */
  placeholder?: 'blur' | 'empty'
  /** Fallback image when error occurs */
  fallback?: string
  /** Click handler */
  onClick?: () => void
  /** Crop mode */
  crop?: "auto" | "fill" | "scale" | "limit" | "crop" | "fill_pad" | "fit" | "imagga_crop" | "imagga_scale" | "lfill" | "lpad" | "mfit" | "mpad" | "pad" | "thumb"
  /** Gravity for cropping */
  gravity?: string
  /** Quality setting */
  quality?: string | number
  /** Format override */
  format?: string
  /** Sizes for responsive images */
  sizes?: string
}

/**
 * CloudinaryImage Component
 */
export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  preset,
  transformations = {},
  className = '',
  priority = false,
  placeholder = 'empty',
  fallback,
  onClick,
  crop,
  gravity,
  quality = 'auto',
  format = 'auto',
  sizes
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Get preset transformations
   */
  const getPresetTransformations = () => {
    const presets = {
      profile: {
        width,
        height,
        crop: crop || 'fill',
        gravity: gravity || 'face',
        quality,
        format
      },
      thumbnail: {
        width,
        height,
        crop: crop || 'fill',
        quality,
        format
      },
      fullSize: {
        width,
        crop: crop || 'limit',
        quality,
        format
      },
      document: {
        width,
        crop: crop || 'limit',
        quality,
        format
      },
      media: {
        width,
        height,
        crop: crop || 'fit',
        quality,
        format
      }
    }

    return preset ? presets[preset] : { width, height, quality, format }
  }

  /**
   * Handle image load
   */
  const handleLoad = () => {
    setIsLoading(false)
  }

  /**
   * Handle image error
   */
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  /**
   * Get fallback icon based on preset
   */
  const getFallbackIcon = () => {
    switch (preset) {
      case 'profile':
        return <User className="h-8 w-8 text-gray-400" />
      case 'document':
        return <FileText className="h-8 w-8 text-gray-400" />
      default:
        return <ImageIcon className="h-8 w-8 text-gray-400" />
    }
  }

  /**
   * Render fallback UI
   */
  const renderFallback = () => (
    <div 
      className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {fallback ? (
        <NextImage
          src={fallback}
          alt={alt}
          width={width || 200}
          height={height || 200}
          className="w-full h-full object-cover rounded"
          onLoad={handleLoad}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          {getFallbackIcon()}
          <span className="text-xs mt-1">No image</span>
        </div>
      )}
    </div>
  )

  /**
   * Render loading placeholder
   */
  const renderLoading = () => (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    >
      <div className="flex items-center justify-center h-full">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  )

  // Show fallback if error occurred
  if (hasError) {
    return renderFallback()
  }

  // Show loading placeholder
  if (isLoading && placeholder === 'blur') {
    return renderLoading()
  }

  try {
    return (
      <CldImage
        src={src}
        alt={alt}
        className={className}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        {...getPresetTransformations()}
        {...transformations}
      />
    )
  } catch (error) {
    console.error('[CloudinaryImage] Render error:', error)
    return renderFallback()
  }
}

/**
 * Preset components for common use cases
 */
export const CloudinaryImagePresets = {
  /**
   * Profile photo component
   */
  Profile: ({ src, alt, size = 200, className = '', ...props }: 
    Omit<CloudinaryImageProps, 'width' | 'height' | 'preset'> & { size?: number }) => (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      preset="profile"
      className={`rounded-full ${className}`}
      {...props}
    />
  ),

  /**
   * Thumbnail component
   */
  Thumbnail: ({ src, alt, width = 150, height = 150, className = '', ...props }: 
    Omit<CloudinaryImageProps, 'preset'>) => (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      preset="thumbnail"
      className={`rounded-lg ${className}`}
      {...props}
    />
  ),

  /**
   * Document preview component
   */
  Document: ({ src, alt, width = 200, height = 250, className = '', ...props }: 
    Omit<CloudinaryImageProps, 'preset'>) => (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      preset="document"
      className={`rounded-lg border border-gray-200 ${className}`}
      {...props}
    />
  ),

  /**
   * Media gallery component
   */
  Media: ({ src, alt, width = 300, height = 200, className = '', ...props }:
    Omit<CloudinaryImageProps, 'preset'>) => (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      preset="media"
      className={`rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
      {...props}
    />
  ),

  /**
   * Natural aspect ratio component for media libraries
   */
  Natural: ({ src, alt, maxWidth = 400, className = '', ...props }:
    Omit<CloudinaryImageProps, 'width' | 'height' | 'preset'> & { maxWidth?: number }) => (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={maxWidth}
      height={maxWidth}
      crop="limit"
      quality="auto"
      format="auto"
      className={`w-full h-auto max-w-full rounded-lg ${className}`}
      {...props}
    />
  )
}

/**
 * Avatar component with fallback
 */
export function CloudinaryAvatar({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  ...props 
}: Omit<CloudinaryImageProps, 'width' | 'height' | 'preset'> & { size?: number }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <CloudinaryImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        preset="profile"
        className="rounded-full ring-2 ring-white shadow-sm"
        {...props}
      />
    </div>
  )
}

/**
 * Image gallery grid component with natural aspect ratios
 */
export function CloudinaryImageGrid({
  images,
  onImageClick,
  className = ''
}: {
  images: Array<{ src: string; alt: string; id?: string }>
  onImageClick?: (image: { src: string; alt: string; id?: string }) => void
  className?: string
}) {
  return (
    <div className={`columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 ${className}`}>
      {images.map((image, index) => (
        <div key={image.id || index} className="break-inside-avoid mb-4">
          <CloudinaryImagePresets.Natural
            src={image.src}
            alt={image.alt}
            maxWidth={400}
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick?.(image)}
          />
        </div>
      ))}
    </div>
  )
}
