'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Eye, Fish, ArrowUpDown, List, Grid3X3, MapPin, Phone, Mail, Calendar, User } from 'lucide-react'
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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PersonnelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'>('name_asc')
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const fetchPersonnel = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        sort: sortBy
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
  }, [pagination.page, pagination.limit, searchTerm, sortBy])

  useEffect(() => {
    fetchPersonnel()
  }, [fetchPersonnel])

  useEffect(() => {
    // Check if we should open create modal from URL
    if (searchParams.get('action') === 'create') {
      setSelectedPersonnel(null)
      setModalMode('create')
      setIsModalOpen(true)
    }
  }, [searchParams])

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
    // Navigate to personnel detail page instead of opening modal
    router.push(`/admin/personnel/${person.id}`)
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

  const handleSortChange = (newSort: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc') => {
    setSortBy(newSort)
    setPagination(prev => ({ ...prev, page: 1 }))
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

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {personnel.map((person) => (
        <div key={person.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
                  <p className="text-sm text-gray-500">ID: {person.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadge(person.status)}`}>
                {person.status}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{person.email}</span>
              </div>

              {person.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span>{person.phone}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{person.department}</span>
              </div>

              {person.position && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{person.position}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={() => handleViewPersonnel(person)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                title="View Details"
              >
                <Eye className="h-3 w-3 mr-1" />
                VIEW
              </button>
              <button
                onClick={() => handleEditPersonnel(person)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                title="Edit Personnel"
              >
                <Edit className="h-3 w-3 mr-1" />
                EDIT
              </button>
              <button
                onClick={() => handleDeletePersonnel(person)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                title="Delete Personnel"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                DELETE
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )



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

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-600 focus:outline-none focus:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-900"
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

          {/* Sort and View Controls */}
          <div className="flex items-center gap-6">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                Sort by:
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc')}
                className="px-4 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-w-[160px]"
              >
                <option value="id_asc">ID (ASC)</option>
                <option value="id_desc">ID (DESC)</option>
                <option value="name_asc">A - Z</option>
                <option value="name_desc">Z - A</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-gray-700">
                View:
              </div>
              <div className="flex rounded-xl border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    viewMode === 'cards'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Content */}
      {loading ? (
        <div className="bg-white shadow-lg rounded-2xl border border-blue-100">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      ) : personnel.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl border border-blue-100">
          <div className="text-center py-16">
            <Fish className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-500 mb-2">No personnel found</p>
            <p className="text-gray-400">Start by registering your first fisheries personnel</p>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        renderCardsView()
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-2xl border border-blue-100">
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
                  {personnel.map((person) => (
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
        </div>
      )}

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

      <PersonnelDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handlePersonnelDeleted}
        personnel={selectedPersonnel}
      />
    </div>
  )
}
