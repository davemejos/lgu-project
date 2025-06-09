'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

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

interface PersonnelDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  personnel: Personnel | null
}

export default function PersonnelDeleteModal({ isOpen, onClose, onConfirm, personnel }: PersonnelDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!personnel) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/personnel/${personnel.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onConfirm()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'An error occurred while deleting the personnel')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !personnel) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Personnel
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the personnel record for <strong>{personnel.name}</strong> ({personnel.email})? 
                This action cannot be undone and will permanently remove all personnel data including documents and records.
              </p>
              <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This will also delete all associated documents and cannot be recovered.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Personnel'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
