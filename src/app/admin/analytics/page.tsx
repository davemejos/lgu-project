'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Users,
  Fish,
  DollarSign,
  Calendar,
  MapPin,
  Target,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

const metrics: MetricCard[] = [
  {
    title: 'Total Catch Volume',
    value: '2,847 kg',
    change: '+12.5%',
    trend: 'up',
    icon: <Fish className="h-6 w-6" />,
    color: 'blue'
  },
  {
    title: 'Active Personnel',
    value: '189',
    change: '+3.2%',
    trend: 'up',
    icon: <Users className="h-6 w-6" />,
    color: 'green'
  },
  {
    title: 'Revenue Generated',
    value: '₱456,789',
    change: '+8.7%',
    trend: 'up',
    icon: <DollarSign className="h-6 w-6" />,
    color: 'yellow'
  },
  {
    title: 'Compliance Rate',
    value: '94.2%',
    change: '-1.3%',
    trend: 'down',
    icon: <Target className="h-6 w-6" />,
    color: 'red'
  }
]

const topPerformers = [
  { name: 'Juan Dela Cruz', department: 'Marine Operations', score: 98.5, trend: 'up' },
  { name: 'Maria Santos', department: 'Quality Control', score: 96.8, trend: 'up' },
  { name: 'Carlos Mendoza', department: 'Boat Maintenance', score: 95.2, trend: 'stable' },
  { name: 'Ana Rodriguez', department: 'Documentation', score: 94.7, trend: 'up' },
  { name: 'Elena Reyes', department: 'Safety Compliance', score: 93.9, trend: 'down' }
]

const catchData = [
  { species: 'Tilapia', volume: 1247, percentage: 43.8, color: 'bg-blue-500' },
  { species: 'Bangus', volume: 856, percentage: 30.1, color: 'bg-green-500' },
  { species: 'Galunggong', volume: 423, percentage: 14.9, color: 'bg-yellow-500' },
  { species: 'Lapu-lapu', volume: 321, percentage: 11.2, color: 'bg-purple-500' }
]

const recentActivities = [
  { action: 'New personnel registered', user: 'Admin', time: '2 minutes ago', type: 'success' },
  { action: 'Monthly report generated', user: 'Maria Santos', time: '15 minutes ago', type: 'info' },
  { action: 'Safety violation reported', user: 'Carlos Mendoza', time: '1 hour ago', type: 'warning' },
  { action: 'Equipment maintenance completed', user: 'Juan Dela Cruz', time: '2 hours ago', type: 'success' },
  { action: 'Document uploaded', user: 'Ana Rodriguez', time: '3 hours ago', type: 'info' }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const getMetricCardClasses = (color: string) => {
    const baseClasses = "bg-white rounded-2xl shadow-lg p-6 border"
    switch (color) {
      case 'blue':
        return `${baseClasses} border-blue-100`
      case 'green':
        return `${baseClasses} border-green-100`
      case 'yellow':
        return `${baseClasses} border-yellow-100`
      case 'red':
        return `${baseClasses} border-red-100`
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
      case 'red':
        return `${baseClasses} bg-red-100 text-red-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-purple-100 text-lg">Real-time insights and performance metrics</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className={getMetricCardClasses(metric.color)}>
            <div className="flex items-center justify-between">
              <div className={getIconClasses(metric.color)}>
                {metric.icon}
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catch Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Catch Distribution by Species</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {catchData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.species}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.volume} kg</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                    <div className="text-xs text-gray-500">{performer.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{performer.score}%</span>
                  {getTrendIcon(performer.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  by {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-blue-600 font-medium">Coastal Areas</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-green-600 font-medium">Inland Waters</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-purple-600 font-medium">Deep Sea</div>
          </div>
        </div>
      </div>
    </div>
  )
}
