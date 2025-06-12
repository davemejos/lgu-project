'use client';

import React, { useState } from 'react';

export default function TestAPIPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testAPI = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          conversationHistory: [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.message);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🧪 API Test Page
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                Test Google AI Studio API
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message:
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter a test message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && testAPI()}
                  />
                </div>
                <button
                  onClick={testAPI}
                  disabled={!message.trim() || isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Testing...' : 'Test API'}
                </button>
              </div>
            </div>

            {response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ API Response:
                </h3>
                <div className="text-green-700 whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ❌ Error:
                </h3>
                <div className="text-red-700">
                  {error}
                </div>
              </div>
            )}

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🔧 API Configuration
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Endpoint:</strong> /api/chat</p>
                <p><strong>Method:</strong> POST</p>
                <p><strong>API:</strong> Google AI Studio (Gemini)</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                💡 Test Suggestions
              </h3>
              <ul className="space-y-1 text-yellow-700 list-disc list-inside">
                <li>&quot;Hello, how are you?&quot;</li>
                <li>&quot;What is artificial intelligence?&quot;</li>
                <li>&quot;Explain quantum computing in simple terms&quot;</li>
                <li>&quot;Give me 3 productivity tips&quot;</li>
                <li>&quot;What&apos;s the weather like?&quot; (should work with general knowledge)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
