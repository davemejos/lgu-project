/**
 * Personnel Redux Slice
 * 
 * Manages personnel data state including:
 * - Personnel list with pagination
 * - Search and filtering
 * - CRUD operations
 * - Loading states and error handling
 * - Sorting and view preferences
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface Personnel {
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
  documents?: unknown[]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PersonnelFilters {
  search: string
  department?: string
  status?: string
  sortBy: 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
}

export interface PersonnelState {
  personnel: Personnel[]
  selectedPersonnel: Personnel | null
  pagination: PaginationInfo
  filters: PersonnelFilters
  viewMode: 'list' | 'cards'
  loading: boolean
  error: string | null
  operationLoading: boolean // For create/update/delete operations
}

// Initial state
const initialState: PersonnelState = {
  personnel: [],
  selectedPersonnel: null,
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
  viewMode: 'list',
  loading: false,
  error: null,
  operationLoading: false,
}

// Async thunks
export const fetchPersonnel = createAsyncThunk(
  'personnel/fetchPersonnel',
  async (params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
  } = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        ...(params.search && { search: params.search }),
        sort: params.sortBy || 'name_asc'
      })

      const response = await fetch(`/api/personnel?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch personnel')
      }

      const data = await response.json()
      return {
        personnel: data.personnel,
        pagination: data.pagination,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch personnel'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPersonnelById = createAsyncThunk(
  'personnel/fetchPersonnelById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/personnel/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch personnel')
      }

      const data = await response.json()
      return data.personnel
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch personnel'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createPersonnel = createAsyncThunk(
  'personnel/createPersonnel',
  async (personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personnelData),
      })

      if (!response.ok) {
        throw new Error('Failed to create personnel')
      }

      const data = await response.json()
      return data.personnel
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create personnel'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updatePersonnel = createAsyncThunk(
  'personnel/updatePersonnel',
  async ({ id, ...personnelData }: Partial<Personnel> & { id: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personnelData),
      })

      if (!response.ok) {
        throw new Error('Failed to update personnel')
      }

      const data = await response.json()
      return data.personnel
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update personnel'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deletePersonnel = createAsyncThunk(
  'personnel/deletePersonnel',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete personnel')
      }

      return id
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete personnel'
      return rejectWithValue(errorMessage)
    }
  }
)

// Personnel slice
const personnelSlice = createSlice({
  name: 'personnel',
  initialState,
  reducers: {
    setSelectedPersonnel: (state, action: PayloadAction<Personnel | null>) => {
      state.selectedPersonnel = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PersonnelFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationInfo>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setViewMode: (state, action: PayloadAction<'list' | 'cards'>) => {
      state.viewMode = action.payload
    },
    clearPersonnelError: (state) => {
      state.error = null
    },
    resetPersonnelState: () => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    // Fetch personnel
    builder
      .addCase(fetchPersonnel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPersonnel.fulfilled, (state, action) => {
        state.loading = false
        state.personnel = action.payload.personnel
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchPersonnel.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch personnel by ID
    builder
      .addCase(fetchPersonnelById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPersonnelById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedPersonnel = action.payload
        state.error = null
      })
      .addCase(fetchPersonnelById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create personnel
    builder
      .addCase(createPersonnel.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(createPersonnel.fulfilled, (state, action) => {
        state.operationLoading = false
        state.personnel.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createPersonnel.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Update personnel
    builder
      .addCase(updatePersonnel.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(updatePersonnel.fulfilled, (state, action) => {
        state.operationLoading = false
        const index = state.personnel.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.personnel[index] = action.payload
        }
        if (state.selectedPersonnel?.id === action.payload.id) {
          state.selectedPersonnel = action.payload
        }
        state.error = null
      })
      .addCase(updatePersonnel.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Delete personnel
    builder
      .addCase(deletePersonnel.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(deletePersonnel.fulfilled, (state, action) => {
        state.operationLoading = false
        state.personnel = state.personnel.filter(p => p.id !== action.payload)
        state.pagination.total -= 1
        if (state.selectedPersonnel?.id === action.payload) {
          state.selectedPersonnel = null
        }
        state.error = null
      })
      .addCase(deletePersonnel.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  setSelectedPersonnel,
  setFilters,
  setPagination,
  setViewMode,
  clearPersonnelError,
  resetPersonnelState,
} = personnelSlice.actions

// Export selectors
export const selectPersonnelList = (state: { personnel: PersonnelState }) => state.personnel.personnel
export const selectSelectedPersonnel = (state: { personnel: PersonnelState }) => state.personnel.selectedPersonnel
export const selectPersonnelPagination = (state: { personnel: PersonnelState }) => state.personnel.pagination
export const selectPersonnelFilters = (state: { personnel: PersonnelState }) => state.personnel.filters
export const selectPersonnelViewMode = (state: { personnel: PersonnelState }) => state.personnel.viewMode
export const selectPersonnelLoading = (state: { personnel: PersonnelState }) => state.personnel.loading
export const selectPersonnelOperationLoading = (state: { personnel: PersonnelState }) => state.personnel.operationLoading
export const selectPersonnelError = (state: { personnel: PersonnelState }) => state.personnel.error

// Export reducer
export default personnelSlice.reducer
