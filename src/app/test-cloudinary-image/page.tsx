'use client'

import { CldImage } from 'next-cloudinary'
import { useState } from 'react'
import Image from 'next/image'

export default function TestCloudinaryImagePage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCloudinaryImage = () => {
    addResult('🧪 Testing Cloudinary CldImage component...')
  }

  const testDirectURL = () => {
    addResult('🧪 Testing direct Cloudinary URL...')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Cloudinary Image Test
          </h1>
          <p className="text-gray-600 mb-8">Test Cloudinary image loading</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CldImage Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">CldImage Component</h2>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <CldImage
                    src="samples/cloudinary-icon"
                    alt="Cloudinary Test"
                    width={256}
                    height={256}
                    crop="fill"
                    quality="auto"
                    format="auto"
                    className="w-full h-full object-cover"
                    onLoad={() => addResult('✅ CldImage loaded successfully')}
                    onError={(error) => addResult(`❌ CldImage failed: ${error}`)}
                  />
                </div>
                <button
                  onClick={testCloudinaryImage}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Test CldImage
                </button>
              </div>
            </div>

            {/* Direct URL Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Direct URL</h2>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/dvwaviwn0/image/upload/c_fill,w_256,h_256/samples/cloudinary-icon"
                    alt="Direct URL Test"
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                    onLoad={() => addResult('✅ Direct URL loaded successfully')}
                    onError={() => addResult('❌ Direct URL failed')}
                  />
                </div>
                <button
                  onClick={testDirectURL}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Test Direct URL
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
            <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setTestResults([])}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {/* Environment Check */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Environment Check:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}</p>
              <p><strong>Expected:</strong> dvwaviwn0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
