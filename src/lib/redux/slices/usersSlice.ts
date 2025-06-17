/**
 * Users Redux Slice
 * 
 * Manages user data state including:
 * - User list with pagination
 * - User CRUD operations
 * - User roles and permissions
 * - Loading states and error handling
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface AppUser {
  id: number
  name: string
  email: string
  role: 'Admin' | 'User' | 'Moderator'
  status: 'Active' | 'Inactive' | 'Suspended'
  lastLogin?: string
  createdAt: string
  updatedAt: string
  profilePhoto?: string
  phone?: string
  department?: string
}

export interface UsersPaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface UsersFilters {
  search: string
  role?: string
  status?: string
  sortBy: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
}

export interface UsersState {
  users: AppUser[]
  selectedUser: AppUser | null
  pagination: UsersPaginationInfo
  filters: UsersFilters
  loading: boolean
  error: string | null
  operationLoading: boolean
}

// Initial state
const initialState: UsersState = {
  users: [],
  selectedUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    sortBy: 'name_asc',
  },
  loading: false,
  error: null,
  operationLoading: false,
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    role?: string
    status?: string
  } = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        ...(params.search && { search: params.search }),
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
        sort: params.sortBy || 'name_asc'
      })

      const response = await fetch(`/api/users?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      return {
        users: data.users,
        pagination: data.pagination,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      return data.user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      const data = await response.json()
      return data.user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, ...userData }: Partial<AppUser> & { id: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const data = await response.json()
      return data.user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      return id
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'
      return rejectWithValue(errorMessage)
    }
  }
)

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<AppUser | null>) => {
      state.selectedUser = action.payload
    },
    setUsersFilters: (state, action: PayloadAction<Partial<UsersFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setUsersPagination: (state, action: PayloadAction<Partial<UsersPaginationInfo>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearUsersError: (state) => {
      state.error = null
    },
    resetUsersState: () => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
        state.error = null
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.operationLoading = false
        state.users.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.operationLoading = false
        const index = state.users.findIndex(u => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.operationLoading = false
        state.users = state.users.filter(u => u.id !== action.payload)
        state.pagination.total -= 1
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null
        }
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  setSelectedUser,
  setUsersFilters,
  setUsersPagination,
  clearUsersError,
  resetUsersState,
} = usersSlice.actions

// Export selectors
export const selectUsers = (state: { users: UsersState }) => state.users.users
export const selectSelectedUser = (state: { users: UsersState }) => state.users.selectedUser
export const selectUsersPagination = (state: { users: UsersState }) => state.users.pagination
export const selectUsersFilters = (state: { users: UsersState }) => state.users.filters
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading
export const selectUsersOperationLoading = (state: { users: UsersState }) => state.users.operationLoading
export const selectUsersError = (state: { users: UsersState }) => state.users.error

// Export reducer
export default usersSlice.reducer
