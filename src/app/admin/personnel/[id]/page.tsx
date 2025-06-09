'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Activity, 
  Building, 
  Briefcase, 
  Heart,
  Edit,
  Trash2,
  FileText,
  Clock,
  Shield
} from 'lucide-react'
import PersonnelModal from '@/components/PersonnelModal'
import PersonnelDeleteModal from '@/components/PersonnelDeleteModal'

interface Personnel {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  profilePhoto?: string
  department: string
  position?: string
  hireDate?: string
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
  biography?: string
  spouseName?: string
  spouseOccupation?: string
  childrenCount?: string
  emergencyContact?: string
  childrenNames?: string
  createdAt: string
  updatedAt: string
  documents?: unknown[]
}

export default function PersonnelDetailPage() {
  const router = useRouter()
  const params = useParams()
  const personnelId = params.id as string

  const [personnel, setPersonnel] = useState<Personnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)



  useEffect(() => {
    if (personnelId) {
      fetchPersonnel()
    }
  }, [personnelId, fetchPersonnel])

  const fetchPersonnel = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/personnel/${personnelId}`)
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data)
      } else if (response.status === 404) {
        setError('Personnel not found')
      } else {
        setError('Failed to load personnel details')
      }
    } catch (error) {
      console.error('Error fetching personnel:', error)
      setError('An error occurred while loading personnel details')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/admin/personnel')
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handlePersonnelSaved = () => {
    setIsEditModalOpen(false)
    fetchPersonnel() // Refresh data
  }

  const handlePersonnelDeleted = () => {
    setIsDeleteModalOpen(false)
    router.push('/admin/personnel') // Navigate back to list
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Inactive': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'On Leave': 'bg-blue-100 text-blue-800 border-blue-200',
      'Suspended': 'bg-red-100 text-red-800 border-red-200'
    }
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading personnel details...</p>
        </div>
      </div>
    )
  }

  if (error || !personnel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Personnel not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The personnel record you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Personnel List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and breadcrumb */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Personnel
              </button>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Personnel</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">{personnel.name}</span>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                <div className="flex justify-center mb-4">
                  {personnel.profilePhoto ? (
                    <Image
                      src={personnel.profilePhoto}
                      alt={personnel.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {personnel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{personnel.name}</h1>
                <p className="text-blue-100 mb-3">{personnel.position || 'No position specified'}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(personnel.status)}`}>
                  {personnel.status}
                </span>
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 truncate">{personnel.email}</p>
                  </div>
                </div>

                {personnel.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{personnel.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{personnel.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">Personnel ID</p>
                    <p className="text-sm text-gray-900 font-mono">#{personnel.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personnel.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{personnel.address}</p>
                    </div>
                  </div>
                )}

                {personnel.hireDate && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hire Date</p>
                      <p className="text-sm text-gray-900">{personnel.hireDate}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employment Status</p>
                    <p className="text-sm text-gray-900">{personnel.status}</p>
                  </div>
                </div>

                {personnel.emergencyContact && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                      <p className="text-sm text-gray-900">{personnel.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Family Information */}
            {(personnel.spouseName || personnel.childrenCount || personnel.childrenNames) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Heart className="h-6 w-6 text-pink-600 mr-3" />
                  Family Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personnel.spouseName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Spouse Name</p>
                      <p className="text-sm text-gray-900">{personnel.spouseName}</p>
                    </div>
                  )}
                  {personnel.spouseOccupation && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Spouse Occupation</p>
                      <p className="text-sm text-gray-900">{personnel.spouseOccupation}</p>
                    </div>
                  )}
                  {personnel.childrenCount && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Number of Children</p>
                      <p className="text-sm text-gray-900">{personnel.childrenCount}</p>
                    </div>
                  )}
                  {personnel.childrenNames && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Children Names</p>
                      <p className="text-sm text-gray-900">{personnel.childrenNames}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Biography */}
            {personnel.biography && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="h-6 w-6 text-green-600 mr-3" />
                  Biography
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{personnel.biography}</p>
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 text-gray-600 mr-3" />
                System Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Record Created</p>
                    <p className="text-sm text-gray-900">{formatDate(personnel.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">{formatDate(personnel.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PersonnelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handlePersonnelSaved}
        personnel={personnel}
        mode="edit"
      />

      <PersonnelDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handlePersonnelDeleted}
        personnel={personnel}
      />
    </div>
  )
}
