// Simple test utilities for Supabase connection
import { supabase } from './supabase'

export const testSupabaseBasicConnection = async () => {
  try {
    // Test 1: Basic connection
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return {
      success: true,
      message: 'Supabase connection successful!',
      hasUserTable: error?.code !== 'PGRST116'
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      hasUserTable: false
    }
  }
}

export const testSupabaseAuth = async () => {
  try {
    // Test authentication status
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      success: true,
      message: 'Auth system working',
      hasSession: !!session,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      message: `Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      hasSession: false,
      error
    }
  }
}

export const getSupabaseStatus = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkolpgpmdculqqfqyzaf.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  
  return {
    url,
    keyLength: key.length,
    usingFallbacks: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    envLoaded: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  }
}
