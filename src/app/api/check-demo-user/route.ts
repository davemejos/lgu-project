import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Checking demo user status...')

    // Use service role key to check user status
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

    // Get all users and find the demo user
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ 
        success: false, 
        error: listError.message 
      }, { status: 400 })
    }

    const demoUser = users.users.find(user => user.email === 'demo@admin.com')
    
    if (!demoUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Demo user not found',
        totalUsers: users.users.length
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo user found',
      user: {
        id: demoUser.id,
        email: demoUser.email,
        email_confirmed_at: demoUser.email_confirmed_at,
        created_at: demoUser.created_at,
        last_sign_in_at: demoUser.last_sign_in_at,
        user_metadata: demoUser.user_metadata,
        app_metadata: demoUser.app_metadata
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
