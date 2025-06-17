/**
 * Sync Status Manager - Phase 3 Implementation
 * 
 * Enterprise-grade sync status management with:
 * - Real-time operation tracking
 * - Connection status monitoring
 * - Performance metrics
 * - Status persistence and recovery
 * - WebSocket broadcasting
 * 
 * @author LGU Project Team
 * @version 3.0.0
 */

import { createClient } from '@/utils/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Json } from '@/lib/database.types'

// Types
export interface SyncOperation {
  id: string
  operation_type: 'upload' | 'delete' | 'update' | 'full_sync' | 'webhook'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total_items: number
  processed_items: number
  failed_items: number
  start_time: string
  end_time: string | null
  estimated_completion: string | null
  triggered_by: string | null
  source: 'manual' | 'webhook' | 'api' | 'scheduled'
  operation_data: Json
  error_details: Json
  performance_metrics: Json
  created_at: string
  updated_at: string
}

export interface ConnectionStatus {
  id: string
  client_id: string
  connection_type: 'websocket' | 'sse' | 'polling'
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error'
  last_ping: string
  connection_start: string
  disconnect_reason?: string
  user_agent?: string
  ip_address?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SyncStatusSnapshot {
  id: string
  snapshot_type: 'hourly' | 'daily' | 'manual' | 'error'
  total_assets: number
  synced_assets: number
  pending_assets: number
  error_assets: number
  active_operations: number
  last_sync_time: string | null
  system_health: 'healthy' | 'warning' | 'critical'
  performance_score: number
  error_rate: number
  avg_sync_time_ms: number
  metadata: Json
  created_at: string
}

export interface SyncStatusUpdate {
  operation_id: string
  operation_type: string
  status: string
  progress: number
  message?: string
  timestamp: string
  performance_data?: Record<string, unknown>
}

export class SyncStatusManager {
  private static supabase = createClient()
  private static broadcastChannel: RealtimeChannel | null = null
  private static statusSubscribers: Set<(update: SyncStatusUpdate) => void> = new Set()

  /**
   * Initialize real-time broadcasting
   */
  static async initializeBroadcasting(): Promise<void> {
    if (this.broadcastChannel) {
      return // Already initialized
    }

    console.log('[SyncStatusManager] Initializing real-time broadcasting...')

    this.broadcastChannel = this.supabase
      .channel('sync_status_broadcast')
      .on('broadcast', { event: 'sync_update' }, (payload) => {
        console.log('[SyncStatusManager] Received broadcast:', payload)
        this.notifySubscribers(payload.payload as SyncStatusUpdate)
      })
      .subscribe((status) => {
        console.log('[SyncStatusManager] Broadcast channel status:', status)
      })
  }

  /**
   * Subscribe to sync status updates
   */
  static subscribe(callback: (update: SyncStatusUpdate) => void): () => void {
    this.statusSubscribers.add(callback)
    
    // Initialize broadcasting if not already done
    this.initializeBroadcasting()
    
    return () => {
      this.statusSubscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers of status update
   */
  private static notifySubscribers(update: SyncStatusUpdate): void {
    this.statusSubscribers.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('[SyncStatusManager] Subscriber callback error:', error)
      }
    })
  }

  /**
   * Create new sync operation
   */
  static async createSyncOperation(params: {
    operation_type: SyncOperation['operation_type']
    total_items?: number
    triggered_by?: string
    source?: SyncOperation['source']
    operation_data?: Json
  }): Promise<string> {
    try {
      // Check if Phase 3 is available first
      const isAvailable = await this.isPhase3Available()
      if (!isAvailable) {
        console.warn('[SyncStatusManager] Phase 3 sync_operations table not available. Generating mock operation ID.')
        // Return a mock operation ID for graceful degradation
        const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Still broadcast the update for UI consistency
        await this.broadcastSyncUpdate({
          operation_id: mockId,
          operation_type: params.operation_type,
          status: 'pending',
          progress: 0,
          message: 'Operation created (Phase 3 not available)',
          timestamp: new Date().toISOString()
        })

        return mockId
      }

      const { data, error } = await this.supabase
        .from('sync_operations')
        .insert({
          operation_type: params.operation_type,
          total_items: params.total_items || 0,
          triggered_by: params.triggered_by,
          source: params.source || 'manual',
          operation_data: params.operation_data || {}
        })
        .select('id')
        .single()

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('[SyncStatusManager] sync_operations table does not exist. Please run Phase 3 migration.')
          // Return a mock operation ID for graceful degradation
          const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          return mockId
        }
        throw new Error(`Failed to create sync operation: ${error.message}`)
      }

      const operationId = data.id
      console.log('[SyncStatusManager] Created sync operation:', operationId)

      // Broadcast creation
      await this.broadcastSyncUpdate({
        operation_id: operationId,
        operation_type: params.operation_type,
        status: 'pending',
        progress: 0,
        message: 'Sync operation created',
        timestamp: new Date().toISOString()
      })

      return operationId
    } catch (error) {
      console.error('[SyncStatusManager] Failed to create sync operation:', error)
      // For graceful degradation, return a mock ID instead of throwing
      const mockId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.warn(`[SyncStatusManager] Returning mock operation ID: ${mockId}`)
      return mockId
    }
  }

  /**
   * Update sync operation progress
   */
  static async updateSyncProgress(
    operationId: string,
    progress: number,
    processedItems?: number,
    failedItems?: number,
    message?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('update_sync_operation_progress', {
          operation_id: operationId,
          new_progress: progress,
          processed_count: processedItems,
          failed_count: failedItems
        })

      if (error) {
        throw new Error(`Failed to update sync progress: ${error.message}`)
      }

      // Get updated operation for broadcasting
      const { data: operation } = await this.supabase
        .from('sync_operations')
        .select('operation_type, status')
        .eq('id', operationId)
        .single()

      // Broadcast progress update
      await this.broadcastSyncUpdate({
        operation_id: operationId,
        operation_type: operation?.operation_type || 'unknown',
        status: 'in_progress',
        progress,
        message: message || `Progress: ${progress}%`,
        timestamp: new Date().toISOString(),
        performance_data: {
          processed_items: processedItems,
          failed_items: failedItems
        }
      })

      console.log(`[SyncStatusManager] Updated progress for ${operationId}: ${progress}%`)
    } catch (error) {
      console.error('[SyncStatusManager] Failed to update sync progress:', error)
      throw error
    }
  }

  /**
   * Complete sync operation
   */
  static async completeSyncOperation(
    operationId: string,
    status: 'completed' | 'failed' | 'cancelled',
    errorDetails?: Json,
    message?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('complete_sync_operation', {
          operation_id: operationId,
          final_status: status,
          error_details: errorDetails
        })

      if (error) {
        throw new Error(`Failed to complete sync operation: ${error.message}`)
      }

      // Get operation details for broadcasting
      const { data: operation } = await this.supabase
        .from('sync_operations')
        .select('operation_type, progress')
        .eq('id', operationId)
        .single()

      // Broadcast completion
      await this.broadcastSyncUpdate({
        operation_id: operationId,
        operation_type: operation?.operation_type || 'unknown',
        status,
        progress: operation?.progress || 100,
        message: message || `Operation ${status}`,
        timestamp: new Date().toISOString(),
        performance_data: errorDetails ? (errorDetails as Record<string, unknown>) : undefined
      })

      console.log(`[SyncStatusManager] Completed sync operation ${operationId}: ${status}`)
    } catch (error) {
      console.error('[SyncStatusManager] Failed to complete sync operation:', error)
      throw error
    }
  }

  /**
   * Broadcast sync status update
   */
  static async broadcastSyncUpdate(update: SyncStatusUpdate): Promise<void> {
    try {
      if (!this.broadcastChannel) {
        await this.initializeBroadcasting()
      }

      await this.broadcastChannel?.send({
        type: 'broadcast',
        event: 'sync_update',
        payload: update
      })

      // Also notify local subscribers
      this.notifySubscribers(update)
    } catch (error) {
      console.error('[SyncStatusManager] Failed to broadcast sync update:', error)
    }
  }

  /**
   * Check if Phase 3 sync status management is available
   */
  static async isPhase3Available(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('sync_operations')
        .select('count')
        .limit(1)

      return !error
    } catch (error) {
      console.warn('[SyncStatusManager] Phase 3 sync status management not available:', error)
      return false
    }
  }

  /**
   * Get active sync operations
   */
  static async getActiveSyncOperations(): Promise<SyncOperation[]> {
    try {
      // Check if Phase 3 is available first
      const isAvailable = await this.isPhase3Available()
      if (!isAvailable) {
        console.warn('[SyncStatusManager] Phase 3 sync_operations table not available. Run migration: /api/migrate-phase3')
        return []
      }

      const { data, error } = await this.supabase
        .from('sync_operations')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('[SyncStatusManager] sync_operations table does not exist. Please run Phase 3 migration.')
          return []
        }
        throw new Error(`Failed to get active sync operations: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('[SyncStatusManager] Failed to get active sync operations:', error)
      return []
    }
  }

  /**
   * Get sync operation by ID
   */
  static async getSyncOperation(operationId: string): Promise<SyncOperation | null> {
    try {
      const { data, error } = await this.supabase
        .from('sync_operations')
        .select('*')
        .eq('id', operationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw new Error(`Failed to get sync operation: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('[SyncStatusManager] Failed to get sync operation:', error)
      return null
    }
  }

  /**
   * Create status snapshot
   */
  static async createStatusSnapshot(type: SyncStatusSnapshot['snapshot_type'] = 'manual'): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('create_sync_status_snapshot', {
          snapshot_type_param: type
        })

      if (error) {
        throw new Error(`Failed to create status snapshot: ${error.message}`)
      }

      console.log('[SyncStatusManager] Created status snapshot:', data)
      return data
    } catch (error) {
      console.error('[SyncStatusManager] Failed to create status snapshot:', error)
      throw error
    }
  }

  /**
   * Get recent status snapshots
   */
  static async getRecentSnapshots(limit: number = 10): Promise<SyncStatusSnapshot[]> {
    try {
      const { data, error } = await this.supabase
        .from('sync_status_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to get status snapshots: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('[SyncStatusManager] Failed to get status snapshots:', error)
      return []
    }
  }

  /**
   * Cleanup old operations and snapshots
   */
  static async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      // Clean up old completed operations
      const { error: opsError } = await this.supabase
        .from('sync_operations')
        .delete()
        .in('status', ['completed', 'failed', 'cancelled'])
        .lt('created_at', cutoffDate.toISOString())

      if (opsError) {
        console.warn('[SyncStatusManager] Failed to cleanup old operations:', opsError)
      }

      // Clean up old snapshots
      const { error: snapshotsError } = await this.supabase
        .from('sync_status_snapshots')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (snapshotsError) {
        console.warn('[SyncStatusManager] Failed to cleanup old snapshots:', snapshotsError)
      }

      console.log('[SyncStatusManager] Cleanup completed')
    } catch (error) {
      console.error('[SyncStatusManager] Cleanup failed:', error)
    }
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    if (this.broadcastChannel) {
      this.supabase.removeChannel(this.broadcastChannel)
      this.broadcastChannel = null
    }
    this.statusSubscribers.clear()
  }
}
