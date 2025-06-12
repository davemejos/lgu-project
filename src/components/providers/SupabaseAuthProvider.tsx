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

  // Show error state if there's a critical error, but allow fallback
  if (error && !loading) {
    console.warn('SupabaseAuthProvider error, falling back to no-auth mode:', error)
    // Instead of blocking the entire app, just provide a fallback context
    const fallbackValue = {
      user: null,
      session: null,
      loading: false,
      error,
      signOut: async () => {},
    }

    return (
      <AuthContext.Provider value={fallbackValue}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
