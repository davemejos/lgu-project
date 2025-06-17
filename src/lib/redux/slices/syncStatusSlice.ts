/**
 * Sync Status Redux Slice - Phase 3 Implementation
 * 
 * Real-time sync status management with:
 * - Live operation tracking
 * - Connection status monitoring
 * - Performance metrics
 * - Error handling
 * - Status persistence
 * 
 * @author LGU Project Team
 * @version 3.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SyncStatusManager, type SyncStatusUpdate } from '@/lib/syncStatusManager'
import type { SyncOperation, SyncStatusSnapshot, Json } from '@/lib/database.types'

// Simplified types for Redux state to avoid infinite type instantiation
type SimplifiedSyncOperation = Omit<SyncOperation, 'operation_data' | 'error_details' | 'performance_metrics'> & {
  operation_data?: Record<string, unknown>
  error_details?: Record<string, unknown>
  performance_metrics?: Record<string, unknown>
}

type SimplifiedSyncStatusSnapshot = Omit<SyncStatusSnapshot, 'metadata'> & {
  metadata?: Record<string, unknown>
}

// Types
export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error'
  lastPing: string
  connectionStart: string
  reconnectAttempts: number
  latency: number
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  score: number
  errorRate: number
  avgSyncTime: number
  lastCheck: string
}

export interface SyncStatusState {
  // Active operations
  activeOperations: Record<string, SimplifiedSyncOperation>
  recentOperations: SimplifiedSyncOperation[]

  // Connection status
  connection: ConnectionState

  // System health
  systemHealth: SystemHealth

  // Real-time updates
  lastUpdate: SyncStatusUpdate | null
  updateHistory: SyncStatusUpdate[]

  // Status snapshots
  currentSnapshot: SimplifiedSyncStatusSnapshot | null
  recentSnapshots: SimplifiedSyncStatusSnapshot[]
  
  // UI state
  isMonitoring: boolean
  showDetails: boolean
  selectedOperation: string | null
  
  // Error handling
  error: string | null
  lastError: string | null
  
  // Performance metrics
  metrics: {
    totalOperations: number
    successRate: number
    avgDuration: number
    peakConcurrency: number
  }
}

const initialState: SyncStatusState = {
  activeOperations: {},
  recentOperations: [],
  connection: {
    status: 'disconnected',
    lastPing: '',
    connectionStart: '',
    reconnectAttempts: 0,
    latency: 0
  },
  systemHealth: {
    status: 'healthy',
    score: 100,
    errorRate: 0,
    avgSyncTime: 0,
    lastCheck: ''
  },
  lastUpdate: null,
  updateHistory: [],
  currentSnapshot: null,
  recentSnapshots: [],
  isMonitoring: false,
  showDetails: false,
  selectedOperation: null,
  error: null,
  lastError: null,
  metrics: {
    totalOperations: 0,
    successRate: 100,
    avgDuration: 0,
    peakConcurrency: 0
  }
}

// Async thunks
export const initializeSyncMonitoring = createAsyncThunk(
  'syncStatus/initializeMonitoring',
  async () => {
    await SyncStatusManager.initializeBroadcasting()
    const activeOps = await SyncStatusManager.getActiveSyncOperations()
    const snapshots = await SyncStatusManager.getRecentSnapshots(5)
    
    return {
      activeOperations: activeOps,
      recentSnapshots: snapshots,
      currentSnapshot: snapshots[0] || null
    }
  }
)

export const createSyncOperation = createAsyncThunk(
  'syncStatus/createOperation',
  async (params: {
    operation_type: SyncOperation['operation_type']
    total_items?: number
    triggered_by?: string
    source?: SyncOperation['source']
    operation_data?: Json
  }) => {
    const operationId = await SyncStatusManager.createSyncOperation(params)
    const operation = await SyncStatusManager.getSyncOperation(operationId)
    return operation
  }
)

export const updateSyncProgress = createAsyncThunk(
  'syncStatus/updateProgress',
  async (params: {
    operationId: string
    progress: number
    processedItems?: number
    failedItems?: number
    message?: string
  }) => {
    await SyncStatusManager.updateSyncProgress(
      params.operationId,
      params.progress,
      params.processedItems,
      params.failedItems,
      params.message
    )
    
    const operation = await SyncStatusManager.getSyncOperation(params.operationId)
    return operation
  }
)

export const completeSyncOperation = createAsyncThunk(
  'syncStatus/completeOperation',
  async (params: {
    operationId: string
    status: 'completed' | 'failed' | 'cancelled'
    errorDetails?: Json
    message?: string
  }) => {
    await SyncStatusManager.completeSyncOperation(
      params.operationId,
      params.status,
      params.errorDetails,
      params.message
    )
    
    const operation = await SyncStatusManager.getSyncOperation(params.operationId)
    return operation
  }
)

export const createStatusSnapshot = createAsyncThunk(
  'syncStatus/createSnapshot',
  async (type: SyncStatusSnapshot['snapshot_type'] = 'manual') => {
    await SyncStatusManager.createStatusSnapshot(type)
    const snapshots = await SyncStatusManager.getRecentSnapshots(5)
    return snapshots
  }
)

const syncStatusSlice = createSlice({
  name: 'syncStatus',
  initialState,
  reducers: {
    // Real-time status updates
    handleSyncStatusUpdate: (state, action: PayloadAction<SyncStatusUpdate>) => {
      const update = action.payload
      state.lastUpdate = update
      
      // Add to history (keep last 50)
      state.updateHistory.unshift(update)
      if (state.updateHistory.length > 50) {
        state.updateHistory = state.updateHistory.slice(0, 50)
      }
      
      // Update active operation if exists
      if (state.activeOperations[update.operation_id]) {
        state.activeOperations[update.operation_id] = {
          ...state.activeOperations[update.operation_id],
          status: update.status as 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
          progress: update.progress,
          updated_at: update.timestamp
        }
        
        // Remove from active if completed
        if (['completed', 'failed', 'cancelled'].includes(update.status)) {
          const completedOp = state.activeOperations[update.operation_id]
          delete state.activeOperations[update.operation_id]
          
          // Add to recent operations
          state.recentOperations.unshift(completedOp)
          if (state.recentOperations.length > 20) {
            state.recentOperations = state.recentOperations.slice(0, 20)
          }
        }
      }
    },
    
    // Connection status management
    setConnectionStatus: (state, action: PayloadAction<Partial<ConnectionState>>) => {
      state.connection = { ...state.connection, ...action.payload }
    },
    
    updateConnectionLatency: (state, action: PayloadAction<number>) => {
      state.connection.latency = action.payload
      state.connection.lastPing = new Date().toISOString()
    },
    
    incrementReconnectAttempts: (state) => {
      state.connection.reconnectAttempts += 1
    },
    
    resetReconnectAttempts: (state) => {
      state.connection.reconnectAttempts = 0
    },
    
    // System health management
    updateSystemHealth: (state, action: PayloadAction<Partial<SystemHealth>>) => {
      state.systemHealth = { ...state.systemHealth, ...action.payload }
      state.systemHealth.lastCheck = new Date().toISOString()
    },
    
    // UI state management
    setMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload
    },
    
    setShowDetails: (state, action: PayloadAction<boolean>) => {
      state.showDetails = action.payload
    },
    
    setSelectedOperation: (state, action: PayloadAction<string | null>) => {
      state.selectedOperation = action.payload
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      if (action.payload) {
        state.lastError = action.payload
      }
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Metrics updates
    updateMetrics: (state, action: PayloadAction<Partial<SyncStatusState['metrics']>>) => {
      state.metrics = { ...state.metrics, ...action.payload }
    },
    
    // Clear old data
    clearOldData: (state) => {
      // Keep only last 10 updates in history
      state.updateHistory = state.updateHistory.slice(0, 10)
      
      // Keep only last 5 recent operations
      state.recentOperations = state.recentOperations.slice(0, 5)
      
      // Keep only last 3 snapshots
      state.recentSnapshots = state.recentSnapshots.slice(0, 3)
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize monitoring
      .addCase(initializeSyncMonitoring.pending, (state) => {
        state.error = null
      })
      .addCase(initializeSyncMonitoring.fulfilled, (state, action) => {
        const { activeOperations, recentSnapshots, currentSnapshot } = action.payload
        
        // Convert array to record for active operations
        state.activeOperations = {}
        activeOperations.forEach(op => {
          state.activeOperations[op.id] = {
            ...op,
            operation_data: op.operation_data as Record<string, unknown>,
            error_details: op.error_details as Record<string, unknown>,
            performance_metrics: op.performance_metrics as Record<string, unknown>
          }
        })
        
        // Convert to simplified types to avoid infinite type instantiation
        state.recentSnapshots = recentSnapshots.map(snapshot => ({
          ...snapshot,
          metadata: snapshot.metadata as Record<string, unknown>
        }))
        state.currentSnapshot = currentSnapshot ? {
          ...currentSnapshot,
          metadata: currentSnapshot.metadata as Record<string, unknown>
        } : null
        state.isMonitoring = true
        
        // Update connection status
        state.connection.status = 'connected'
        state.connection.connectionStart = new Date().toISOString()
      })
      .addCase(initializeSyncMonitoring.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to initialize sync monitoring'
        state.isMonitoring = false
      })
      
      // Create operation
      .addCase(createSyncOperation.fulfilled, (state, action) => {
        if (action.payload) {
          const operation = action.payload
          state.activeOperations[operation.id] = {
            ...operation,
            operation_data: operation.operation_data as Record<string, unknown>,
            error_details: operation.error_details as Record<string, unknown>,
            performance_metrics: operation.performance_metrics as Record<string, unknown>
          }
        }
      })
      .addCase(createSyncOperation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create sync operation'
      })

      // Update progress
      .addCase(updateSyncProgress.fulfilled, (state, action) => {
        if (action.payload) {
          const operation = action.payload
          state.activeOperations[operation.id] = {
            ...operation,
            operation_data: operation.operation_data as Record<string, unknown>,
            error_details: operation.error_details as Record<string, unknown>,
            performance_metrics: operation.performance_metrics as Record<string, unknown>
          }
        }
      })

      // Complete operation
      .addCase(completeSyncOperation.fulfilled, (state, action) => {
        if (action.payload) {
          const operation = action.payload
          // Remove from active and add to recent
          delete state.activeOperations[operation.id]
          state.recentOperations.unshift({
            ...operation,
            operation_data: operation.operation_data as Record<string, unknown>,
            error_details: operation.error_details as Record<string, unknown>,
            performance_metrics: operation.performance_metrics as Record<string, unknown>
          })

          // Keep only last 20 recent operations
          if (state.recentOperations.length > 20) {
            state.recentOperations = state.recentOperations.slice(0, 20)
          }
        }
      })

      // Create snapshot
      .addCase(createStatusSnapshot.fulfilled, (state, action) => {
        state.recentSnapshots = action.payload.map(snapshot => ({
          ...snapshot,
          metadata: snapshot.metadata as Record<string, unknown>
        }))
        state.currentSnapshot = action.payload[0] ? {
          ...action.payload[0],
          metadata: action.payload[0].metadata as Record<string, unknown>
        } : null
      })
  }
})

export const {
  handleSyncStatusUpdate,
  setConnectionStatus,
  updateConnectionLatency,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  updateSystemHealth,
  setMonitoring,
  setShowDetails,
  setSelectedOperation,
  setError,
  clearError,
  updateMetrics,
  clearOldData
} = syncStatusSlice.actions

export default syncStatusSlice.reducer
