'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Navigation,
  Fish,
  Anchor,
  Waves,
  Mountain,
  Search,
  Filter,
  Map
} from 'lucide-react'

interface Location {
  id: number
  name: string
  type: 'Fishing Ground' | 'Harbor' | 'Processing Plant' | 'Storage Facility' | 'Office'
  coordinates: string
  description: string
  capacity: string
  status: 'Active' | 'Inactive' | 'Under Maintenance'
  manager: string
  contact: string
  facilities: string[]
  established: string
}

const mockLocations: Location[] = [
  {
    id: 1,
    name: 'Ipil Main Harbor',
    type: 'Harbor',
    coordinates: '7.8167° N, 122.5833° E',
    description: 'Primary harbor facility for fishing vessels and cargo operations',
    capacity: '150 vessels',
    status: 'Active',
    manager: 'Captain Juan Dela Cruz',
    contact: '+63 917 123 4567',
    facilities: ['Docking', 'Fuel Station', 'Ice Plant', 'Repair Shop'],
    established: '1995-06-15'
  },
  {
    id: 2,
    name: 'Zamboanga Peninsula Fishing Ground A',
    type: 'Fishing Ground',
    coordinates: '7.1000° N, 122.0000° E',
    description: 'Rich fishing area known for tuna and mackerel catches',
    capacity: '50 boats daily',
    status: 'Active',
    manager: 'Maria Santos',
    contact: '+63 917 234 5678',
    facilities: ['Navigation Buoys', 'Emergency Shelter', 'Communication Tower'],
    established: '2010-03-20'
  },
  {
    id: 3,
    name: 'Ipil Fish Processing Center',
    type: 'Processing Plant',
    coordinates: '7.8200° N, 122.5900° E',
    description: 'Modern fish processing and packaging facility',
    capacity: '5 tons/day',
    status: 'Active',
    manager: 'Carlos Mendoza',
    contact: '+63 917 345 6789',
    facilities: ['Processing Lines', 'Cold Storage', 'Quality Lab', 'Packaging'],
    established: '2018-11-10'
  },
  {
    id: 4,
    name: 'Coastal Storage Facility B',
    type: 'Storage Facility',
    coordinates: '7.8100° N, 122.5700° E',
    description: 'Temperature-controlled storage for fresh and frozen fish',
    capacity: '200 tons',
    status: 'Active',
    manager: 'Ana Rodriguez',
    contact: '+63 917 456 7890',
    facilities: ['Freezers', 'Loading Dock', 'Inventory System'],
    established: '2020-01-15'
  },
  {
    id: 5,
    name: 'Regional Office Complex',
    type: 'Office',
    coordinates: '7.8250° N, 122.5850° E',
    description: 'Administrative headquarters for fisheries operations',
    capacity: '200 staff',
    status: 'Under Maintenance',
    manager: 'Elena Reyes',
    contact: '+63 917 567 8901',
    facilities: ['Conference Rooms', 'Training Center', 'IT Center', 'Cafeteria'],
    established: '2005-09-30'
  }
]

const locationTypes = ['All', 'Fishing Ground', 'Harbor', 'Processing Plant', 'Storage Facility', 'Office']

export default function LocationsPage() {
  const [locations] = useState<Location[]>(mockLocations)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All')

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'Fishing Ground':
        return <Fish className="h-5 w-5 text-blue-500" />
      case 'Harbor':
        return <Anchor className="h-5 w-5 text-green-500" />
      case 'Processing Plant':
        return <Waves className="h-5 w-5 text-purple-500" />
      case 'Storage Facility':
        return <Mountain className="h-5 w-5 text-yellow-500" />
      case 'Office':
        return <MapPin className="h-5 w-5 text-red-500" />
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'Inactive':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'Under Maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Fishing Ground':
        return 'border-blue-200 bg-blue-50'
      case 'Harbor':
        return 'border-green-200 bg-green-50'
      case 'Processing Plant':
        return 'border-purple-200 bg-purple-50'
      case 'Storage Facility':
        return 'border-yellow-200 bg-yellow-50'
      case 'Office':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.manager.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'All' || location.type === selectedType
    return matchesSearch && matchesType
  })

  const activeLocations = locations.filter(loc => loc.status === 'Active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Location Management</h1>
            <p className="text-teal-100 text-lg">Manage fisheries facilities and fishing grounds</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <MapPin className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <Navigation className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">{activeLocations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Fish className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fishing Grounds</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Anchor className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Harbors</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
              >
                {locationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Map className="h-4 w-4 mr-2" />
              View Map
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location) => (
          <div key={location.id} className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow ${getTypeColor(location.type)}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getLocationIcon(location.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getStatusBadge(location.status)}>
                    {location.status}
                  </span>
                  <div className="flex items-center space-x-1">
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
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{location.description}</p>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Coordinates:</span>
                  <span className="font-medium text-gray-900">{location.coordinates}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium text-gray-900">{location.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Manager:</span>
                  <span className="font-medium text-gray-900">{location.manager}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Contact:</span>
                  <span className="font-medium text-gray-900">{location.contact}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Established:</span>
                  <span className="font-medium text-gray-900">{location.established}</span>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {location.facilities.map((facility, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-gray-700 border">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Location Types Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Location Types Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Fishing Ground', 'Harbor', 'Processing Plant', 'Storage Facility', 'Office'].map((type) => {
            const count = locations.filter(location => location.type === type).length
            return (
              <div key={type} className={`p-4 rounded-xl border ${getTypeColor(type)}`}>
                <div className="flex items-center justify-between mb-2">
                  {getLocationIcon(type)}
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{type}</p>
                  <p className="text-xs text-gray-600">Locations</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
