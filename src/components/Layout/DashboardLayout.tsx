'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/SupabaseAuthProvider'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${isMobile && !sidebarCollapsed ? 'fixed inset-0 z-40' : ''}`}>
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        <div className={`${isMobile ? 'fixed left-0 top-0 z-40 h-full' : 'relative h-full'}`}>
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 Local Government Unit - Ipil</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Fisheries Division</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span>System Status: </span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
