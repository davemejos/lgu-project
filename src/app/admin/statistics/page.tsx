'use client'

import { useState } from 'react'
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Fish,
  MapPin,
  DollarSign,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StatCard {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: string
  trend?: string
}

const yearlyStats: StatCard[] = [
  {
    title: 'Total Personnel',
    value: '247',
    subtitle: 'Active fisheries staff',
    icon: <Users className="h-6 w-6" />,
    color: 'blue',
    trend: '+12 from last year'
  },
  {
    title: 'Annual Catch',
    value: '34,567 kg',
    subtitle: 'Total fish caught',
    icon: <Fish className="h-6 w-6" />,
    color: 'green',
    trend: '+8.5% increase'
  },
  {
    title: 'Revenue Generated',
    value: '₱5.2M',
    subtitle: 'Total annual revenue',
    icon: <DollarSign className="h-6 w-6" />,
    color: 'yellow',
    trend: '+15.3% growth'
  },
  {
    title: 'Compliance Rate',
    value: '94.2%',
    subtitle: 'Regulatory compliance',
    icon: <Target className="h-6 w-6" />,
    color: 'purple',
    trend: '+2.1% improvement'
  }
]

const monthlyData = [
  { month: 'Jan', catch: 2847, revenue: 425000, personnel: 245 },
  { month: 'Feb', catch: 3156, revenue: 472000, personnel: 247 },
  { month: 'Mar', catch: 2934, revenue: 438000, personnel: 249 },
  { month: 'Apr', catch: 3287, revenue: 491000, personnel: 251 },
  { month: 'May', catch: 3456, revenue: 516000, personnel: 253 },
  { month: 'Jun', catch: 3189, revenue: 476000, personnel: 255 }
]

const departmentStats = [
  { name: 'Marine Operations', personnel: 89, percentage: 36.1, color: 'bg-blue-500' },
  { name: 'Quality Control', personnel: 45, percentage: 18.2, color: 'bg-green-500' },
  { name: 'Administration', personnel: 32, percentage: 13.0, color: 'bg-yellow-500' },
  { name: 'Maintenance', personnel: 28, percentage: 11.3, color: 'bg-purple-500' },
  { name: 'Safety & Compliance', personnel: 25, percentage: 10.1, color: 'bg-red-500' },
  { name: 'Documentation', personnel: 18, percentage: 7.3, color: 'bg-indigo-500' },
  { name: 'Training', personnel: 10, percentage: 4.0, color: 'bg-pink-500' }
]

const performanceMetrics = [
  { metric: 'Average Daily Catch', value: '156 kg', target: '150 kg', status: 'above' },
  { metric: 'Equipment Utilization', value: '87%', target: '85%', status: 'above' },
  { metric: 'Safety Incidents', value: '2', target: '< 5', status: 'good' },
  { metric: 'Training Completion', value: '92%', target: '90%', status: 'above' },
  { metric: 'Document Compliance', value: '94%', target: '95%', status: 'below' },
  { metric: 'Response Time', value: '2.3 hrs', target: '< 3 hrs', status: 'good' }
]

export default function StatisticsPage() {
  const [selectedView, setSelectedView] = useState('overview')

  const getStatCardClasses = (color: string) => {
    const baseClasses = "bg-white rounded-2xl shadow-lg p-6 border"
    switch (color) {
      case 'blue':
        return `${baseClasses} border-blue-100`
      case 'green':
        return `${baseClasses} border-green-100`
      case 'yellow':
        return `${baseClasses} border-yellow-100`
      case 'purple':
        return `${baseClasses} border-purple-100`
      default:
        return `${baseClasses} border-gray-100`
    }
  }

  const getIconClasses = (color: string) => {
    const baseClasses = "p-3 rounded-xl"
    switch (color) {
      case 'blue':
        return `${baseClasses} bg-blue-100 text-blue-600`
      case 'green':
        return `${baseClasses} bg-green-100 text-green-600`
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-600`
      case 'purple':
        return `${baseClasses} bg-purple-100 text-purple-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'above':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'below':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Statistical Overview</h1>
            <p className="text-indigo-100 text-lg">Comprehensive data analysis and insights</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <PieChart className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Data Views</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('trends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'trends'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setSelectedView('performance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'performance'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Performance
            </button>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {yearlyStats.map((stat, index) => (
          <div key={index} className={getStatCardClasses(stat.color)}>
            <div className="flex items-center justify-between mb-4">
              <div className={getIconClasses(stat.color)}>
                {stat.icon}
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              {stat.trend && (
                <p className="text-xs text-green-600 font-medium mt-2">{stat.trend}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends (2024)</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Catch (kg)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue (₱)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Personnel</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{data.month}</td>
                  <td className="py-3 px-4 text-gray-700">{data.catch.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700">₱{data.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700">{data.personnel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Personnel by Department</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${dept.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{dept.personnel}</div>
                  <div className="text-xs text-gray-500">{dept.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{metric.metric}</div>
                    <div className="text-xs text-gray-500">Target: {metric.target}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">25</div>
            <div className="text-sm text-blue-600 font-medium">Fishing Areas</div>
            <div className="text-xs text-gray-500 mt-1">Active locations</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">156</div>
            <div className="text-sm text-green-600 font-medium">Registered Boats</div>
            <div className="text-xs text-gray-500 mt-1">Fleet size</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="text-3xl font-bold text-yellow-600 mb-2">8</div>
            <div className="text-sm text-yellow-600 font-medium">Processing Centers</div>
            <div className="text-xs text-gray-500 mt-1">Operational facilities</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-sm text-purple-600 font-medium">Storage Facilities</div>
            <div className="text-xs text-gray-500 mt-1">Cold storage units</div>
          </div>
        </div>
      </div>

      {/* Time-based Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Time-based Analysis</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="text-lg font-semibold text-gray-900 mb-2">Peak Hours</div>
            <div className="text-sm text-gray-600 mb-3">Most active fishing times</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">5:00 AM - 8:00 AM</span>
                <span className="text-sm font-medium text-gray-900">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">6:00 PM - 9:00 PM</span>
                <span className="text-sm font-medium text-gray-900">Medium</span>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="text-lg font-semibold text-gray-900 mb-2">Seasonal Trends</div>
            <div className="text-sm text-gray-600 mb-3">Best fishing seasons</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Summer (Mar-May)</span>
                <span className="text-sm font-medium text-green-600">Peak</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Winter (Dec-Feb)</span>
                <span className="text-sm font-medium text-yellow-600">Moderate</span>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="text-lg font-semibold text-gray-900 mb-2">Response Times</div>
            <div className="text-sm text-gray-600 mb-3">Average processing times</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">License Processing</span>
                <span className="text-sm font-medium text-gray-900">3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Document Review</span>
                <span className="text-sm font-medium text-gray-900">1.8 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
