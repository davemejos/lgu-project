'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Eye, Fish, Phone, MapPin, Building, Calendar, Users as UsersIcon } from 'lucide-react'
import PersonnelModal from '@/components/PersonnelModal'
import PersonnelViewModal from '@/components/PersonnelViewModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

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
  documents?: any[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PersonnelPage() {
  const searchParams = useSearchParams()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchPersonnel()
  }, [pagination.page, searchTerm])

  useEffect(() => {
    // Check if we should open create modal from URL
    if (searchParams.get('action') === 'create') {
      handleCreatePersonnel()
    }
  }, [searchParams])

  const fetchPersonnel = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/personnel?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data.personnel)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching personnel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePersonnel = () => {
    setSelectedPersonnel(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditPersonnel = (person: Personnel) => {
    setSelectedPersonnel(person)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleViewPersonnel = (person: Personnel) => {
    setSelectedPersonnel(person)
    setIsViewModalOpen(true)
  }

  const handleDeletePersonnel = (person: Personnel) => {
    setSelectedPersonnel(person)
    setIsDeleteModalOpen(true)
  }

  const handlePersonnelSaved = () => {
    setIsModalOpen(false)
    fetchPersonnel()
  }

  const handlePersonnelDeleted = () => {
    setIsDeleteModalOpen(false)
    fetchPersonnel()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPersonnel()
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Active': 'bg-green-500 text-white',
      'Inactive': 'bg-red-500 text-white',
      'On Leave': 'bg-yellow-500 text-white',
      'Suspended': 'bg-red-500 text-white'
    }
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-500 text-white'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fisheries Personnel Registry</h1>
              <p className="mt-1 text-gray-600">Manage all fisheries personnel records and information</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreatePersonnel}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Register New Personnel
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    placeholder="Search personnel by name, email, department, position, or status..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Search
              </button>
        </form>
      </div>

      {/* Personnel Table */}
      <div className="bg-white shadow-lg overflow-hidden rounded-2xl border border-blue-100">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : personnel.length === 0 ? (
            <div className="text-center py-16">
              <Fish className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl text-gray-500 mb-2">No personnel found</p>
              <p className="text-gray-400">Start by registering your first fisheries personnel</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      REGISTRY ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      FULL NAME
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      POSITION
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      DIVISION/SECTION
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      CONTACT NUMBER
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-100">
                  {personnel.map((person, index) => (
                    <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {person.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {person.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {person.position || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {person.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {person.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadge(person.status)}`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPersonnel(person)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            VIEW
                          </button>
                          <button
                            onClick={() => handleEditPersonnel(person)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            title="Edit Personnel"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeletePersonnel(person)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            title="Delete Personnel"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> personnel
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
        </div>
      )}

      {/* Modals */}
      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handlePersonnelSaved}
        personnel={selectedPersonnel}
        mode={modalMode}
      />

      {/* <PersonnelViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        personnel={selectedPersonnel}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handlePersonnelDeleted}
        personnel={selectedPersonnel}
      /> */}
    </div>
  )
}
