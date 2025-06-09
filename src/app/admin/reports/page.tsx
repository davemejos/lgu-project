'use client'

import { useState } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Users,
  Fish,
  DollarSign,
  Clock,
  Eye,
  Printer
} from 'lucide-react'

interface Report {
  id: number
  title: string
  description: string
  type: 'Monthly' | 'Quarterly' | 'Annual' | 'Custom'
  category: 'Personnel' | 'Catch' | 'Financial' | 'Compliance' | 'Operations'
  generatedDate: string
  period: string
  status: 'Generated' | 'Pending' | 'Scheduled'
  size: string
}

const mockReports: Report[] = [
  {
    id: 1,
    title: 'Monthly Personnel Activity Report',
    description: 'Comprehensive overview of personnel activities, attendance, and performance metrics',
    type: 'Monthly',
    category: 'Personnel',
    generatedDate: '2024-01-15',
    period: 'December 2023',
    status: 'Generated',
    size: '2.4 MB'
  },
  {
    id: 2,
    title: 'Quarterly Catch Statistics',
    description: 'Detailed analysis of fish catch data, species distribution, and seasonal trends',
    type: 'Quarterly',
    category: 'Catch',
    generatedDate: '2024-01-10',
    period: 'Q4 2023',
    status: 'Generated',
    size: '5.1 MB'
  },
  {
    id: 3,
    title: 'Annual Financial Summary',
    description: 'Complete financial overview including revenue, expenses, and budget analysis',
    type: 'Annual',
    category: 'Financial',
    generatedDate: '2024-01-08',
    period: '2023',
    status: 'Generated',
    size: '3.8 MB'
  },
  {
    id: 4,
    title: 'Compliance Audit Report',
    description: 'Regulatory compliance status and recommendations for improvement',
    type: 'Quarterly',
    category: 'Compliance',
    generatedDate: '2024-01-05',
    period: 'Q4 2023',
    status: 'Generated',
    size: '1.9 MB'
  },
  {
    id: 5,
    title: 'Operations Efficiency Analysis',
    description: 'Analysis of operational processes, efficiency metrics, and optimization opportunities',
    type: 'Monthly',
    category: 'Operations',
    generatedDate: '2024-01-03',
    period: 'December 2023',
    status: 'Generated',
    size: '2.7 MB'
  }
]

const reportTypes = ['All', 'Monthly', 'Quarterly', 'Annual', 'Custom']
const categories = ['All', 'Personnel', 'Catch', 'Financial', 'Compliance', 'Operations']

export default function ReportsPage() {
  const [reports] = useState<Report[]>(mockReports)
  const [selectedType, setSelectedType] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Personnel':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'Catch':
        return <Fish className="h-5 w-5 text-green-500" />
      case 'Financial':
        return <DollarSign className="h-5 w-5 text-yellow-500" />
      case 'Compliance':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'Operations':
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      default:
        return <BarChart3 className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'Generated':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'Scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'All' || report.type === selectedType
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory
    return matchesType && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-green-100 text-lg">Generate and manage comprehensive fisheries reports</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-600">Personnel Report</p>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
            <Fish className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-600">Catch Statistics</p>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-600">Financial Summary</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {reportTypes.map(type => (
                  <option key={type} value={type}>{type} Reports</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Generate Custom Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Reports ({filteredReports.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getCategoryIcon(report.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {report.period}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Generated: {report.generatedDate}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {report.size}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={getStatusBadge(report.status)}>
                    {report.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
