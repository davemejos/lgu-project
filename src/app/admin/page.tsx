'use client'

import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock, Fish, FileText, Building } from 'lucide-react'
import Link from 'next/link'

interface Personnel {
  id: number
  name: string
  email: string
  department: string
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
  documents?: unknown[]
}

interface DashboardStats {
  totalPersonnel: number
  activePersonnel: number
  inactivePersonnel: number
  onLeavePersonnel: number
  suspendedPersonnel: number
  totalDocuments: number
  departmentStats: { [key: string]: number }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPersonnel: 0,
    activePersonnel: 0,
    inactivePersonnel: 0,
    onLeavePersonnel: 0,
    suspendedPersonnel: 0,
    totalDocuments: 0,
    departmentStats: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/personnel?limit=1000') // Get all personnel for stats
      if (response.ok) {
        const data = await response.json()
        const personnel = data.personnel

        // Calculate department statistics
        const departmentStats: { [key: string]: number } = {}
        personnel.forEach((person: Personnel) => {
          departmentStats[person.department] = (departmentStats[person.department] || 0) + 1
        })

        const statsData = {
          totalPersonnel: personnel.length,
          activePersonnel: personnel.filter((person: Personnel) => person.status === 'Active').length,
          inactivePersonnel: personnel.filter((person: Personnel) => person.status === 'Inactive').length,
          onLeavePersonnel: personnel.filter((person: Personnel) => person.status === 'On Leave').length,
          suspendedPersonnel: personnel.filter((person: Personnel) => person.status === 'Suspended').length,
          totalDocuments: personnel.reduce((total: number, person: Personnel) => total + (person.documents?.length || 0), 0),
          departmentStats
        }

        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Personnel',
      value: stats.totalPersonnel,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Personnel',
      value: stats.activePersonnel,
      icon: UserCheck,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'On Leave',
      value: stats.onLeavePersonnel,
      icon: Clock,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="dashboard-banner bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Fisheries Registry</h1>
            <p className="text-blue-100 text-lg">Municipal Agriculture Office - Ipil | Personnel Management System</p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Fish className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`${stat.bgColor} overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300`}>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${stat.color} p-4 rounded-xl shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-600 truncate">
                          {stat.title}
                        </dt>
                        <dd className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Department Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Personnel by Department
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.departmentStats).map(([department, count]) => (
                <div key={department} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-gray-700">{department}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Status Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-700">Active Personnel</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.activePersonnel}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-700">On Leave</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.onLeavePersonnel}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <UserX className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium text-gray-700">Inactive/Suspended</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.inactivePersonnel + stats.suspendedPersonnel}</span>
              </div>
            </div>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Fish className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/personnel"
              className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Personnel
            </Link>
            <Link
              href="/admin/personnel?action=create"
              className="inline-flex items-center justify-center px-6 py-4 border border-blue-300 text-base font-medium rounded-xl shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Register New Personnel
            </Link>
            <Link
              href="/admin/documents"
              className="inline-flex items-center justify-center px-6 py-4 border border-purple-300 text-base font-medium rounded-xl shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
            >
              <FileText className="w-5 h-5 mr-2" />
              Manage Documents
            </Link>
          </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to the Fisheries Registry System
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                This comprehensive personnel management system is designed specifically for the Municipal Agriculture Office - Ipil Fisheries Division.
                Manage fisheries personnel records, track departmental assignments, handle official documents, and maintain detailed family and work information
                for all fisheries staff members.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Personnel Management
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Document Storage
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Department Tracking
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Family Records
                </span>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
