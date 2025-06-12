'use client';

import React, { useState, useEffect } from 'react';
import { quickHealthCheck } from '@/utils/tailwind-health-check';

interface DevIndicatorsProps {
  showInProduction?: boolean;
}

export default function DevIndicators({ showInProduction = false }: DevIndicatorsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [buildInfo, setBuildInfo] = useState({
    nodeEnv: '',
    nextVersion: '',
    timestamp: '',
  });

  useEffect(() => {
    // Only show in development or if explicitly enabled for production
    const isDev = process.env.NODE_ENV === 'development';
    setIsVisible(isDev || showInProduction);

    if (isDev || showInProduction) {
      // Get build information
      setBuildInfo({
        nodeEnv: process.env.NODE_ENV || 'unknown',
        nextVersion: '15.3.3', // From package.json
        timestamp: new Date().toLocaleString(),
      });

      // Check Tailwind health
      const healthy = quickHealthCheck();
      setHealthStatus(healthy);

      // Set up periodic health checks
      const interval = setInterval(() => {
        const currentHealth = quickHealthCheck();
        setHealthStatus(currentHealth);
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [showInProduction]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Development Mode Indicator */}
      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
        🚀 DEV MODE
      </div>

      {/* Tailwind Health Indicator */}
      <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
        healthStatus === null 
          ? 'bg-gray-500 text-white' 
          : healthStatus 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
      }`}>
        {healthStatus === null 
          ? '⏳ Checking CSS...' 
          : healthStatus 
            ? '✅ CSS Healthy' 
            : '❌ CSS Issues'
        }
      </div>

      {/* Build Info Tooltip */}
      <div className="group relative">
        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg cursor-help">
          ℹ️ Build Info
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
          <div className="space-y-1">
            <div><strong>Environment:</strong> {buildInfo.nodeEnv}</div>
            <div><strong>Next.js:</strong> {buildInfo.nextVersion}</div>
            <div><strong>Last Check:</strong> {buildInfo.timestamp}</div>
            <div><strong>Tailwind:</strong> {healthStatus ? 'Working' : 'Issues Detected'}</div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-gray-300 mb-1">Quick Actions:</div>
            <div className="space-y-1">
              <button
                onClick={() => window.location.reload()}
                className="block w-full text-left hover:text-blue-300 transition-colors"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => {
                  console.clear();
                  console.log('🧹 Console cleared');
                }}
                className="block w-full text-left hover:text-blue-300 transition-colors"
              >
                🧹 Clear Console
              </button>
              <button
                onClick={() => {
                  const health = quickHealthCheck();
                  console.log('🔍 Tailwind Health Check:', health ? 'Healthy' : 'Issues detected');
                }}
                className="block w-full text-left hover:text-blue-300 transition-colors"
              >
                🔍 Check CSS Health
              </button>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-0 right-4 transform -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>

      {/* Error Indicator (if any) */}
      {typeof window !== 'undefined' && window.console && (
        <ErrorIndicator />
      )}
    </div>
  );
}

// Component to show if there are console errors
function ErrorIndicator() {
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Override console.error to count errors
    const originalError = console.error;
    let count = 0;

    console.error = (...args) => {
      count++;
      setErrorCount(count);
      originalError.apply(console, args);
    };

    // Reset error count periodically
    const resetInterval = setInterval(() => {
      count = 0;
      setErrorCount(0);
    }, 60000); // Reset every minute

    return () => {
      console.error = originalError;
      clearInterval(resetInterval);
    };
  }, []);

  if (errorCount === 0) return null;

  return (
    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
      ⚠️ {errorCount} Error{errorCount > 1 ? 's' : ''}
    </div>
  );
}

// Hook to use development indicators in any component
export function useDevIndicators() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  const logInfo = (message: string, data?: unknown) => {
    if (isDev) {
      console.log(`🔧 [DEV] ${message}`, data || '');
    }
  };

  const logError = (message: string, error?: unknown) => {
    if (isDev) {
      console.error(`🚨 [DEV] ${message}`, error || '');
    }
  };

  const logWarning = (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(`⚠️ [DEV] ${message}`, data || '');
    }
  };

  return {
    isDev,
    logInfo,
    logError,
    logWarning,
  };
}

// Component to show development shortcuts
export function DevShortcuts() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setIsVisible(isDev);

    if (isDev) {
      // Add keyboard shortcuts for development
      const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl/Cmd + Shift + D = Toggle dev tools
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          console.log('🛠️ Development shortcuts:');
          console.log('- Ctrl/Cmd + Shift + R: Reload and clear cache');
          console.log('- Ctrl/Cmd + Shift + C: Clear console');
          console.log('- Ctrl/Cmd + Shift + T: Check Tailwind health');
        }

        // Ctrl/Cmd + Shift + R = Hard reload
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
          e.preventDefault();
          window.location.reload();
        }

        // Ctrl/Cmd + Shift + C = Clear console
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          console.clear();
          console.log('🧹 Console cleared via keyboard shortcut');
        }

        // Ctrl/Cmd + Shift + T = Tailwind health check
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
          e.preventDefault();
          const health = quickHealthCheck();
          console.log('🔍 Tailwind Health Check:', health ? '✅ Healthy' : '❌ Issues detected');
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-50 hover:opacity-100 transition-opacity">
      <div className="font-medium mb-1">Dev Shortcuts:</div>
      <div>Ctrl+Shift+D: Show all shortcuts</div>
      <div>Ctrl+Shift+R: Hard reload</div>
      <div>Ctrl+Shift+C: Clear console</div>
      <div>Ctrl+Shift+T: Check CSS health</div>
    </div>
  );
}
