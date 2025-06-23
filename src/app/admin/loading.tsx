import { Fish, Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo with Animation */}
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center animate-pulse">
          <Fish className="h-8 w-8 text-white" />
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">Loading Admin Panel...</span>
        </div>

        {/* Loading Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Initializing fisheries management system...
        </p>
      </div>
    </div>
  )
}
