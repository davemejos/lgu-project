/**
 * Webhook Configuration Page
 * 
 * Shows current webhook URLs and setup instructions for Cloudinary.
 */

'use client'

import { useState, useEffect } from 'react'
import { Copy, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react'

interface WebhookConfig {
  environment: string
  base_url: string
  webhook_urls: {
    cloudinary: string
    cloudinary_alt: string
  }
  instructions: {
    cloudinary_setup: string
    supported_events: string[]
    notes: string
  }
}

export default function WebhookConfigPage() {
  const [config, setConfig] = useState<WebhookConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/webhook-config')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.config)
      } else {
        console.error('Failed to load webhook config:', data.error)
      }
    } catch (error) {
      console.error('Error loading webhook config:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load webhook configuration</p>
          <button
            onClick={loadConfig}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Webhook Configuration</h1>
        <button
          onClick={loadConfig}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Environment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              config.environment === 'development' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {config.environment}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
              {config.base_url}
            </p>
          </div>
        </div>
      </div>

      {/* Webhook URLs */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Webhook URLs</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Cloudinary Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.webhook_urls.cloudinary}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(config.webhook_urls.cloudinary, 'primary')}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
              >
                {copied === 'primary' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'primary' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternative Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.webhook_urls.cloudinary_alt}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(config.webhook_urls.cloudinary_alt, 'alt')}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-1"
              >
                {copied === 'alt' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'alt' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Cloudinary Setup Instructions</h2>
        
        <ol className="list-decimal list-inside space-y-3 text-blue-800">
          <li>
            Go to your{' '}
            <a 
              href="https://console.cloudinary.com/settings/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 inline-flex items-center gap-1"
            >
              Cloudinary Console - Webhooks
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>Click "Add webhook endpoint"</li>
          <li>
            Set the Notification URL to:{' '}
            <code className="bg-white px-2 py-1 rounded text-sm font-mono">
              {config.webhook_urls.cloudinary}
            </code>
          </li>
          <li>
            Select these events: {config.instructions.supported_events.join(', ')}
          </li>
          <li>Save the webhook configuration</li>
        </ol>
      </div>

      {/* Notes */}
      <div className={`rounded-lg p-4 ${
        config.environment === 'development' 
          ? 'bg-yellow-50 border border-yellow-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          config.environment === 'development' ? 'text-yellow-800' : 'text-green-800'
        }`}>
          Important Notes
        </h3>
        <p className={`text-sm ${
          config.environment === 'development' ? 'text-yellow-700' : 'text-green-700'
        }`}>
          {config.instructions.notes}
        </p>
        
        {config.environment === 'development' && (
          <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <strong>Development Tip:</strong> When your ngrok URL changes, update the 
              <code className="mx-1 px-1 bg-yellow-200 rounded">NEXT_PUBLIC_WEBHOOK_BASE_URL</code> 
              in your <code className="mx-1 px-1 bg-yellow-200 rounded">.env.local</code> file and refresh this page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
