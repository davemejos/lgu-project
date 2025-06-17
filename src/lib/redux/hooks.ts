/**
 * Redux Custom Hooks
 * 
 * This file provides custom hooks for common Redux operations:
 * - Typed hooks for dispatch and selector
 * - Convenience hooks for specific slices
 * - Composite hooks for complex operations
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store'

// Auth hooks
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
  signInWithPassword,
  signOut,
  signUp,
  clearAuthError,
} from './slices/authSlice'

// Personnel hooks
import {
  selectPersonnelList,
  selectSelectedPersonnel,
  selectPersonnelPagination,
  selectPersonnelFilters,
  selectPersonnelViewMode,
  selectPersonnelLoading,
  selectPersonnelOperationLoading,
  selectPersonnelError,
  fetchPersonnel,
  fetchPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  setSelectedPersonnel,
  setFilters,
  setPagination,
  setViewMode,
  clearPersonnelError,
  type Personnel,
  type PersonnelFilters,
  type PaginationInfo,
} from './slices/personnelSlice'

// Users hooks
import {
  selectUsers,
  selectSelectedUser,
  selectUsersPagination,
  selectUsersFilters,
  selectUsersLoading,
  selectUsersOperationLoading,
  selectUsersError,
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  setUsersFilters,
  setUsersPagination,
  clearUsersError,
  type AppUser,
  type UsersFilters,
  type UsersPaginationInfo,
} from './slices/usersSlice'

// UI hooks
import {
  selectGlobalLoading,
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectModals,

  selectNotifications,
  selectTheme,
  selectLayoutDensity,
  selectGlobalSearchOpen,
  selectGlobalSearchQuery,
  selectBreadcrumbs,
  selectPageTitle,
  selectHasError,
  selectErrorMessage,
  setGlobalLoading,
  setSidebarOpen,
  setSidebarCollapsed,
  toggleSidebar,
  toggleSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setTheme,
  setLayoutDensity,
  setGlobalSearchOpen,
  setGlobalSearchQuery,
  toggleGlobalSearch,
  setBreadcrumbs,
  setPageTitle,
  setError,
  clearError,
  type Modal,
  type Notification,
} from './slices/uiSlice'

// Settings hooks
import {
  selectUserPreferences,
  selectSystemSettings,
  selectFeatureFlags,
  selectSettingsLoading,
  selectSettingsError,
  selectFeatureFlag,
  loadSettings,
  saveUserPreferences,
  saveSystemSettings,
  updateFeatureFlags,
  setUserPreferences,
  setSystemSettings,
  setFeatureFlags,
  toggleFeatureFlag,
  clearSettingsError,
  type UserPreferences,
  type SystemSettings,
  type FeatureFlags,
} from './slices/settingsSlice'

// =============================================================================
// AUTH HOOKS
// =============================================================================

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const initialized = useAppSelector(selectAuthInitialized)

  const signIn = useCallback(
    (email: string, password: string) => {
      return dispatch(signInWithPassword({ email, password }))
    },
    [dispatch]
  )

  const signOutUser = useCallback(() => {
    return dispatch(signOut())
  }, [dispatch])

  const signUpUser = useCallback(
    (email: string, password: string, metadata?: Record<string, unknown>) => {
      return dispatch(signUp({ email, password, metadata }))
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  return {
    auth,
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    signIn,
    signOut: signOutUser,
    signUp: signUpUser,
    clearError,
  }
}

// =============================================================================
// PERSONNEL HOOKS
// =============================================================================

export const usePersonnel = () => {
  const dispatch = useAppDispatch()
  const personnel = useAppSelector(selectPersonnelList)
  const selectedPersonnel = useAppSelector(selectSelectedPersonnel)
  const pagination = useAppSelector(selectPersonnelPagination)
  const filters = useAppSelector(selectPersonnelFilters)
  const viewMode = useAppSelector(selectPersonnelViewMode)
  const loading = useAppSelector(selectPersonnelLoading)
  const operationLoading = useAppSelector(selectPersonnelOperationLoading)
  const error = useAppSelector(selectPersonnelError)

  const fetchPersonnelList = useCallback(
    (params: { page?: number; limit?: number; search?: string; sortBy?: string } = {}) => {
      return dispatch(fetchPersonnel(params))
    },
    [dispatch]
  )

  const fetchPersonnelDetails = useCallback(
    (id: number) => {
      return dispatch(fetchPersonnelById(id))
    },
    [dispatch]
  )

  const createNewPersonnel = useCallback(
    (personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) => {
      return dispatch(createPersonnel(personnelData))
    },
    [dispatch]
  )

  const updatePersonnelData = useCallback(
    (personnelData: Partial<Personnel> & { id: number }) => {
      return dispatch(updatePersonnel(personnelData))
    },
    [dispatch]
  )

  const deletePersonnelData = useCallback(
    (id: number) => {
      return dispatch(deletePersonnel(id))
    },
    [dispatch]
  )

  const selectPersonnelItem = useCallback(
    (personnel: Personnel | null) => {
      dispatch(setSelectedPersonnel(personnel))
    },
    [dispatch]
  )

  const updateFilters = useCallback(
    (newFilters: Partial<PersonnelFilters>) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  const updatePagination = useCallback(
    (newPagination: Partial<PaginationInfo>) => {
      dispatch(setPagination(newPagination))
    },
    [dispatch]
  )

  const updateViewMode = useCallback(
    (mode: 'list' | 'cards') => {
      dispatch(setViewMode(mode))
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearPersonnelError())
  }, [dispatch])

  return {
    personnel,
    selectedPersonnel,
    pagination,
    filters,
    viewMode,
    loading,
    operationLoading,
    error,
    fetchPersonnelList,
    fetchPersonnelDetails,
    createNewPersonnel,
    updatePersonnelData,
    deletePersonnelData,
    selectPersonnel: selectPersonnelItem,
    updateFilters,
    updatePagination,
    updateViewMode,
    clearError,
  }
}

// =============================================================================
// USERS HOOKS
// =============================================================================

export const useUsers = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const selectedUser = useAppSelector(selectSelectedUser)
  const pagination = useAppSelector(selectUsersPagination)
  const filters = useAppSelector(selectUsersFilters)
  const loading = useAppSelector(selectUsersLoading)
  const operationLoading = useAppSelector(selectUsersOperationLoading)
  const error = useAppSelector(selectUsersError)

  const fetchUsersList = useCallback(
    (params: {
      page?: number
      limit?: number
      search?: string
      sortBy?: string
      role?: string
      status?: string
    } = {}) => {
      return dispatch(fetchUsers(params))
    },
    [dispatch]
  )

  const fetchUserDetails = useCallback(
    (id: number) => {
      return dispatch(fetchUserById(id))
    },
    [dispatch]
  )

  const createNewUser = useCallback(
    (userData: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>) => {
      return dispatch(createUser(userData))
    },
    [dispatch]
  )

  const updateUserData = useCallback(
    (userData: Partial<AppUser> & { id: number }) => {
      return dispatch(updateUser(userData))
    },
    [dispatch]
  )

  const deleteUserData = useCallback(
    (id: number) => {
      return dispatch(deleteUser(id))
    },
    [dispatch]
  )

  const selectUser = useCallback(
    (user: AppUser | null) => {
      dispatch(setSelectedUser(user))
    },
    [dispatch]
  )

  const updateFilters = useCallback(
    (newFilters: Partial<UsersFilters>) => {
      dispatch(setUsersFilters(newFilters))
    },
    [dispatch]
  )

  const updatePagination = useCallback(
    (newPagination: Partial<UsersPaginationInfo>) => {
      dispatch(setUsersPagination(newPagination))
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearUsersError())
  }, [dispatch])

  return {
    users,
    selectedUser,
    pagination,
    filters,
    loading,
    operationLoading,
    error,
    fetchUsersList,
    fetchUserDetails,
    createNewUser,
    updateUserData,
    deleteUserData,
    selectUser,
    updateFilters,
    updatePagination,
    clearError,
  }
}

// =============================================================================
// UI HOOKS
// =============================================================================

export const useUI = () => {
  const dispatch = useAppDispatch()
  const globalLoading = useAppSelector(selectGlobalLoading)
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed)
  const modals = useAppSelector(selectModals)
  const notifications = useAppSelector(selectNotifications)
  const theme = useAppSelector(selectTheme)
  const layoutDensity = useAppSelector(selectLayoutDensity)
  const globalSearchOpen = useAppSelector(selectGlobalSearchOpen)
  const globalSearchQuery = useAppSelector(selectGlobalSearchQuery)
  const breadcrumbs = useAppSelector(selectBreadcrumbs)
  const pageTitle = useAppSelector(selectPageTitle)
  const hasError = useAppSelector(selectHasError)
  const errorMessage = useAppSelector(selectErrorMessage)

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch(setGlobalLoading(loading))
    },
    [dispatch]
  )

  const setSidebar = useCallback(
    (open: boolean) => {
      dispatch(setSidebarOpen(open))
    },
    [dispatch]
  )

  const setSidebarCollapse = useCallback(
    (collapsed: boolean) => {
      dispatch(setSidebarCollapsed(collapsed))
    },
    [dispatch]
  )

  const toggleSidebarState = useCallback(() => {
    dispatch(toggleSidebar())
  }, [dispatch])

  const toggleSidebarCollapse = useCallback(() => {
    dispatch(toggleSidebarCollapsed())
  }, [dispatch])

  const showModal = useCallback(
    (modal: Omit<Modal, 'isOpen'>) => {
      dispatch(openModal(modal))
    },
    [dispatch]
  )

  const hideModal = useCallback(
    (id: string) => {
      dispatch(closeModal(id))
    },
    [dispatch]
  )

  const hideAllModals = useCallback(() => {
    dispatch(closeAllModals())
  }, [dispatch])

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      dispatch(addNotification(notification))
    },
    [dispatch]
  )

  const hideNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id))
    },
    [dispatch]
  )

  const clearNotifications = useCallback(() => {
    dispatch(clearAllNotifications())
  }, [dispatch])

  const changeTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      dispatch(setTheme(newTheme))
    },
    [dispatch]
  )

  const changeDensity = useCallback(
    (density: 'comfortable' | 'compact' | 'spacious') => {
      dispatch(setLayoutDensity(density))
    },
    [dispatch]
  )

  const setGlobalSearch = useCallback(
    (open: boolean) => {
      dispatch(setGlobalSearchOpen(open))
    },
    [dispatch]
  )

  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch(setGlobalSearchQuery(query))
    },
    [dispatch]
  )

  const toggleSearch = useCallback(() => {
    dispatch(toggleGlobalSearch())
  }, [dispatch])

  const updateBreadcrumbs = useCallback(
    (breadcrumbs: Array<{ label: string; href?: string }>) => {
      dispatch(setBreadcrumbs(breadcrumbs))
    },
    [dispatch]
  )

  const updatePageTitle = useCallback(
    (title: string) => {
      dispatch(setPageTitle(title))
    },
    [dispatch]
  )

  const setErrorState = useCallback(
    (hasError: boolean, message?: string) => {
      dispatch(setError({ hasError, message }))
    },
    [dispatch]
  )

  const clearErrorState = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    globalLoading,
    sidebarOpen,
    sidebarCollapsed,
    modals,
    notifications,
    theme,
    layoutDensity,
    globalSearchOpen,
    globalSearchQuery,
    breadcrumbs,
    pageTitle,
    hasError,
    errorMessage,
    setLoading,
    setSidebar,
    setSidebarCollapse,
    toggleSidebarState,
    toggleSidebarCollapse,
    showModal,
    hideModal,
    hideAllModals,
    showNotification,
    hideNotification,
    clearNotifications,
    changeTheme,
    changeDensity,
    setGlobalSearch,
    setSearchQuery,
    toggleSearch,
    updateBreadcrumbs,
    updatePageTitle,
    setErrorState,
    clearErrorState,
  }
}

// =============================================================================
// SETTINGS HOOKS
// =============================================================================

export const useSettings = () => {
  const dispatch = useAppDispatch()
  const userPreferences = useAppSelector(selectUserPreferences)
  const systemSettings = useAppSelector(selectSystemSettings)
  const featureFlags = useAppSelector(selectFeatureFlags)
  const loading = useAppSelector(selectSettingsLoading)
  const error = useAppSelector(selectSettingsError)

  const loadAppSettings = useCallback(() => {
    return dispatch(loadSettings())
  }, [dispatch])

  const savePreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      return dispatch(saveUserPreferences(preferences))
    },
    [dispatch]
  )

  const saveSystemConfig = useCallback(
    (settings: Partial<SystemSettings>) => {
      return dispatch(saveSystemSettings(settings))
    },
    [dispatch]
  )

  const updateFlags = useCallback(
    (flags: Partial<FeatureFlags>) => {
      return dispatch(updateFeatureFlags(flags))
    },
    [dispatch]
  )

  const setPreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      dispatch(setUserPreferences(preferences))
    },
    [dispatch]
  )

  const setSystemConfig = useCallback(
    (settings: Partial<SystemSettings>) => {
      dispatch(setSystemSettings(settings))
    },
    [dispatch]
  )

  const setFlags = useCallback(
    (flags: Partial<FeatureFlags>) => {
      dispatch(setFeatureFlags(flags))
    },
    [dispatch]
  )

  const toggleFlag = useCallback(
    (flag: keyof FeatureFlags) => {
      dispatch(toggleFeatureFlag(flag))
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearSettingsError())
  }, [dispatch])

  return {
    userPreferences,
    systemSettings,
    featureFlags,
    loading,
    error,
    loadAppSettings,
    savePreferences,
    saveSystemConfig,
    updateFlags,
    setPreferences,
    setSystemConfig,
    setFlags,
    toggleFlag,
    clearError,
  }
}

// =============================================================================
// FEATURE FLAG HOOK
// =============================================================================

export const useFeatureFlag = (flag: keyof FeatureFlags) => {
  return useAppSelector(selectFeatureFlag(flag))
}
