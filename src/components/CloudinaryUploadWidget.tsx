/**
 * Cloudinary Upload Widget Component
 * 
 * A reusable component that wraps the Cloudinary Upload Widget for the LGU Project.
 * Provides a professional upload interface with proper error handling and callbacks.
 * 
 * Features:
 * - Drag and drop upload
 * - Multiple file selection
 * - Image preview and cropping
 * - Progress tracking
 * - Error handling
 * - Customizable upload presets
 * 
 * Usage:
 * ```tsx
 * <CloudinaryUploadWidget
 *   onUploadSuccess={(result) => console.log('Uploaded:', result)}
 *   folder="personnel"
 *   multiple={false}
 * />
 * ```
 */

'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults, CloudinaryUploadWidgetError } from 'next-cloudinary'
import { Upload, Image, FileText, Video } from 'lucide-react'
import { UPLOAD_PRESETS, CLOUDINARY_FOLDERS } from '@/lib/cloudinaryClient'

/**
 * Upload result from Cloudinary
 */
export interface CloudinaryUploadResult {
  event: string
  info: {
    public_id: string
    version: number
    signature: string
    width?: number
    height?: number
    format: string
    resource_type: string
    created_at: string
    tags: string[]
    bytes: number
    type: string
    etag: string
    url: string
    secure_url: string
    folder?: string
    original_filename?: string
    display_name?: string
  }
}

/**
 * Props for CloudinaryUploadWidget component
 */
export interface CloudinaryUploadWidgetProps {
  /** Callback when upload is successful */
  onUploadSuccess?: (result: CloudinaryUploadResult) => void
  /** Callback when upload fails */
  onUploadError?: (error: { message?: string }) => void
  /** Callback when widget opens */
  onOpen?: () => void
  /** Callback when widget closes */
  onClose?: () => void
  /** Upload folder in Cloudinary */
  folder?: string
  /** Upload preset to use */
  uploadPreset?: string
  /** Allow multiple file uploads */
  multiple?: boolean
  /** Maximum number of files */
  maxFiles?: number
  /** Accepted file types */
  acceptedFileTypes?: string[]
  /** Maximum file size in bytes */
  maxFileSize?: number
  /** Button text */
  buttonText?: string
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Show upload sources */
  sources?: ('url' | 'local' | 'camera' | 'dropbox' | 'facebook' | 'gettyimages' | 'google_drive' | 'image_search' | 'instagram' | 'istock' | 'shutterstock' | 'unsplash')[]
  /** Custom button className */
  className?: string
  /** Disabled state */
  disabled?: boolean
  /** Show cropping options */
  cropping?: boolean
  /** Cropping aspect ratio */
  croppingAspectRatio?: number
}

/**
 * CloudinaryUploadWidget Component
 */
export default function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  onOpen,
  onClose,
  folder = CLOUDINARY_FOLDERS.MEDIA,
  uploadPreset = UPLOAD_PRESETS.LGU_PROJECT,
  multiple = false,
  maxFiles = 10,
  acceptedFileTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFileSize = 10485760, // 10MB
  buttonText = 'Upload Media',
  variant = 'primary',
  size = 'md',
  sources = ['local', 'url', 'camera'],
  className = '',
  disabled = false,
  cropping = false,
  croppingAspectRatio
}: CloudinaryUploadWidgetProps) {

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = async (results: CloudinaryUploadWidgetResults) => {
    console.log('[CloudinaryUploadWidget] Upload successful:', results)

    // Convert to our expected format
    const result: CloudinaryUploadResult = {
      event: results.event || 'success',
      info: results.info as CloudinaryUploadResult['info']
    }

    // Sync to database for bidirectional mirroring
    try {
      const response = await fetch('/api/cloudinary/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: false,
          batch_size: 1,
          single_asset: result.info.public_id
        })
      })

      if (response.ok) {
        console.log('[CloudinaryUploadWidget] Database sync successful')
      } else {
        console.warn('[CloudinaryUploadWidget] Database sync failed, but upload succeeded')
      }
    } catch (syncError) {
      console.warn('[CloudinaryUploadWidget] Database sync error:', syncError)
      // Don't fail the upload callback if sync fails
    }

    onUploadSuccess?.(result)
  }

  /**
   * Handle upload error
   */
  const handleUploadError = (error: CloudinaryUploadWidgetError) => {
    console.error('[CloudinaryUploadWidget] Upload error:', error)
    onUploadError?.(error as { message?: string })
  }

  /**
   * Get button styles based on variant and size
   */
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
  }

  /**
   * Get icon based on accepted file types
   */
  const getIcon = () => {
    const iconClass = buttonText ? "h-4 w-4 mr-2" : "h-4 w-4"

    if (acceptedFileTypes.includes('image/*')) {
      return <Image className={iconClass} aria-label="Image upload" />
    } else if (acceptedFileTypes.includes('video/*')) {
      return <Video className={iconClass} />
    } else if (acceptedFileTypes.includes('application/pdf')) {
      return <FileText className={iconClass} />
    }
    return <Upload className={iconClass} />
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        sources,
        multiple,
        maxFiles,
        maxFileSize,
        folder,
        tags: ['lgu-project', folder.split('/').pop() || 'general'],
        clientAllowedFormats: acceptedFileTypes,
        cropping,
        croppingAspectRatio,
        showAdvancedOptions: false,
        showCompletedButton: true,
        showUploadMoreButton: multiple,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#E5E7EB',
            tabIcon: '#6B7280',
            menuIcons: '#6B7280',
            textDark: '#111827',
            textLight: '#6B7280',
            link: '#3B82F6',
            action: '#3B82F6',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#F59E0B',
            complete: '#10B981',
            sourceBg: '#F9FAFB'
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
              active: true
            }
          }
        },
        text: {
          en: {
            queue: {
              title: 'Upload Files',
              title_uploading_with_counter: 'Uploading {{num}} files',
              title_processing_with_counter: 'Processing {{num}} files'
            },
            local: {
              browse: 'Browse Files',
              dd_title_single: 'Drag and Drop a file here',
              dd_title_multi: 'Drag and Drop files here'
            }
          }
        }
      }}
      onOpen={onOpen}
      onClose={onClose}
      onSuccess={handleUploadSuccess}
      onError={handleUploadError}
    >
      {({ open }) => (
        <button
          onClick={() => open()}
          disabled={disabled}
          className={getButtonStyles()}
          type="button"
        >
          {getIcon()}
          {buttonText}
        </button>
      )}
    </CldUploadWidget>
  )
}

/**
 * Preset configurations for common use cases
 */
export const UploadWidgetPresets = {
  /**
   * Personnel photo upload
   */
  PersonnelPhoto: (props: Partial<CloudinaryUploadWidgetProps> = {}) => (
    <CloudinaryUploadWidget
      folder={CLOUDINARY_FOLDERS.PERSONNEL}
      acceptedFileTypes={['image/*']}
      multiple={false}
      maxFiles={1}
      cropping={true}
      croppingAspectRatio={1}
      buttonText="Upload Photo"
      variant="primary"
      {...props}
    />
  ),

  /**
   * Document upload
   */
  Document: (props: Partial<CloudinaryUploadWidgetProps> = {}) => (
    <CloudinaryUploadWidget
      folder={CLOUDINARY_FOLDERS.DOCUMENTS}
      acceptedFileTypes={['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
      multiple={true}
      maxFiles={5}
      buttonText="Upload Documents"
      variant="secondary"
      {...props}
    />
  ),

  /**
   * General media upload
   */
  Media: (props: Partial<CloudinaryUploadWidgetProps> = {}) => (
    <CloudinaryUploadWidget
      folder={CLOUDINARY_FOLDERS.MEDIA}
      acceptedFileTypes={['image/*', 'video/*']}
      multiple={true}
      maxFiles={10}
      buttonText="Upload Media"
      variant="primary"
      {...props}
    />
  )
}
