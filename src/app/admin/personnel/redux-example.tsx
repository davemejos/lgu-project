/**
 * Redux-Powered Personnel Page Example
 * 
 * This is an example of how to use Redux Toolkit in the Personnel page.
 * It demonstrates:
 * - Using Redux hooks for state management
 * - Dispatching async actions
 * - Handling loading states and errors
 * - Integrating with existing UI components
 */

'use client'

import { useEffect } from 'react'
import { Plus, Search, Fish, ArrowUpDown, List, Grid3X3 } from 'lucide-react'
import { usePersonnel, useUI } from '@/lib/redux/hooks'

export default function ReduxPersonnelPage() {
  const {
    personnel,
    pagination,
    filters,
    viewMode,
    loading,
    operationLoading,
    error,
    fetchPersonnelList,
    updateFilters,
    updatePagination,
    updateViewMode,
    clearError,
  } = usePersonnel()

  const {
    showModal,
    showNotification,
    updatePageTitle,
    updateBreadcrumbs,
  } = useUI()

  // Initialize page
  useEffect(() => {
    updatePageTitle('Fisheries Personnel Registry')
    updateBreadcrumbs([
      { label: 'Admin', href: '/admin' },
      { label: 'Personnel', href: '/admin/personnel' },
    ])

    // Fetch personnel data
    fetchPersonnelList({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      sortBy: filters.sortBy,
    })
  }, [updatePageTitle, updateBreadcrumbs, fetchPersonnelList, pagination.page, pagination.limit, filters.search, filters.sortBy])

  // Refetch when filters change
  useEffect(() => {
    fetchPersonnelList({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      sortBy: filters.sortBy,
    })
  }, [fetchPersonnelList, pagination.page, pagination.limit, filters.search, filters.sortBy])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updatePagination({ page: 1 })
    fetchPersonnelList({
      page: 1,
      limit: pagination.limit,
      search: filters.search,
      sortBy: filters.sortBy,
    })
  }

  // Handle sort change
  const handleSortChange = (newSort: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc') => {
    updateFilters({ sortBy: newSort })
    updatePagination({ page: 1 })
  }

  // Handle create personnel
  const handleCreatePersonnel = () => {
    showModal({
      id: 'personnel-modal',
      type: 'personnel',
      data: { mode: 'create' },
    })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    updatePagination({ page: newPage })
  }

  // Show error notification if there's an error
  useEffect(() => {
    if (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error,
      })
      clearError()
    }
  }, [error, showNotification, clearError])

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
              disabled={operationLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-600 focus:outline-none focus:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-900"
                  placeholder="Search personnel by name, email, department, position, or status..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
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
                value={filters.sortBy}
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
                  onClick={() => updateViewMode('list')}
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
                  onClick={() => updateViewMode('cards')}
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
      ) : personnel && personnel.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl border border-blue-100">
          <div className="text-center py-16">
            <Fish className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-500 mb-2">No personnel found</p>
            <p className="text-gray-400">Start by registering your first fisheries personnel</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-2xl border border-blue-100">
          <div className="p-4">
            <p className="text-sm text-gray-600">
              Showing {personnel ? personnel.length : 0} of {pagination.total} personnel records
            </p>
          </div>
          {/* Add your table or cards view here */}
          <div className="p-4">
            <p className="text-center text-gray-500">
              Redux integration complete! Personnel data: {JSON.stringify(personnel ? personnel.slice(0, 2) : [], null, 2)}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
