'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Briefcase, Heart } from 'lucide-react'
import CloudinaryUploadWidget, { CloudinaryUploadResult } from '@/components/CloudinaryUploadWidget'
import { CloudinaryImagePresets } from '@/components/CloudinaryImage'

const personnelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Suspended']),
  biography: z.string().optional(),
  spouseName: z.string().optional(),
  spouseOccupation: z.string().optional(),
  childrenCount: z.string().optional(),
  emergencyContact: z.string().optional(),
  childrenNames: z.string().optional(),
})

type PersonnelForm = z.infer<typeof personnelSchema>

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
}

interface PersonnelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  personnel?: Personnel | null
  mode: 'create' | 'edit'
}

const departments = [
  'Fisheries Management',
  'Aquaculture Development',
  'Marine Resources',
  'Freshwater Fisheries',
  'Fish Processing',
  'Extension Services',
  'Research & Development',
  'Administration'
]

const childrenOptions = ['0', '1', '2', '3', '4', '5', '5+']

export default function PersonnelModal({ isOpen, onClose, onSave, personnel, mode }: PersonnelModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PersonnelForm>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      status: 'Active',
      childrenCount: '0'
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && personnel) {
        reset({
          name: personnel.name,
          email: personnel.email,
          phone: personnel.phone || '',
          address: personnel.address || '',
          department: personnel.department,
          position: personnel.position || '',
          hireDate: personnel.hireDate || '',
          status: personnel.status,
          biography: personnel.biography || '',
          spouseName: personnel.spouseName || '',
          spouseOccupation: personnel.spouseOccupation || '',
          childrenCount: personnel.childrenCount || '0',
          emergencyContact: personnel.emergencyContact || '',
          childrenNames: personnel.childrenNames || '',
        })
        setProfilePhotoUrl(personnel.profilePhoto || '')
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          address: '',
          department: '',
          position: '',
          hireDate: '',
          status: 'Active',
          biography: '',
          spouseName: '',
          spouseOccupation: '',
          childrenCount: '0',
          emergencyContact: '',
          childrenNames: '',
        })
        setProfilePhotoUrl('')
      }
      setError('')
      setActiveTab('personal')
      setIsUploadingPhoto(false)
    }
  }, [isOpen, mode, personnel, reset])

  /**
   * Handle profile photo upload success
   */
  const handlePhotoUploadSuccess = (result: CloudinaryUploadResult) => {
    console.log('Profile photo uploaded:', result)
    setProfilePhotoUrl(result.info.secure_url)
    setIsUploadingPhoto(false)
  }

  /**
   * Handle profile photo upload error
   */
  const handlePhotoUploadError = (error: { message?: string }) => {
    console.error('Profile photo upload failed:', error)
    setIsUploadingPhoto(false)
    setError('Failed to upload profile photo. Please try again.')
  }

  const onSubmit = async (data: PersonnelForm) => {
    setIsLoading(true)
    setError('')

    try {
      const url = mode === 'create' ? '/api/personnel' : `/api/personnel/${personnel?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      // Include profile photo URL in the data
      const submitData = {
        ...data,
        profilePhoto: profilePhotoUrl
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'An error occurred')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: User },
    { id: 'work', name: 'Work Information', icon: Briefcase },
    { id: 'family', name: 'Family Information', icon: Heart },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {mode === 'create' ? 'Register New Personnel' : 'Edit Personnel'}
                  </h3>
                  <p className="text-blue-100 text-sm">Fisheries Division Registry</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white">
            <div className="px-6 py-6 max-h-96 overflow-y-auto">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
                    <div className="relative">
                      {profilePhotoUrl ? (
                        <CloudinaryImagePresets.Profile
                          src={profilePhotoUrl}
                          alt="Profile Photo"
                          size={120}
                          className="ring-4 ring-white shadow-lg"
                        />
                      ) : (
                        <div className="h-30 w-30 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-lg">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0">
                        <CloudinaryUploadWidget
                          onUploadSuccess={handlePhotoUploadSuccess}
                          onUploadError={handlePhotoUploadError}
                          onOpen={() => setIsUploadingPhoto(true)}
                          onClose={() => setIsUploadingPhoto(false)}
                          folder="lgu-uploads/personnel"
                          acceptedFileTypes={['image/*']}
                          multiple={false}
                          maxFiles={1}
                          cropping={true}
                          croppingAspectRatio={1}
                          buttonText=""
                          variant="primary"
                          size="sm"
                          className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                          disabled={isUploadingPhoto}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                      <p className="text-xs text-gray-500">
                        {isUploadingPhoto ? 'Uploading...' : 'Click camera icon to upload'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        {...register('emergencyContact')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter emergency contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              )}

              {/* Work Information Tab */}
              {activeTab === 'work' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department/Division *
                      </label>
                      <select
                        {...register('department')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                        Position/Title
                      </label>
                      <input
                        {...register('position')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter position or job title"
                      />
                    </div>

                    <div>
                      <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <input
                        {...register('hireDate')}
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-2">
                      Biography/Notes
                    </label>
                    <textarea
                      {...register('biography')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter biography, qualifications, or additional notes"
                    />
                  </div>
                </div>
              )}

              {/* Family Information Tab */}
              {activeTab === 'family' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="spouseName" className="block text-sm font-medium text-gray-700 mb-2">
                        Spouse Name
                      </label>
                      <input
                        {...register('spouseName')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter spouse's name"
                      />
                    </div>

                    <div>
                      <label htmlFor="spouseOccupation" className="block text-sm font-medium text-gray-700 mb-2">
                        Spouse Occupation
                      </label>
                      <input
                        {...register('spouseOccupation')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter spouse's occupation"
                      />
                    </div>

                    <div>
                      <label htmlFor="childrenCount" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Children
                      </label>
                      <select
                        {...register('childrenCount')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {childrenOptions.map((count) => (
                          <option key={count} value={count}>{count}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="childrenNames" className="block text-sm font-medium text-gray-700 mb-2">
                      Children Names & Ages
                    </label>
                    <textarea
                      {...register('childrenNames')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter children's names and ages (e.g., John (12), Mary (8))"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`w-2 h-2 rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Saving...' : mode === 'create' ? 'Register Personnel' : 'Update Personnel'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
