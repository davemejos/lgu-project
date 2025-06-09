'use client'

import { useState } from 'react'
import {
  Building,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'

interface Department {
  id: number
  name: string
  description: string
  head: string
  headEmail: string
  headPhone: string
  location: string
  personnelCount: number
  budget: string
  established: string
  status: 'Active' | 'Inactive' | 'Restructuring'
  performance: number
}

const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Marine Operations',
    description: 'Oversees all fishing operations, boat management, and marine safety protocols',
    head: 'Captain Juan Dela Cruz',
    headEmail: 'juan.delacruz@mao-ipil.gov.ph',
    headPhone: '+63 917 123 4567',
    location: 'Main Harbor Office, Building A',
    personnelCount: 89,
    budget: '₱2,450,000',
    established: '2018-03-15',
    status: 'Active',
    performance: 94.5
  },
  {
    id: 2,
    name: 'Quality Control',
    description: 'Ensures fish quality standards, safety inspections, and regulatory compliance',
    head: 'Dr. Maria Santos',
    headEmail: 'maria.santos@mao-ipil.gov.ph',
    headPhone: '+63 917 234 5678',
    location: 'Quality Lab, Building B',
    personnelCount: 45,
    budget: '₱1,200,000',
    established: '2019-01-20',
    status: 'Active',
    performance: 96.8
  },
  {
    id: 3,
    name: 'Administration',
    description: 'Handles administrative tasks, documentation, and personnel management',
    head: 'Ms. Ana Rodriguez',
    headEmail: 'ana.rodriguez@mao-ipil.gov.ph',
    headPhone: '+63 917 345 6789',
    location: 'Admin Building, 2nd Floor',
    personnelCount: 32,
    budget: '₱980,000',
    established: '2017-11-10',
    status: 'Active',
    performance: 92.3
  },
  {
    id: 4,
    name: 'Boat Maintenance',
    description: 'Responsible for vessel maintenance, repairs, and equipment management',
    head: 'Engr. Carlos Mendoza',
    headEmail: 'carlos.mendoza@mao-ipil.gov.ph',
    headPhone: '+63 917 456 7890',
    location: 'Maintenance Dock, Pier 3',
    personnelCount: 28,
    budget: '₱1,800,000',
    established: '2018-06-05',
    status: 'Active',
    performance: 88.7
  },
  {
    id: 5,
    name: 'Safety & Compliance',
    description: 'Monitors safety protocols, regulatory compliance, and emergency response',
    head: 'Ms. Elena Reyes',
    headEmail: 'elena.reyes@mao-ipil.gov.ph',
    headPhone: '+63 917 567 8901',
    location: 'Safety Office, Building C',
    personnelCount: 25,
    budget: '₱750,000',
    established: '2019-08-12',
    status: 'Active',
    performance: 95.2
  },
  {
    id: 6,
    name: 'Training & Development',
    description: 'Provides training programs, skill development, and certification courses',
    head: 'Prof. Roberto Silva',
    headEmail: 'roberto.silva@mao-ipil.gov.ph',
    headPhone: '+63 917 678 9012',
    location: 'Training Center, Building D',
    personnelCount: 18,
    budget: '₱650,000',
    established: '2020-02-28',
    status: 'Restructuring',
    performance: 89.4
  }
]

export default function DepartmentsPage() {
  const [departments] = useState<Department[]>(mockDepartments)

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'Inactive':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'Restructuring':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-600'
    if (performance >= 90) return 'text-blue-600'
    if (performance >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const totalPersonnel = departments.reduce((sum, dept) => sum + dept.personnelCount, 0)
  const activeDepartments = departments.filter(dept => dept.status === 'Active').length
  const averagePerformance = departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Department Management</h1>
            <p className="text-emerald-100 text-lg">Organize and oversee all fisheries departments</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Personnel</p>
              <p className="text-2xl font-bold text-gray-900">{totalPersonnel}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">{activeDepartments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{averagePerformance.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Department Overview</h2>
          <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((department) => (
          <div key={department.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Building className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                    <span className={getStatusBadge(department.status)}>
                      {department.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{department.description}</p>

              {/* Department Head */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{department.head}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span>{department.headEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span>{department.headPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3" />
                    <span>{department.location}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{department.personnelCount}</div>
                  <div className="text-xs text-blue-600">Personnel</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className={`text-lg font-bold ${getPerformanceColor(department.performance)}`}>
                    {department.performance}%
                  </div>
                  <div className="text-xs text-gray-600">Performance</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Est. {department.established}</span>
                </div>
                <div className="font-medium text-gray-700">{department.budget}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  <div className="text-xs text-gray-500">{dept.personnelCount} personnel</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getPerformanceColor(dept.performance)}`}>
                    {dept.performance}%
                  </div>
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${dept.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-600">Transfer Personnel</p>
          </button>
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-600">Set Performance Goals</p>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-600">Generate Report</p>
          </button>
        </div>
      </div>
    </div>
  )
}
