/**
 * Supabase Auth Confirmation Route Handler
 * 
 * This route handles email confirmation for new user registrations.
 * When users click the confirmation link in their email, this route
 * exchanges the secure token for an authenticated session.
 */

import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect user to specified redirect URL or admin dashboard
      redirect(next)
    }
  }

  // Redirect the user to an error page with instructions
  redirect('/auth/auth-code-error')
}
