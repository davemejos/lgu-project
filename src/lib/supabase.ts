import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkolpgpmdculqqfqyzaf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrb2xwZ3BtZGN1bHFxZnF5emFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODE5ODcsImV4cCI6MjA2NTA1Nzk4N30.MRwyyo6wLKs2HWa4tQdfBPEq3mDee19lckU3MnVyWhU'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrb2xwZ3BtZGN1bHFxZnF5emFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4MTk4NywiZXhwIjoyMDY1MDU3OTg3fQ.k4XWhiD9cbiJxN7s4ZPQYYCZAcXbLw8xIc3k4R4ROv0'

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  })
}

// Client for browser/client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get server-side client
export const getSupabaseServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Connection test function
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = relation does not exist (expected if no tables)
      throw error
    }
    
    return { success: true, message: 'Connected to Supabase successfully!' }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return { 
      success: false, 
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
