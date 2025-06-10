/**
 * Supabase Authentication Middleware
 *
 * This middleware handles:
 * 1. Automatic token refresh for authenticated users
 * 2. Route protection for admin pages
 * 3. Session management between server and client
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function middleware(request: NextRequest) {
  // Update the user session
  const supabaseResponse = await updateSession(request)

  // Check if the user is accessing protected admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Create a Supabase client to check authentication
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // If no user is authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth pages (allow access to login/register)
     * - api routes (handle auth separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
