/**
 * Settings Redux Slice
 * 
 * Manages application settings including:
 * - User preferences
 * - System configuration
 * - Feature flags
 * - Application metadata
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface UserPreferences {
  language: 'en' | 'fil' | 'ceb'
  timezone: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  itemsPerPage: 10 | 25 | 50 | 100
  defaultView: 'list' | 'cards'
  enableNotifications: boolean
  enableSounds: boolean
  autoSave: boolean
}

export interface SystemSettings {
  appName: string
  appVersion: string
  maintenanceMode: boolean
  allowRegistration: boolean
  maxFileUploadSize: number
  supportedFileTypes: string[]
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
}

export interface FeatureFlags {
  enableChatbot: boolean
  enableAnalytics: boolean
  enableExport: boolean
  enableImport: boolean
  enableBulkOperations: boolean
  enableAdvancedSearch: boolean
  enableReports: boolean
  enableNotifications: boolean
}

export interface SettingsState {
  userPreferences: UserPreferences
  systemSettings: SystemSettings
  featureFlags: FeatureFlags
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

// Initial state
const initialState: SettingsState = {
  userPreferences: {
    language: 'en',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    itemsPerPage: 10,
    defaultView: 'list',
    enableNotifications: true,
    enableSounds: true,
    autoSave: true,
  },
  systemSettings: {
    appName: 'LGU Project App',
    appVersion: '1.0.0',
    maintenanceMode: false,
    allowRegistration: false,
    maxFileUploadSize: 10485760, // 10MB
    supportedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
    sessionTimeout: 3600000, // 1 hour
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
  },
  featureFlags: {
    enableChatbot: true,
    enableAnalytics: true,
    enableExport: true,
    enableImport: true,
    enableBulkOperations: true,
    enableAdvancedSearch: true,
    enableReports: true,
    enableNotifications: true,
  },
  loading: false,
  error: null,
  lastUpdated: null,
}

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Try to load from localStorage first
      const savedPreferences = localStorage.getItem('userPreferences')
      const savedSystemSettings = localStorage.getItem('systemSettings')
      const savedFeatureFlags = localStorage.getItem('featureFlags')

      const settings = {
        userPreferences: savedPreferences ? JSON.parse(savedPreferences) : initialState.userPreferences,
        systemSettings: savedSystemSettings ? JSON.parse(savedSystemSettings) : initialState.systemSettings,
        featureFlags: savedFeatureFlags ? JSON.parse(savedFeatureFlags) : initialState.featureFlags,
      }

      return settings
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings'
      return rejectWithValue(errorMessage)
    }
  }
)

export const saveUserPreferences = createAsyncThunk(
  'settings/saveUserPreferences',
  async (preferences: Partial<UserPreferences>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState }
      const updatedPreferences = { ...state.settings.userPreferences, ...preferences }
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
      
      // In a real app, you might also save to the server
      // const response = await fetch('/api/settings/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedPreferences),
      // })

      return updatedPreferences
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save user preferences'
      return rejectWithValue(errorMessage)
    }
  }
)

export const saveSystemSettings = createAsyncThunk(
  'settings/saveSystemSettings',
  async (settings: Partial<SystemSettings>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState }
      const updatedSettings = { ...state.settings.systemSettings, ...settings }
      
      // Save to localStorage
      localStorage.setItem('systemSettings', JSON.stringify(updatedSettings))
      
      return updatedSettings
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save system settings'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateFeatureFlags = createAsyncThunk(
  'settings/updateFeatureFlags',
  async (flags: Partial<FeatureFlags>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { settings: SettingsState }
      const updatedFlags = { ...state.settings.featureFlags, ...flags }
      
      // Save to localStorage
      localStorage.setItem('featureFlags', JSON.stringify(updatedFlags))
      
      return updatedFlags
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update feature flags'
      return rejectWithValue(errorMessage)
    }
  }
)

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload }
    },
    setSystemSettings: (state, action: PayloadAction<Partial<SystemSettings>>) => {
      state.systemSettings = { ...state.systemSettings, ...action.payload }
    },
    setFeatureFlags: (state, action: PayloadAction<Partial<FeatureFlags>>) => {
      state.featureFlags = { ...state.featureFlags, ...action.payload }
    },
    toggleFeatureFlag: (state, action: PayloadAction<keyof FeatureFlags>) => {
      state.featureFlags[action.payload] = !state.featureFlags[action.payload]
    },
    clearSettingsError: (state) => {
      state.error = null
    },
    resetSettings: () => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    // Load settings
    builder
      .addCase(loadSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.loading = false
        state.userPreferences = action.payload.userPreferences
        state.systemSettings = action.payload.systemSettings
        state.featureFlags = action.payload.featureFlags
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Save user preferences
    builder
      .addCase(saveUserPreferences.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.loading = false
        state.userPreferences = action.payload
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Save system settings
    builder
      .addCase(saveSystemSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveSystemSettings.fulfilled, (state, action) => {
        state.loading = false
        state.systemSettings = action.payload
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(saveSystemSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update feature flags
    builder
      .addCase(updateFeatureFlags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFeatureFlags.fulfilled, (state, action) => {
        state.loading = false
        state.featureFlags = action.payload
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(updateFeatureFlags.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  setUserPreferences,
  setSystemSettings,
  setFeatureFlags,
  toggleFeatureFlag,
  clearSettingsError,
  resetSettings,
} = settingsSlice.actions

// Export selectors
export const selectUserPreferences = (state: { settings: SettingsState }) => state.settings.userPreferences
export const selectSystemSettings = (state: { settings: SettingsState }) => state.settings.systemSettings
export const selectFeatureFlags = (state: { settings: SettingsState }) => state.settings.featureFlags
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading
export const selectSettingsError = (state: { settings: SettingsState }) => state.settings.error
export const selectSettingsLastUpdated = (state: { settings: SettingsState }) => state.settings.lastUpdated

// Feature flag selectors
export const selectFeatureFlag = (flag: keyof FeatureFlags) => (state: { settings: SettingsState }) => 
  state.settings.featureFlags[flag]

// Export reducer
export default settingsSlice.reducer
