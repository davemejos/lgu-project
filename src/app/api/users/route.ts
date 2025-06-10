import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log(`[API] GET /api/users - Page: ${page}, Limit: ${limit}, Search: "${search}", Status: "${status}"`)

    // Use the new database service with built-in filtering and pagination
    const users = await db.getAllUsers({
      page,
      limit,
      search: search || undefined,
      status: status || undefined
    })

    // Get total count for pagination (without pagination applied)
    const allUsers = await db.getAllUsers({
      search: search || undefined,
      status: status || undefined
    })

    return NextResponse.json({
      users: users,
      pagination: {
        page,
        limit,
        total: allUsers.length,
        pages: Math.ceil(allUsers.length / limit)
      }
    })
  } catch (error) {
    console.error('[API] Error fetching users:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Note: User creation should be handled through Supabase Auth registration
    // This endpoint is for updating user profile information only
    return NextResponse.json({
      error: 'User creation should be done through /auth/register endpoint'
    }, { status: 400 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
