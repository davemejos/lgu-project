/**
 * Supabase Client for Client Components
 * 
 * This client is used in Client Components that run in the browser.
 * It handles authentication state, session management, and real-time subscriptions.
 * 
 * Usage:
 * ```typescript
 * import { createClient } from '@/utils/supabase/client'
 * 
 * const supabase = createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export a default instance for convenience
export const supabase = createClient()
