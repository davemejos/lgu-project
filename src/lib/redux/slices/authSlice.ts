/**
 * Authentication Redux Slice
 * 
 * Manages authentication state including:
 * - User authentication status
 * - User profile information
 * - Session management
 * - Authentication loading states
 * - Integration with Supabase Auth
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

// Types
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  initialized: boolean
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  initialized: false,
}

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return {
        session,
        user: session?.user || null,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize authentication'
      return rejectWithValue(errorMessage)
    }
  }
)

export const signInWithPassword = createAsyncThunk(
  'auth/signInWithPassword',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return {
        session: data.session,
        user: data.user,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
      return rejectWithValue(errorMessage)
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      return null
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
      return rejectWithValue(errorMessage)
    }
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, metadata }: {
    email: string;
    password: string;
    metadata?: Record<string, unknown>
  }, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        throw error
      }

      return {
        session: data.session,
        user: data.user,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up'
      return rejectWithValue(errorMessage)
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.isAuthenticated = !!action.payload.user
      state.loading = false
      state.error = null
      state.initialized = true
    },
    clearAuthError: (state) => {
      state.error = null
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!action.payload.user
        state.initialized = true
        state.error = null
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true
      })

    // Sign in
    builder
      .addCase(signInWithPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithPassword.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!action.payload.user
        state.error = null
      })
      .addCase(signInWithPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.session = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!action.payload.user
        state.error = null
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const { setAuthState, clearAuthError, setAuthLoading } = authSlice.actions

// Export selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.initialized

// Export reducer
export default authSlice.reducer
