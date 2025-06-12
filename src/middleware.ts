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
  try {
    // Skip middleware for static files and API routes
    if (
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.includes('.') ||
      request.nextUrl.pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    // Update the user session
    const supabaseResponse = await updateSession(request)

    // Only check authentication for admin routes (already filtered by matcher)
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables')
        return NextResponse.next()
      }

      // Create a Supabase client to check authentication
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  } catch (error) {
    // If there's an error with middleware, log it and continue
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match only admin routes that need protection
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth pages (allow access to login/register)
     * - api routes (handle auth separately)
     * - root path (/) and other public pages
     * - test pages
     */
    '/admin/:path*',
  ],
}
