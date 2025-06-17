/**
 * UI Redux Slice
 * 
 * Manages global UI state including:
 * - Modal states
 * - Loading indicators
 * - Notifications/alerts
 * - Sidebar state
 * - Theme preferences
 * - Global UI preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: number
}

export interface Modal {
  id: string
  type: 'personnel' | 'user' | 'delete' | 'view' | 'settings' | 'custom'
  isOpen: boolean
  data?: unknown
  props?: Record<string, unknown>
}

export interface UIState {
  // Global loading
  globalLoading: boolean
  
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modals
  modals: Modal[]
  
  // Notifications
  notifications: Notification[]
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Layout preferences
  layoutDensity: 'comfortable' | 'compact' | 'spacious'
  
  // Search
  globalSearchOpen: boolean
  globalSearchQuery: string
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>
  
  // Page title
  pageTitle: string
  
  // Error boundary
  hasError: boolean
  errorMessage: string | null
}

// Initial state
const initialState: UIState = {
  globalLoading: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: [],
  notifications: [],
  theme: 'light',
  layoutDensity: 'comfortable',
  globalSearchOpen: false,
  globalSearchQuery: '',
  breadcrumbs: [],
  pageTitle: 'LGU Project App',
  hasError: false,
  errorMessage: null,
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },

    // Sidebar
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },

    // Modals
    openModal: (state, action: PayloadAction<Omit<Modal, 'isOpen'>>) => {
      const existingModal = state.modals.find(m => m.id === action.payload.id)
      if (existingModal) {
        existingModal.isOpen = true
        existingModal.data = action.payload.data
        existingModal.props = action.payload.props
      } else {
        state.modals.push({ ...action.payload, isOpen: true })
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(m => m.id === action.payload)
      if (modal) {
        modal.isOpen = false
      }
    },
    closeAllModals: (state) => {
      state.modals.forEach(modal => {
        modal.isOpen = false
      })
    },
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload)
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },

    // Layout
    setLayoutDensity: (state, action: PayloadAction<'comfortable' | 'compact' | 'spacious'>) => {
      state.layoutDensity = action.payload
    },

    // Global search
    setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.globalSearchOpen = action.payload
    },
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload
    },
    toggleGlobalSearch: (state) => {
      state.globalSearchOpen = !state.globalSearchOpen
    },

    // Breadcrumbs
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; href?: string }>>) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action: PayloadAction<{ label: string; href?: string }>) => {
      state.breadcrumbs.push(action.payload)
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = []
    },

    // Page title
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload
    },

    // Error boundary
    setError: (state, action: PayloadAction<{ hasError: boolean; message?: string }>) => {
      state.hasError = action.payload.hasError
      state.errorMessage = action.payload.message || null
    },
    clearError: (state) => {
      state.hasError = false
      state.errorMessage = null
    },

    // Reset UI state
    resetUIState: () => {
      return initialState
    },
  },
})

// Export actions
export const {
  setGlobalLoading,
  setSidebarOpen,
  setSidebarCollapsed,
  toggleSidebar,
  toggleSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  removeModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setTheme,
  setLayoutDensity,
  setGlobalSearchOpen,
  setGlobalSearchQuery,
  toggleGlobalSearch,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
  setPageTitle,
  setError,
  clearError,
  resetUIState,
} = uiSlice.actions

// Export selectors
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed
export const selectModals = (state: { ui: UIState }) => state.ui.modals
export const selectModalById = (id: string) => (state: { ui: UIState }) => 
  state.ui.modals.find(m => m.id === id)
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectLayoutDensity = (state: { ui: UIState }) => state.ui.layoutDensity
export const selectGlobalSearchOpen = (state: { ui: UIState }) => state.ui.globalSearchOpen
export const selectGlobalSearchQuery = (state: { ui: UIState }) => state.ui.globalSearchQuery
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle
export const selectHasError = (state: { ui: UIState }) => state.ui.hasError
export const selectErrorMessage = (state: { ui: UIState }) => state.ui.errorMessage

// Export reducer
export default uiSlice.reducer
