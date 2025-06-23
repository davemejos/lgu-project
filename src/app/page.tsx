import Link from 'next/link'
import Image from 'next/image'
import { Fish, Users, FileText, MapPin, Camera, Printer, Star, User, FolderOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#0c035f]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 flex items-center justify-center relative">
                <Image
                  src="/images/logo.png"
                  alt="LGU Ipil Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LGU Ipil</h1>
                <p className="text-sm font-medium" style={{ color: '#0c035f' }}>Local Gov</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 font-medium transition-colors hover:text-[#0c035f]">
                Features
              </Link>
              <Link href="#departments" className="text-gray-700 font-medium transition-colors hover:text-[#0c035f]">
                Departments
              </Link>
              <Link href="#about" className="text-gray-700 font-medium transition-colors hover:text-[#0c035f]">
                About
              </Link>
            </nav>

            {/* Explore Projects Button */}
            <div className="flex items-center">
              <Link
                href="/projects"
                className="inline-flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: '#fff',
                  borderColor: '#0c035f',
                  color: '#0c035f',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Professional Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Custom LGU Ipil Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("/images/lgu-ipil.png")`
            }}
          />
          {/* Professional dark blue overlay for better contrast */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30"></div>
        </div>



        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2 mb-8 backdrop-blur-md shadow-lg border border-[#0c035f]/70">
              <span className="text-sm font-medium text-[#0c035f]">Welcome to Ipil</span>
              <Star className="w-4 h-4 text-[#eced2b]" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              Bayan ng Ipil
              <br />
              <span className="inline-block px-4 py-2 rounded-lg mt-4" style={{ backgroundColor: '#f8f9fa', color: '#937e47' }}>
                Lambo Pa Sibugay
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 max-w-3xl mx-auto text-lg sm:text-xl text-white leading-relaxed drop-shadow-lg">
              We are building a future shaped by strong leadership, inclusive progress, and community pride.
              <br />
              Every step forward is a commitment to a better life for every Sibugaynon.
            </p>

            {/* CTA Button */}
            <div className="mt-10 flex items-center justify-center">
              <Link
                href="/admin"
                className="inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
                style={{ background: 'linear-gradient(135deg, #0c035f 0%, #e01e09 100%)', color: 'white', border: 'none' }}
              >
                <User className="w-6 h-6 mr-2" />
                Access Registry
              </Link>
            </div>
          </div>
        </div>

        {/* Professional floating elements */}
        <div className="absolute top-1/4 left-1/12 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
        <div className="absolute top-3/4 right-1/12 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-blue-500 rounded-full opacity-50"></div>
        <div className="absolute top-1/3 right-1/6 w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-60"></div>
      </div>

      {/* Rest of the page with updated styling */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Features */}
          <div id="features" className="pt-16">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                <div className="flow-root bg-white rounded-xl px-6 pb-8 shadow-lg border border-[#0c035f]/20">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-xl shadow-lg bg-[#0c035f]">
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
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c035f] bg-[#0c035f]"
              >
                <Fish className="w-5 h-5 mr-2" />
                Access Fisheries Registry
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-white shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c035f] border border-[#0c035f] text-[#0c035f]"
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
          <div id="departments" className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-[#0c035f]/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Fisheries Departments</h2>
              <p className="mt-2 text-gray-600">Specialized divisions within the Local Government Unit</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Fisheries Management</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Aquaculture Development</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Marine Resources</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Freshwater Fisheries</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Fish Processing</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Extension Services</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Research & Development</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0c035f]/10 border border-[#0c035f]/20">
                <p className="font-medium text-[#0c035f]">Administration</p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 pt-8 border-t border-[#0c035f]/30">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">Built with enterprise-grade technologies</h2>
              <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-gray-500">
                <span className="font-medium px-3 py-1 rounded-full bg-[#0c035f]/90 text-white">Next.js 15</span>
                <span className="font-medium px-3 py-1 rounded-full bg-[#0c035f]/90 text-white">TypeScript</span>
                <span className="font-medium px-3 py-1 rounded-full bg-[#0c035f]/90 text-white">Tailwind CSS</span>
                <span className="font-medium px-3 py-1 rounded-full bg-[#0c035f]/90 text-white">Supabase</span>
                <span className="font-medium px-3 py-1 rounded-full bg-[#0c035f]/90 text-white">Supabase Auth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
