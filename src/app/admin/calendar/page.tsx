'use client'

import { useState } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Fish,
  AlertTriangle,
  CheckCircle,
  User,
  Filter,
  Search
} from 'lucide-react'

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  type: 'meeting' | 'training' | 'inspection' | 'maintenance' | 'emergency'
  location: string
  attendees: string[]
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Monthly Safety Training',
    description: 'Mandatory safety training for all marine operations personnel',
    date: '2024-01-20',
    time: '09:00',
    type: 'training',
    location: 'Training Center, Building D',
    attendees: ['Marine Operations Team', 'Safety Officers'],
    status: 'scheduled',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Boat Maintenance Inspection',
    description: 'Quarterly inspection of fishing vessels and equipment',
    date: '2024-01-22',
    time: '08:00',
    type: 'inspection',
    location: 'Maintenance Dock, Pier 3',
    attendees: ['Maintenance Team', 'Quality Control'],
    status: 'scheduled',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Department Heads Meeting',
    description: 'Monthly coordination meeting for all department heads',
    date: '2024-01-25',
    time: '14:00',
    type: 'meeting',
    location: 'Conference Room A',
    attendees: ['All Department Heads', 'Admin Staff'],
    status: 'scheduled',
    priority: 'high'
  },
  {
    id: 4,
    title: 'Equipment Calibration',
    description: 'Calibration of quality control and measurement equipment',
    date: '2024-01-28',
    time: '10:00',
    type: 'maintenance',
    location: 'Quality Lab, Building B',
    attendees: ['Quality Control Team', 'Technical Staff'],
    status: 'scheduled',
    priority: 'medium'
  },
  {
    id: 5,
    title: 'Emergency Response Drill',
    description: 'Quarterly emergency response and evacuation drill',
    date: '2024-01-30',
    time: '15:00',
    type: 'emergency',
    location: 'All Facilities',
    attendees: ['All Personnel'],
    status: 'scheduled',
    priority: 'high'
  }
]

const eventTypes = ['All', 'meeting', 'training', 'inspection', 'maintenance', 'emergency']

export default function CalendarPage() {
  const [events] = useState<Event[]>(mockEvents)
  const [selectedType, setSelectedType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'training':
        return <User className="h-4 w-4 text-green-500" />
      case 'inspection':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      case 'maintenance':
        return <Fish className="h-4 w-4 text-yellow-500" />
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <CalendarIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'training':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inspection':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'ongoing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'All' || event.type === selectedType
    return matchesSearch && matchesType
  })

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date()).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar & Events</h1>
            <p className="text-blue-100 text-lg">Schedule and manage fisheries activities</p>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
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
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar and Events Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">January 2024</h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 font-medium text-gray-500">{day}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <div 
                key={day} 
                className={`p-2 hover:bg-blue-100 rounded cursor-pointer ${
                  day === 20 ? 'bg-blue-600 text-white' : 'text-gray-700'
                } ${[20, 22, 25, 28, 30].includes(day) ? 'font-bold' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg border ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <span className={getStatusBadge(event.status)}>
                          {event.status}
                        </span>
                        <span className={getPriorityBadge(event.priority)}>
                          {event.priority} priority
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Attendees:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.attendees.map((attendee, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Types Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Types Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['meeting', 'training', 'inspection', 'maintenance', 'emergency'].map((type) => {
            const count = events.filter(event => event.type === type).length
            return (
              <div key={type} className={`p-4 rounded-xl border ${getEventTypeColor(type)}`}>
                <div className="flex items-center justify-between">
                  {getEventTypeIcon(type)}
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium capitalize">{type}</p>
                  <p className="text-xs opacity-75">Events</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
