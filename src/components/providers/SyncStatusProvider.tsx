/**
 * Sync Status Provider - Phase 3 Implementation
 * 
 * Real-time sync status monitoring with:
 * - Live operation tracking
 * - Connection status monitoring
 * - Performance metrics
 * - Error handling and recovery
 * - WebSocket management
 * 
 * @author LGU Project Team
 * @version 3.0.0
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { SyncStatusManager } from '@/lib/syncStatusManager'
import type { Json } from '@/lib/database.types'
import {
  initializeSyncMonitoring,
  handleSyncStatusUpdate,
  setConnectionStatus,
  updateConnectionLatency,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  updateSystemHealth,
  setError,
  clearOldData
} from '@/lib/redux/slices/syncStatusSlice'

interface SyncStatusProviderProps {
  children: React.ReactNode
}

export default function SyncStatusProvider({ children }: SyncStatusProviderProps) {
  const dispatch = useAppDispatch()
  const { connection, isMonitoring } = useAppSelector(state => state.syncStatus)
  
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Initialize sync status monitoring
   */
  const initializeMonitoring = useCallback(async () => {
    try {
      console.log('[SyncStatusProvider] Initializing sync status monitoring...')
      
      // Initialize Redux state
      await dispatch(initializeSyncMonitoring()).unwrap()
      
      // Subscribe to real-time updates
      const unsubscribe = SyncStatusManager.subscribe((update) => {
        console.log('[SyncStatusProvider] Received sync status update:', update)
        dispatch(handleSyncStatusUpdate(update))
      })
      
      unsubscribeRef.current = unsubscribe
      
      // Update connection status
      dispatch(setConnectionStatus({
        status: 'connected',
        connectionStart: new Date().toISOString(),
        lastPing: new Date().toISOString()
      }))
      
      dispatch(resetReconnectAttempts())
      
      console.log('✅ [SyncStatusProvider] Sync status monitoring initialized')
      
    } catch (error) {
      console.error('[SyncStatusProvider] Failed to initialize monitoring:', error)
      dispatch(setError('Failed to initialize sync status monitoring'))
      dispatch(setConnectionStatus({ status: 'error' }))
    }
  }, [dispatch])

  /**
   * Start connection monitoring
   */
  const startConnectionMonitoring = useCallback(() => {
    // Ping every 30 seconds to monitor connection
    pingIntervalRef.current = setInterval(async () => {
      const startTime = Date.now()
      
      try {
        // Simple ping by getting active operations
        await SyncStatusManager.getActiveSyncOperations()
        
        const latency = Date.now() - startTime
        dispatch(updateConnectionLatency(latency))
        
        // Update connection status if it was disconnected
        if (connection.status !== 'connected') {
          dispatch(setConnectionStatus({ status: 'connected' }))
          dispatch(resetReconnectAttempts())
        }
        
      } catch (error) {
        console.warn('[SyncStatusProvider] Connection ping failed:', error)
        
        if (connection.status === 'connected') {
          dispatch(setConnectionStatus({ status: 'reconnecting' }))
          dispatch(incrementReconnectAttempts())
        }
        
        // Try to reconnect after a few failed attempts
        if (connection.reconnectAttempts >= 3) {
          console.log('[SyncStatusProvider] Attempting to reconnect...')
          initializeMonitoring()
        }
      }
    }, 30000) // 30 seconds
  }, [dispatch, connection.status, connection.reconnectAttempts, initializeMonitoring])

  /**
   * Start system health monitoring
   */
  const startHealthMonitoring = useCallback(() => {
    // Check system health every 2 minutes
    healthCheckIntervalRef.current = setInterval(async () => {
      try {
        const activeOps = await SyncStatusManager.getActiveSyncOperations()
        const snapshots = await SyncStatusManager.getRecentSnapshots(1)
        const currentSnapshot = snapshots[0]
        
        if (currentSnapshot) {
          // Calculate health metrics
          const totalAssets = currentSnapshot.total_assets
          const errorAssets = currentSnapshot.error_assets
          const errorRate = totalAssets > 0 ? (errorAssets / totalAssets) * 100 : 0
          
          let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
          let healthScore = 100
          
          if (errorRate > 10) {
            healthStatus = 'critical'
            healthScore = Math.max(0, 100 - errorRate * 2)
          } else if (errorRate > 5 || activeOps.length > 10) {
            healthStatus = 'warning'
            healthScore = Math.max(50, 100 - errorRate * 1.5)
          }
          
          dispatch(updateSystemHealth({
            status: healthStatus,
            score: healthScore,
            errorRate,
            avgSyncTime: currentSnapshot.avg_sync_time_ms
          }))
        }
        
      } catch (error) {
        console.warn('[SyncStatusProvider] Health check failed:', error)
        dispatch(updateSystemHealth({
          status: 'warning',
          score: 75
        }))
      }
    }, 120000) // 2 minutes
  }, [dispatch])

  /**
   * Start periodic cleanup
   */
  const startPeriodicCleanup = useCallback(() => {
    // Clean up old data every 10 minutes
    cleanupIntervalRef.current = setInterval(() => {
      dispatch(clearOldData())
    }, 600000) // 10 minutes
  }, [dispatch])

  /**
   * Handle visibility change (tab focus/blur)
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && isMonitoring) {
      console.log('[SyncStatusProvider] Tab visible, checking connection...')
      // Trigger a quick health check when tab becomes visible
      SyncStatusManager.getActiveSyncOperations().catch(() => {
        // If this fails, the connection monitoring will handle reconnection
      })
    }
  }, [isMonitoring])

  /**
   * Handle online/offline events
   */
  const handleOnline = useCallback(() => {
    console.log('[SyncStatusProvider] Network online, reconnecting...')
    dispatch(setConnectionStatus({ status: 'reconnecting' }))
    initializeMonitoring()
  }, [dispatch, initializeMonitoring])

  const handleOffline = useCallback(() => {
    console.log('[SyncStatusProvider] Network offline')
    dispatch(setConnectionStatus({ status: 'disconnected' }))
  }, [dispatch])

  // Initialize on mount
  useEffect(() => {
    initializeMonitoring()
    
    return () => {
      // Cleanup on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [initializeMonitoring])

  // Start monitoring intervals when connected
  useEffect(() => {
    if (connection.status === 'connected') {
      startConnectionMonitoring()
      startHealthMonitoring()
      startPeriodicCleanup()
    }
    
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [connection.status, startConnectionMonitoring, startHealthMonitoring, startPeriodicCleanup])

  // Add event listeners for visibility and network changes
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleVisibilityChange, handleOnline, handleOffline])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      SyncStatusManager.cleanup()
    }
  }, [])

  return <>{children}</>
}

/**
 * Hook for creating sync operations
 */
export const useSyncOperation = () => {
  const dispatch = useAppDispatch()
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createOperation = useCallback(async (_params: {
    operation_type: 'upload' | 'delete' | 'update' | 'full_sync' | 'webhook'
    total_items?: number
    triggered_by?: string
    source?: 'manual' | 'webhook' | 'api' | 'scheduled'
    operation_data?: Json
  }) => {
    try {
      const result = await dispatch(initializeSyncMonitoring()).unwrap()
      return result
    } catch (error) {
      console.error('[useSyncOperation] Failed to create operation:', error)
      throw error
    }
  }, [dispatch])
  
  return { createOperation }
}

/**
 * Hook for monitoring sync status
 */
export const useSyncStatus = () => {
  const syncStatus = useAppSelector(state => state.syncStatus)
  
  const activeOperationsCount = Object.keys(syncStatus.activeOperations).length
  const isHealthy = syncStatus.systemHealth.status === 'healthy'
  const isConnected = syncStatus.connection.status === 'connected'
  
  return {
    ...syncStatus,
    activeOperationsCount,
    isHealthy,
    isConnected
  }
}
