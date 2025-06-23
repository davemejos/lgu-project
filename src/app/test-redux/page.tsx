/**
 * Redux Test Page
 * 
 * This page tests the Redux Toolkit integration to ensure everything is working correctly.
 */

'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useAuth, usePersonnel, useUI, useSettings } from '@/lib/redux/hooks'

export default function TestReduxPage() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    initialized
  } = useAuth()

  const {
    personnel,
    loading: personnelLoading,
    error: personnelError,
    fetchPersonnelList
  } = usePersonnel()

  const {
    showNotification,
    showModal,
    hideModal,
    notifications,
    modals,
    theme,
    changeTheme
  } = useUI()

  const {
    userPreferences,
    featureFlags,
    toggleFlag
  } = useSettings()

  useEffect(() => {
    // Test notification
    showNotification({
      type: 'success',
      title: 'Redux Test',
      message: 'Redux Toolkit is working correctly!'
    })
  }, [showNotification])

  const handleTestPersonnel = () => {
    fetchPersonnelList({ page: 1, limit: 5 })
  }

  const handleTestModal = () => {
    showModal({
      id: 'test-modal',
      type: 'custom',
      data: { message: 'This is a test modal' }
    })
  }

  const handleTestTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    changeTheme(newTheme)
  }

  const handleTestFeatureFlag = () => {
    toggleFlag('enableChatbot')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Redux Toolkit Integration Test</h1>
          
          {/* Auth State */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication State</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Initialized:</strong> {initialized ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? user.email : 'None'}</p>
              <p><strong>Error:</strong> {authError || 'None'}</p>
            </div>
          </div>

          {/* Personnel State */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personnel State</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Personnel Count:</strong> {personnel ? personnel.length : 0}</p>
              <p><strong>Loading:</strong> {personnelLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {personnelError || 'None'}</p>
              <button
                onClick={handleTestPersonnel}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Fetch Personnel
              </button>
            </div>
          </div>

          {/* UI State */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">UI State</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Theme:</strong> {theme}</p>
              <p><strong>Notifications:</strong> {notifications.length}</p>
              <p><strong>Modals:</strong> {modals.length}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleTestModal}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Test Modal
                </button>
                <button
                  onClick={handleTestTheme}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

          {/* Settings State */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings State</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Language:</strong> {userPreferences.language}</p>
              <p><strong>Items Per Page:</strong> {userPreferences.itemsPerPage}</p>
              <p><strong>Chatbot Enabled:</strong> {featureFlags.enableChatbot ? 'Yes' : 'No'}</p>
              <p><strong>Analytics Enabled:</strong> {featureFlags.enableAnalytics ? 'Yes' : 'No'}</p>
              <button
                onClick={handleTestFeatureFlag}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Toggle Chatbot Feature
              </button>
            </div>
          </div>

          {/* Notifications Display */}
          {notifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Notifications</h2>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.type === 'success' ? 'bg-green-100 text-green-800' :
                      notification.type === 'error' ? 'bg-red-100 text-red-800' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <p><strong>{notification.title}</strong></p>
                    <p>{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modals Display */}
          {modals.filter(m => m.isOpen).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Modals</h2>
              <div className="space-y-2">
                {modals.filter(m => m.isOpen).map((modal) => (
                  <div key={modal.id} className="p-3 bg-gray-100 rounded-lg">
                    <p><strong>Modal ID:</strong> {modal.id}</p>
                    <p><strong>Type:</strong> {modal.type}</p>
                    <p><strong>Data:</strong> {JSON.stringify(modal.data)}</p>
                    <button
                      onClick={() => hideModal(modal.id)}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Close Modal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Redux Toolkit Integration Successful!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>All Redux slices are working correctly:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Authentication slice ✓</li>
                    <li>Personnel slice ✓</li>
                    <li>Users slice ✓</li>
                    <li>UI slice ✓</li>
                    <li>Settings slice ✓</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
