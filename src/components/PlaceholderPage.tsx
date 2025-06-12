'use client'

import {
  Activity,
  Archive,
  Database,
  Download,
  Eye,
  Filter,
  Folder,
  Mail,
  MessageSquare,
  Printer,
  Search,
  Shield,
  Upload
} from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  iconName: string
  features: string[]
  comingSoon?: boolean
}

const getIcon = (iconName: string) => {
  const iconMap = {
    Activity,
    Archive,
    Database,
    Download,
    Eye,
    Filter,
    Folder,
    Mail,
    MessageSquare,
    Printer,
    Search,
    Shield,
    Upload
  }

  return iconMap[iconName as keyof typeof iconMap] || Activity
}

export default function PlaceholderPage({
  title,
  description,
  iconName,
  features,
  comingSoon = true
}: PlaceholderPageProps) {
  const Icon = getIcon(iconName)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-slate-100 text-lg">{description}</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      {comingSoon && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Coming Soon</h3>
              <p className="text-blue-700">This feature is currently under development and will be available soon.</p>
            </div>
          </div>
        </div>
      )}

      {/* Features Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Planned Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
