'use client';

import React from 'react';

export default function TestChatbotPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            AI Chatbot Test Page
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                🤖 Chatbot Features
              </h2>
              <ul className="space-y-2 text-blue-700">
                <li>✅ No session restrictions - unlimited chat</li>
                <li>✅ Left-side positioning for chat bubble and interface</li>
                <li>✅ Full Gemini AI knowledge (no custom knowledge base)</li>
                <li>✅ Mobile and tablet responsive design</li>
                <li>✅ Professional, modern UI design</li>
                <li>✅ Secure server-side API implementation</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-3">
                📱 How to Test
              </h2>
              <ol className="space-y-2 text-green-700 list-decimal list-inside">
                <li>Look for the blue chat bubble in the bottom-left corner</li>
                <li>Click the bubble to open the chat interface</li>
                <li>Type a message and press Enter to send</li>
                <li>Try asking questions like:
                  <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                    <li>&quot;Hello, how are you?&quot;</li>
                    <li>&quot;What can you help me with?&quot;</li>
                    <li>&quot;Explain quantum physics in simple terms&quot;</li>
                    <li>&quot;Give me tips for better productivity&quot;</li>
                  </ul>
                </li>
                <li>Test mobile responsiveness by resizing your browser</li>
                <li>Try minimizing and closing the chat interface</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                🎯 AI Behavior Guidelines
              </h2>
              <p className="text-yellow-700 mb-3">
                The AI assistant follows professional guidelines:
              </p>
              <ul className="space-y-1 text-yellow-700 list-disc list-inside">
                <li>Professional yet approachable responses</li>
                <li>Concise but comprehensive answers (2-4 sentences typically)</li>
                <li>Helpful and solution-oriented approach</li>
                <li>Patient and understanding tone</li>
                <li>Respectful and courteous interactions</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-3">
                🔧 Technical Implementation
              </h2>
              <div className="text-purple-700 space-y-2">
                <p><strong>API:</strong> Google AI Studio (Gemini API)</p>
                <p><strong>Security:</strong> Server-side API calls with environment variables</p>
                <p><strong>Framework:</strong> Next.js 15 with TypeScript</p>
                <p><strong>Styling:</strong> Tailwind CSS with responsive design</p>
                <p><strong>State Management:</strong> React hooks for local state</p>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                📋 Test Checklist
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Functionality</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>□ Chat bubble visible</li>
                    <li>□ Interface opens/closes</li>
                    <li>□ Messages send/receive</li>
                    <li>□ Conversation history</li>
                    <li>□ Error handling</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Responsiveness</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>□ Mobile layout</li>
                    <li>□ Tablet view</li>
                    <li>□ Desktop positioning</li>
                    <li>□ Touch interactions</li>
                    <li>□ Keyboard navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              The chatbot is now active on all pages. Look for the blue chat bubble! 💬
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
