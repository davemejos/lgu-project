/**
 * Real-time Media Provider - Phase 2 Implementation
 * 
 * Provides real-time Supabase subscriptions for media library updates.
 * Eliminates setTimeout delays with immediate WebSocket-based updates.
 * 
 * Features:
 * - Real-time database subscriptions
 * - Automatic Redux state updates
 * - Connection management and error handling
 * - Optimistic update confirmations
 * 
 * @author LGU Project Team
 * @version 2.0.0
 */

'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/lib/store'
import { createClient } from '@/utils/supabase/client'
import {
  setSubscriptionActive,
  handleRealtimeInsert,
  handleRealtimeUpdate,
  handleRealtimeDelete,
  confirmOptimisticItem,
  setError
} from '@/lib/redux/slices/mediaSlice'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { MediaAsset } from '@/lib/database.types'

interface RealtimeMediaProviderProps {
  children: React.ReactNode
}

export default function RealtimeMediaProvider({ children }: RealtimeMediaProviderProps) {
  const dispatch = useAppDispatch()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    console.log('[RealtimeMediaProvider] Initializing real-time subscriptions...')

    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 2000

    const setupSubscription = async () => {
      try {
        // Check if user is authenticated first
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.warn('[RealtimeMediaProvider] Auth error:', authError.message)
          dispatch(setError('Authentication required for real-time updates'))
          return
        }

        if (!user) {
          console.warn('[RealtimeMediaProvider] No authenticated user found')
          dispatch(setError('Please sign in to receive real-time updates'))
          return
        }

        console.log('[RealtimeMediaProvider] User authenticated, setting up subscription...')

        // Create real-time channel for media_assets table
        const channel = supabase
          .channel('media_assets_changes', {
            config: {
              broadcast: { self: true },
              presence: { key: user.id }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'media_assets',
              filter: 'deleted_at=is.null'
            },
            (payload) => {
              console.log('[RealtimeMediaProvider] New media asset inserted:', payload.new)

              try {
                // Dispatch real-time insert to Redux
                dispatch(handleRealtimeInsert(payload.new as MediaAsset))

                // Check if this confirms an optimistic update
                const newAsset = payload.new as MediaAsset
                if (newAsset.cloudinary_public_id) {
                  console.log('[RealtimeMediaProvider] Asset confirmed via real-time:', newAsset.cloudinary_public_id)
                }
              } catch (error) {
                console.error('[RealtimeMediaProvider] Error handling INSERT:', error)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'media_assets'
            },
            (payload) => {
              console.log('[RealtimeMediaProvider] Media asset updated:', payload.new)

              try {
                dispatch(handleRealtimeUpdate(payload.new as MediaAsset))
              } catch (error) {
                console.error('[RealtimeMediaProvider] Error handling UPDATE:', error)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'media_assets'
            },
            async (payload) => {
              console.log('[RealtimeMediaProvider] 🗑️ REALTIME DELETE EVENT TRIGGERED!')
              console.log('[RealtimeMediaProvider] 🗑️ Deleted asset payload:', JSON.stringify(payload, null, 2))

              try {
                const deletedAsset = payload.old as MediaAsset
                console.log('[RealtimeMediaProvider] 🗑️ Parsed deleted asset:', {
                  id: deletedAsset.id,
                  cloudinary_public_id: deletedAsset.cloudinary_public_id,
                  original_filename: deletedAsset.original_filename
                })

                // Update UI immediately
                dispatch(handleRealtimeDelete(deletedAsset.id))
                console.log('[RealtimeMediaProvider] ✅ UI updated - removed from state')

                // CRITICAL: Also delete from Cloudinary when deleted from database
                if (deletedAsset.cloudinary_public_id) {
                  console.log('[RealtimeMediaProvider] 🔄 STARTING Cloudinary deletion for:', deletedAsset.cloudinary_public_id)

                  try {
                    const deleteUrl = '/api/cloudinary/media'
                    console.log('[RealtimeMediaProvider] 📡 Making DELETE request to:', deleteUrl)
                    console.log('[RealtimeMediaProvider] 📡 Request payload:', JSON.stringify({
                      public_ids: [deletedAsset.cloudinary_public_id]
                    }, null, 2))

                    const response = await fetch(deleteUrl, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        public_ids: [deletedAsset.cloudinary_public_id]
                      })
                    })

                    console.log('[RealtimeMediaProvider] 📡 DELETE response status:', response.status)
                    const responseText = await response.text()
                    console.log('[RealtimeMediaProvider] 📡 DELETE response body:', responseText)

                    if (response.ok) {
                      console.log('[RealtimeMediaProvider] ✅ Successfully deleted from Cloudinary:', deletedAsset.cloudinary_public_id)
                    } else {
                      console.error('[RealtimeMediaProvider] ❌ Failed to delete from Cloudinary. Status:', response.status)
                      console.error('[RealtimeMediaProvider] ❌ Response:', responseText)
                    }
                  } catch (cloudinaryError) {
                    console.error('[RealtimeMediaProvider] ❌ Network error deleting from Cloudinary:', cloudinaryError)
                  }
                } else {
                  console.warn('[RealtimeMediaProvider] ⚠️ No cloudinary_public_id found for deleted asset:', deletedAsset)
                }
              } catch (error) {
                console.error('[RealtimeMediaProvider] ❌ Error handling DELETE event:', error)
                console.error('[RealtimeMediaProvider] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
              }
            }
          )
          .subscribe((status, err) => {
            console.log('[RealtimeMediaProvider] Subscription status:', status, err)

            switch (status) {
              case 'SUBSCRIBED':
                console.log('✅ Real-time media subscriptions active')
                dispatch(setSubscriptionActive(true))
                dispatch(setError(null)) // Clear any previous errors
                retryCount = 0 // Reset retry count on success
                break
              case 'CHANNEL_ERROR':
                console.error('❌ Real-time subscription error:', err)
                dispatch(setSubscriptionActive(false))

                // Retry logic for channel errors
                if (retryCount < maxRetries) {
                  retryCount++
                  console.log(`[RealtimeMediaProvider] Retrying subscription (${retryCount}/${maxRetries}) in ${retryDelay}ms...`)
                  setTimeout(() => {
                    setupSubscription()
                  }, retryDelay * retryCount)
                } else {
                  dispatch(setError('Real-time connection failed after multiple attempts'))
                }
                break
              case 'TIMED_OUT':
                console.warn('⏰ Real-time subscription timed out')
                dispatch(setSubscriptionActive(false))

                // Retry on timeout
                if (retryCount < maxRetries) {
                  retryCount++
                  setTimeout(() => {
                    setupSubscription()
                  }, retryDelay)
                }
                break
              case 'CLOSED':
                console.log('🔌 Real-time subscription closed')
                dispatch(setSubscriptionActive(false))
                break
              default:
                console.log(`[RealtimeMediaProvider] Status: ${status}`)
            }
          })

        channelRef.current = channel

      } catch (error) {
        console.error('[RealtimeMediaProvider] Setup failed:', error)
        dispatch(setError('Failed to setup real-time connection'))

        // Retry on setup failure
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(() => {
            setupSubscription()
          }, retryDelay * retryCount)
        }
      }
    }

    // Initial setup
    setupSubscription()

    // Cleanup function
    return () => {
      console.log('[RealtimeMediaProvider] Cleaning up real-time subscriptions...')
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.warn('[RealtimeMediaProvider] Error removing channel:', error)
        }
        channelRef.current = null
      }
      dispatch(setSubscriptionActive(false))
    }
  }, [dispatch, supabase])

  // Handle connection recovery
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && channelRef.current) {
        console.log('[RealtimeMediaProvider] Page visible, checking connection...')
        // Supabase automatically handles reconnection
      }
    }

    const handleOnline = () => {
      console.log('[RealtimeMediaProvider] Network online, reconnecting...')
      // Supabase automatically handles reconnection
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return <>{children}</>
}

/**
 * Hook for triggering immediate sync after upload
 */
export const useImmediateSync = () => {
  const dispatch = useAppDispatch()

  const triggerImmediateSync = async (publicId: string, action: 'upload' | 'delete' | 'update' = 'upload') => {
    try {
      console.log(`[useImmediateSync] Triggering immediate sync for ${publicId}`)
      
      const response = await fetch('/api/cloudinary/webhook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger immediate sync')
      }

      const result = await response.json()
      console.log('[useImmediateSync] Immediate sync triggered successfully:', result)
      
      return result
    } catch (error) {
      console.error('[useImmediateSync] Failed to trigger immediate sync:', error)
      dispatch(setError('Failed to trigger immediate sync'))
      throw error
    }
  }

  return { triggerImmediateSync }
}

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdates = () => {
  const dispatch = useAppDispatch()

  const addOptimistic = (tempId: string, asset: Partial<MediaAsset>) => {
    dispatch({
      type: 'media/addOptimisticItem',
      payload: { tempId, asset }
    })
  }

  const confirmOptimistic = (tempId: string, confirmedAsset: MediaAsset) => {
    dispatch(confirmOptimisticItem({ tempId, confirmedAsset }))
  }

  const rollbackOptimistic = (tempId: string) => {
    dispatch({
      type: 'media/rollbackOptimisticItem',
      payload: tempId
    })
  }

  return {
    addOptimistic,
    confirmOptimistic,
    rollbackOptimistic
  }
}

/**
 * Hook for upload progress tracking
 */
export const useUploadProgress = () => {
  const dispatch = useAppDispatch()

  const updateProgress = (tempId: string, progress: { status: string; progress: number; [key: string]: unknown }) => {
    dispatch({
      type: 'media/updateUploadProgress',
      payload: { tempId, progress }
    })
  }

  const clearProgress = (tempId: string) => {
    dispatch({
      type: 'media/clearUploadProgress',
      payload: tempId
    })
  }

  return {
    updateProgress,
    clearProgress
  }
}
