import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    console.log('Creating demo user...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Use service role key to bypass RLS and email confirmation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // First, check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({
        success: false,
        error: `Failed to check existing users: ${listError.message}`
      }, { status: 400 })
    }

    const existingUser = existingUsers.users.find(user => user.email === 'demo@admin.com')

    if (existingUser) {
      console.log('Demo user already exists:', existingUser.email)
      return NextResponse.json({
        success: true,
        message: 'Demo user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email
        }
      })
    }

    // Create demo user with admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'demo@admin.com',
      password: 'demo123',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: 'Demo Admin',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating demo user:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    console.log('Demo user created successfully:', data.user?.email)

    return NextResponse.json({
      success: true,
      message: 'Demo user created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
