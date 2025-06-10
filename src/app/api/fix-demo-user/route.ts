import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    console.log('Fixing demo user...')

    // Use service role key to fix the demo user
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

    // First, find the demo user
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
        message: 'Demo user not found'
      }, { status: 404 })
    }

    console.log('Found demo user:', demoUser.email, 'ID:', demoUser.id)
    console.log('Email confirmed:', !!demoUser.email_confirmed_at)

    // Update the demo user to ensure email is confirmed and password is correct
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      demoUser.id,
      {
        password: 'demo123',
        email_confirm: true,
        user_metadata: {
          name: 'Demo Admin',
          role: 'admin'
        }
      }
    )

    if (updateError) {
      console.error('Error updating demo user:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 400 })
    }

    console.log('Demo user updated successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Demo user fixed successfully',
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        email_confirmed_at: updateData.user.email_confirmed_at,
        user_metadata: updateData.user.user_metadata
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
