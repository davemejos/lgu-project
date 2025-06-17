/**
 * Sync Status Indicators - Phase 3 Implementation
 * 
 * Real-time sync status indicators with:
 * - Live connection status
 * - Active operation monitoring
 * - System health indicators
 * - Performance metrics
 * - Error notifications
 * 
 * @author LGU Project Team
 * @version 3.0.0
 */

'use client'

import { useState } from 'react'
import { useSyncStatus } from '@/components/providers/SyncStatusProvider'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,

  Eye,
  EyeOff
} from 'lucide-react'

interface SyncStatusIndicatorsProps {
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export default function SyncStatusIndicators({ 
  className = '', 
  showDetails = false,
  compact = false 
}: SyncStatusIndicatorsProps) {
  const {
    connection,
    systemHealth,
    activeOperationsCount,
    isHealthy,
    isConnected,
    lastUpdate,
    metrics
  } = useSyncStatus()
  
  const [expanded, setExpanded] = useState(showDetails)

  if (compact) {
    return <CompactSyncIndicator />
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-900">Sync Status</h3>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Status Overview */}
      <div className="p-4 space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">Connection</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {connection.status}
            </span>
            
            {isConnected && connection.latency > 0 && (
              <span className="text-xs text-gray-500">
                {connection.latency}ms
              </span>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : systemHealth.status === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">System Health</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              systemHealth.status === 'healthy' 
                ? 'bg-green-100 text-green-700'
                : systemHealth.status === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {systemHealth.status}
            </span>
            
            <span className="text-xs text-gray-500">
              {systemHealth.score}%
            </span>
          </div>
        </div>

        {/* Active Operations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Active Operations</span>
          </div>
          
          <span className={`text-xs px-2 py-1 rounded-full ${
            activeOperationsCount > 0 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {activeOperationsCount}
          </span>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Last Update</span>
            </div>
            
            <span className="text-xs text-gray-500">
              {new Date(lastUpdate.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Performance Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Success Rate</span>
                <div className="font-medium">{metrics.successRate.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-gray-500">Avg Duration</span>
                <div className="font-medium">{metrics.avgDuration}ms</div>
              </div>
              <div>
                <span className="text-gray-500">Total Operations</span>
                <div className="font-medium">{metrics.totalOperations}</div>
              </div>
              <div>
                <span className="text-gray-500">Peak Concurrency</span>
                <div className="font-medium">{metrics.peakConcurrency}</div>
              </div>
            </div>
          </div>

          {/* Error Rate */}
          {systemHealth.errorRate > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Error Rate</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      systemHealth.errorRate > 10 ? 'bg-red-500' :
                      systemHealth.errorRate > 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(systemHealth.errorRate, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {systemHealth.errorRate.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact sync status indicator for headers/toolbars
 */
export function CompactSyncIndicator({ className = '' }: { className?: string }) {
  const { isConnected, activeOperationsCount, systemHealth } = useSyncStatus()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection indicator */}
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        )}
        <span className="text-xs text-gray-600">
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Active operations */}
      {activeOperationsCount > 0 && (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-blue-500 animate-spin" />
          <span className="text-xs text-blue-600">{activeOperationsCount}</span>
        </div>
      )}

      {/* Health indicator */}
      <div className="flex items-center space-x-1">
        {systemHealth.status === 'healthy' ? (
          <CheckCircle className="h-3 w-3 text-green-500" />
        ) : systemHealth.status === 'warning' ? (
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-red-500" />
        )}
      </div>
    </div>
  )
}

/**
 * Floating sync status widget
 */
export function FloatingSyncStatus({ className = '' }: { className?: string }) {
  const { isConnected, activeOperationsCount, lastUpdate } = useSyncStatus()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center z-50"
      >
        <Activity className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 min-w-48 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Sync Status</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Connection</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        {activeOperationsCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span>Active</span>
            <span className="text-blue-600">{activeOperationsCount} operations</span>
          </div>
        )}
        
        {lastUpdate && (
          <div className="text-xs text-gray-500">
            Last: {new Date(lastUpdate.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
