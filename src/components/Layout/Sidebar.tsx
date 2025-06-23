'use client'


import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Users,
  FileText,
  Settings,
  Home,
  BarChart3,
  Calendar,
  MapPin,
  Camera,
  Printer,
  UserCheck,
  Building,
  Shield,
  Database,
  Archive,
  Bell,
  Mail,
  MessageSquare,
  Activity,
  TrendingUp,
  PieChart,
  Download,
  Upload,
  Folder,
  Search,
  Filter,
  Eye,
  ChevronLeft
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Personnel', href: '/admin/personnel', icon: Users },
  { name: 'User Management', href: '/admin/users', icon: UserCheck },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Statistics', href: '/admin/statistics', icon: PieChart },
  { name: 'Departments', href: '/admin/departments', icon: Building },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Locations', href: '/admin/locations', icon: MapPin },
  { name: 'Media Center', href: '/admin/media', icon: Camera },
  { name: 'File Manager', href: '/admin/files', icon: Folder },
  { name: 'Archive', href: '/admin/archive', icon: Archive },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Print Center', href: '/admin/print', icon: Printer },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Messages', href: '/admin/messages', icon: Mail },
  { name: 'Communications', href: '/admin/communications', icon: MessageSquare },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity },
  { name: 'System Monitor', href: '/admin/monitor', icon: Eye },
  { name: 'Backup & Restore', href: '/admin/backup', icon: Download },
  { name: 'Import/Export', href: '/admin/import-export', icon: Upload },
  { name: 'Search Tools', href: '/admin/search', icon: Search },
  { name: 'Data Filters', href: '/admin/filters', icon: Filter },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Email Test', href: '/admin/email-test', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`text-gray-800 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    } h-screen relative shadow-xl flex flex-col overflow-hidden`} style={{
      backgroundColor: '#fff',
      borderRightColor: 'rgba(0,0,0,0.1)',
      borderRightWidth: '1px'
    }}>
      
      {/* Logo Section - Clickable Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between p-4 flex-shrink-0 w-full transition-colors duration-200 hover:bg-gray-50"
        style={{
          borderBottomColor: 'rgba(0,0,0,0.1)',
          borderBottomWidth: '1px'
        }}
      >
        {!isCollapsed && (
          <>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex items-center justify-center relative">
                <Image
                  src="/images/logo.png"
                  alt="MAO Ipil Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-gray-900">LGU Ipil</h1>
                <p className="text-xs text-gray-500">Local Gov</p>
              </div>
            </div>
            <ChevronLeft
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
        {isCollapsed && (
          <div className="mx-auto relative">
            <div className="h-8 w-8 flex items-center justify-center relative">
              <Image
                src="/images/logo.png"
                alt="MAO Ipil Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <ChevronLeft
              className="h-4 w-4 text-gray-500 absolute -right-1 top-1/2 transform -translate-y-1/2 rotate-180"
            />
          </div>
        )}
      </button>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-gray-900 shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto h-2 w-2 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
          </div>
        </nav>

        {/* Quick Stats - Only show when expanded */}
        {!isCollapsed && (
          <div className="mt-8 mx-3">
            <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Personnel</span>
                  <span className="text-gray-900 font-medium">247</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Active Users</span>
                  <span className="text-green-600 font-medium">189</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Departments</span>
                  <span className="text-blue-600 font-medium">8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 flex-shrink-0 border-t border-gray-200">
          <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">System Online</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">v2.1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
