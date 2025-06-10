'use client'

import { useAuth } from '@/components/providers/SupabaseAuthProvider'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

export default function DebugAuthPage() {
  const { user, session, loading } = useAuth()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [directLoading, setDirectLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const checkDirectAuth = async () => {
      try {
        console.log('Checking direct Supabase auth...')
        
        // Check session directly
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Direct session check:', { session, sessionError })
        setSupabaseSession(session)
        
        // Check user directly
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('Direct user check:', { user, userError })
        setSupabaseUser(user)
        
      } catch (error) {
        console.error('Direct auth check error:', error)
      } finally {
        setDirectLoading(false)
      }
    }
    
    checkDirectAuth()
  }, [supabase])

  const handleLogin = async () => {
    try {
      console.log('Attempting login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@admin.com',
        password: 'demo123'
      })
      
      console.log('Login result:', { data, error })
      
      if (error) {
        alert(`Login failed: ${error.message}`)
      } else {
        alert('Login successful!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(`Login error: ${error}`)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      alert('Logged out!')
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth Provider State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Auth Provider State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {user ? user.email : 'null'}</p>
              <p><strong>Session:</strong> {session ? 'exists' : 'null'}</p>
              {user && (
                <div className="mt-4 p-3 bg-green-50 rounded">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Direct Supabase State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Direct Supabase State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {directLoading ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {supabaseUser ? supabaseUser.email : 'null'}</p>
              <p><strong>Session:</strong> {supabaseSession ? 'exists' : 'null'}</p>
              {supabaseUser && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p><strong>User ID:</strong> {supabaseUser.id}</p>
                  <p><strong>Email:</strong> {supabaseUser.email}</p>
                  <p><strong>Email Confirmed:</strong> {supabaseUser.email_confirmed_at ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login with Demo Credentials
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Admin
            </button>
          </div>
        </div>

        {/* Environment Check */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
