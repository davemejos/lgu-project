import Link from 'next/link'
import { Fish, Users, FileText, MapPin, Camera, Printer, Menu, X, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MAO Ipil</h1>
                <p className="text-xs text-blue-600 font-medium">Fisheries Division</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </Link>
              <Link href="#departments" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Departments
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Fish className="w-4 h-4 mr-2" />
                Access Registry
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Fish className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Municipal Agriculture Office - Ipil
          </h1>
          <p className="mt-3 text-2xl font-semibold text-indigo-600">
            Fisheries Division
          </p>
          <p className="mt-2 text-lg text-gray-600 font-medium">
            OFFICIAL FISHERIES REGISTRY
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
            Complete personnel management system for fisheries operations and marine resource administration
          </p>
        </div>

        {/* Features */}
        <div id="features" className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Comprehensive Fisheries Management
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced digital solutions for modern fisheries administration and marine resource management
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Personnel Management
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Complete fisheries personnel registry with detailed profiles, family information, and work history.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Document Management
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Upload and manage official documents including certificates, clearances, and boat registries.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Location Integration
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Google Maps integration for address verification and location-based personnel tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <Camera className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Camera Integration
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Built-in camera functionality for capturing profile photos and document images directly in the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <Printer className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Print Functionality
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Professional printing capabilities with multiple paper sizes for reports and official documents.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-blue-100">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <Fish className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Fisheries Specialization
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Specialized for fisheries operations with department-specific fields and marine resource management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Fish className="w-5 h-5 mr-2" />
              Access Fisheries Registry
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 border border-blue-300 text-lg font-medium rounded-xl text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Register
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Demo credentials: demo@admin.com / demo123
          </p>
        </div>

        {/* Departments */}
        <div id="departments" className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Fisheries Departments</h2>
            <p className="mt-2 text-gray-600">Specialized divisions within the Municipal Agriculture Office</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Fisheries Management</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Aquaculture Development</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Marine Resources</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Freshwater Fisheries</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Fish Processing</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Extension Services</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Research & Development</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Administration</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 border-t border-blue-200 pt-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Built with enterprise-grade technologies</h2>
            <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-gray-500">
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">Next.js 15</span>
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">TypeScript</span>
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">Tailwind CSS</span>
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">Prisma ORM</span>
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">NextAuth.js</span>
              <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">SQLite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
