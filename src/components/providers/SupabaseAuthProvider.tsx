/**
 * Supabase Authentication Provider
 * 
 * This provider manages authentication state across the application.
 * It provides user information, loading states, and authentication methods
 * to all child components.
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      setError('Supabase configuration missing')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Get initial session
      const getInitialSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Error getting session:', error)
            setError(error.message)
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
        } catch (err) {
          console.error('Error in getInitialSession:', err)
          setError('Failed to initialize authentication')
        } finally {
          setLoading(false)
        }
      }

      getInitialSession()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            setError(null)

            // Handle sign out
            if (event === 'SIGNED_OUT') {
              setUser(null)
              setSession(null)
            }
          } catch (err) {
            console.error('Error in auth state change:', err)
            setError('Authentication state error')
          }
        }
      )

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error('Error initializing Supabase client:', err)
      setError('Failed to initialize Supabase client')
      setLoading(false)
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signOut,
  }

  // Show error state if there's a critical error
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
