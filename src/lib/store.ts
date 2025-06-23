/**
 * Redux Store Configuration
 * 
 * This file configures the Redux store with Redux Toolkit, including:
 * - Store setup with proper middleware
 * - Root reducer configuration
 * - TypeScript types for the store
 * - Redux DevTools integration
 */

import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// Import reducers (will be created next)
import authReducer from './redux/slices/authSlice'
import personnelReducer from './redux/slices/personnelSlice'
import usersReducer from './redux/slices/usersSlice'
import uiReducer from './redux/slices/uiSlice'
import settingsReducer from './redux/slices/settingsSlice'
import mediaReducer from './redux/slices/mediaSlice'


// Configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    personnel: personnelReducer,
    users: usersReducer,
    ui: uiReducer,
    settings: settingsReducer,
    media: mediaReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Export store types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Export store instance
export default store
