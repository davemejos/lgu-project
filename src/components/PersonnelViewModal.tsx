'use client'

import Image from 'next/image'
import { X, Mail, User, Phone, MapPin, Calendar, Activity, Building, Briefcase, Heart } from 'lucide-react'

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

interface PersonnelViewModalProps {
  isOpen: boolean
  onClose: () => void
  personnel: Personnel | null
}

export default function PersonnelViewModal({ isOpen, onClose, personnel }: PersonnelViewModalProps) {
  if (!isOpen || !personnel) return null

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-yellow-100 text-yellow-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'Suspended': 'bg-red-100 text-red-800'
    }
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Personnel Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Personnel Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  {personnel.profilePhoto ? (
                    <Image
                      src={personnel.profilePhoto}
                      alt={personnel.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-xl font-medium text-white">
                        {personnel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{personnel.name}</h4>
                  <p className="text-sm text-gray-600">{personnel.position || 'No position specified'}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(personnel.status)}`}>
                    {personnel.status}
                  </span>
                </div>
              </div>

              {/* Personnel Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{personnel.email}</p>
                    </div>
                  </div>

                  {personnel.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{personnel.phone}</p>
                      </div>
                    </div>
                  )}

                  {personnel.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{personnel.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-sm text-gray-900">{personnel.department}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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
                      <p className="text-sm font-medium text-gray-500">Status</p>
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

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Personnel ID</p>
                      <p className="text-sm text-gray-900 font-mono">{personnel.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              {(personnel.spouseName || personnel.childrenCount || personnel.childrenNames) && (
                <div className="border-t pt-4">
                  <h5 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-2" />
                    Family Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personnel.spouseName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Spouse Name</p>
                        <p className="text-sm text-gray-900">{personnel.spouseName}</p>
                      </div>
                    )}
                    {personnel.spouseOccupation && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Spouse Occupation</p>
                        <p className="text-sm text-gray-900">{personnel.spouseOccupation}</p>
                      </div>
                    )}
                    {personnel.childrenCount && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Number of Children</p>
                        <p className="text-sm text-gray-900">{personnel.childrenCount}</p>
                      </div>
                    )}
                    {personnel.childrenNames && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Children Names</p>
                        <p className="text-sm text-gray-900">{personnel.childrenNames}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Biography */}
              {personnel.biography && (
                <div className="border-t pt-4">
                  <h5 className="text-lg font-medium text-gray-900 mb-3">Biography</h5>
                  <p className="text-sm text-gray-700">{personnel.biography}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
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

            <div className="flex justify-end pt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
