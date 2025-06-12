'use client';

import React, { useState, useEffect } from 'react';
import { checkTailwindHealth, getTailwindDiagnostics } from '@/utils/tailwind-health-check';
import { useDevIndicators } from '@/components/DevIndicators';
import {
  Monitor,
  Cpu,
  Palette,
  Code,
  Terminal,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface TailwindHealth {
  isLoaded: boolean;
  isWorking: boolean;
  missingClasses: string[];
  issues: string[];
  recommendations: string[];
}

interface SystemInfo {
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
  viewport: {
    width: number;
    height: number;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  memory?: {
    used: number;
    total: number;
    limit: number;
  } | null;
}

interface Diagnostics {
  userAgent: string;
  stylesheetCount: number;
  bodyClasses: string[];
  htmlClasses: string[];
  viewport: {
    width: number;
    height: number;
  } | null;
  timestamp: string;
}

export default function DevDashboard() {
  const { isDev, logInfo } = useDevIndicators();
  const [tailwindHealth, setTailwindHealth] = useState<TailwindHealth | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    if (isDev) {
      logInfo('Development Dashboard loaded');
      runDiagnostics();
    }
  }, [isDev, logInfo]);

  const runDiagnostics = () => {
    // Check Tailwind health
    const health = checkTailwindHealth();
    setTailwindHealth(health);

    // Get diagnostics
    const diag = getTailwindDiagnostics();
    setDiagnostics(diag);

    // Get system info
    const sysInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
      },
      memory: (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory ? {
        used: Math.round((performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.jsHeapSizeLimit / 1024 / 1024),
      } : null,
    };
    setSystemInfo(sysInfo);
  };

  if (!isDev) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Development Dashboard</h1>
          <p className="text-gray-600">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Info className="w-5 h-5 text-gray-500" />;
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'bg-gray-50 border-gray-200';
    return status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Monitor className="w-8 h-8 text-blue-600" />
                Development Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive development tools and diagnostics for your Next.js application
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Diagnostics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tailwind CSS Health */}
          <div className={`rounded-lg border p-6 ${getStatusColor(tailwindHealth?.isWorking ?? null)}`}>
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Tailwind CSS Health</h2>
              {getStatusIcon(tailwindHealth?.isWorking ?? null)}
            </div>
            
            {tailwindHealth ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Loaded:</span>
                    <span className={`ml-2 ${tailwindHealth.isLoaded ? 'text-green-600' : 'text-red-600'}`}>
                      {tailwindHealth.isLoaded ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Working:</span>
                    <span className={`ml-2 ${tailwindHealth.isWorking ? 'text-green-600' : 'text-red-600'}`}>
                      {tailwindHealth.isWorking ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                {tailwindHealth.missingClasses.length > 0 && (
                  <div>
                    <span className="font-medium text-red-600">Missing Classes:</span>
                    <div className="mt-1 text-sm text-red-600">
                      {tailwindHealth.missingClasses.join(', ')}
                    </div>
                  </div>
                )}
                
                {tailwindHealth.issues.length > 0 && (
                  <div>
                    <span className="font-medium text-red-600">Issues:</span>
                    <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                      {tailwindHealth.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {tailwindHealth.recommendations.length > 0 && (
                  <div>
                    <span className="font-medium text-yellow-600">Recommendations:</span>
                    <ul className="mt-1 text-sm text-yellow-600 list-disc list-inside">
                      {tailwindHealth.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click &quot;Refresh Diagnostics&quot; to check Tailwind health</p>
            )}
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">System Information</h2>
            </div>
            
            {systemInfo ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Platform:</span>
                  <span className="ml-2 text-gray-600">{systemInfo.platform}</span>
                </div>
                <div>
                  <span className="font-medium">Language:</span>
                  <span className="ml-2 text-gray-600">{systemInfo.language}</span>
                </div>
                <div>
                  <span className="font-medium">Online:</span>
                  <span className={`ml-2 ${systemInfo.onLine ? 'text-green-600' : 'text-red-600'}`}>
                    {systemInfo.onLine ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Viewport:</span>
                  <span className="ml-2 text-gray-600">
                    {systemInfo.viewport.width} × {systemInfo.viewport.height}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Screen:</span>
                  <span className="ml-2 text-gray-600">
                    {systemInfo.screen.width} × {systemInfo.screen.height} ({systemInfo.screen.colorDepth}-bit)
                  </span>
                </div>
                {systemInfo.memory && (
                  <div>
                    <span className="font-medium">Memory:</span>
                    <span className="ml-2 text-gray-600">
                      {systemInfo.memory.used}MB / {systemInfo.memory.total}MB (Limit: {systemInfo.memory.limit}MB)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Loading system information...</p>
            )}
          </div>

          {/* Environment Variables */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Environment</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">NODE_ENV:</span>
                <span className="ml-2 text-gray-600">{process.env.NODE_ENV}</span>
              </div>
              <div>
                <span className="font-medium">Next.js Version:</span>
                <span className="ml-2 text-gray-600">15.3.3</span>
              </div>
              <div>
                <span className="font-medium">Supabase URL:</span>
                <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
                </span>
              </div>
              <div>
                <span className="font-medium">Supabase Anon Key:</span>
                <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => {
                  console.clear();
                  console.log('🧹 Console cleared from Dev Dashboard');
                }}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🧹 Clear Console
              </button>
              <button
                onClick={() => window.open('/test-tailwind-fix', '_blank')}
                className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                🎨 Test Tailwind Fixes
              </button>
              <button
                onClick={() => window.open('/verify-chatbot', '_blank')}
                className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                🤖 Verify Chatbot
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostics Details */}
        {diagnostics && (
          <div className="mt-6 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Diagnostics</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
