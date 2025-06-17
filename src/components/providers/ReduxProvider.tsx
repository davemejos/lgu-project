/**
 * Redux Provider Component
 * 
 * This component wraps the application with Redux Provider and handles:
 * - Redux store initialization
 * - Integration with Supabase Auth
 * - Settings initialization
 * - Error boundary for Redux operations
 */

'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { store, useAppDispatch } from '@/lib/store'
import { initializeAuth, setAuthState } from '@/lib/redux/slices/authSlice'
import { loadSettings } from '@/lib/redux/slices/settingsSlice'
import { createClient } from '@/utils/supabase/client'

interface ReduxProviderProps {
  children: React.ReactNode
}

// Inner component to handle initialization
function ReduxInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Initialize settings
    dispatch(loadSettings())

    // Initialize auth
    dispatch(initializeAuth())

    // Set up Supabase auth listener
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          dispatch(setAuthState({
            user: session?.user || null,
            session: session,
          }))

          // Handle specific auth events
          switch (event) {
            case 'SIGNED_IN':
              console.log('User signed in:', session?.user?.email)
              break
            case 'SIGNED_OUT':
              console.log('User signed out')
              break
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed')
              break
            case 'USER_UPDATED':
              console.log('User updated')
              break
            default:
              break
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  )
}

export default ReduxProvider
