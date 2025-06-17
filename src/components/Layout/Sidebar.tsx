'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Fish, 
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
  Eye
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
    <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen relative border-r border-slate-700 shadow-2xl flex flex-col overflow-hidden`}>
      
      {/* Logo Section - Clickable Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0 w-full hover:bg-slate-800/50 transition-colors duration-200"
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white">MAO Ipil</h1>
              <p className="text-xs text-slate-300">Fisheries Division</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Fish className="h-5 w-5 text-white" />
            </div>
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
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
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Personnel</span>
                  <span className="text-white font-medium">247</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Active Users</span>
                  <span className="text-green-400 font-medium">189</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Departments</span>
                  <span className="text-blue-400 font-medium">8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-700 flex-shrink-0">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">System Online</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">v2.1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
