import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPersonnelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Suspended']).default('Active'),
  biography: z.string().optional(),
  spouseName: z.string().optional(),
  spouseOccupation: z.string().optional(),
  childrenCount: z.string().optional(),
  emergencyContact: z.string().optional(),
  childrenNames: z.string().optional(),
})

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
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''
    const sort = searchParams.get('sort') || 'name_asc'

    console.log(`[API] GET /api/personnel - Page: ${page}, Limit: ${limit}, Search: "${search}", Department: "${department}", Status: "${status}", Sort: "${sort}"`)

    // Use the new database service with built-in filtering and pagination
    const result = await db.getAllPersonnel(page, limit, {
      search: search || undefined,
      department: department || undefined,
      status: status || undefined,
      sort: sort as 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
    })

    return NextResponse.json({
      personnel: result.data,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('[API] Error fetching personnel:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPersonnelSchema.parse(body)

    const existingPersonnel = await db.findPersonnelByEmail(validatedData.email)

    if (existingPersonnel) {
      return NextResponse.json({ error: 'Personnel with this email already exists' }, { status: 400 })
    }

    const personnel = await db.createPersonnel({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
      profile_photo: validatedData.profilePhoto || null,
      department: validatedData.department,
      position: validatedData.position || null,
      hire_date: validatedData.hireDate || null,
      status: validatedData.status,
      biography: validatedData.biography || null,
      spouse_name: validatedData.spouseName || null,
      spouse_occupation: validatedData.spouseOccupation || null,
      children_count: validatedData.childrenCount || null,
      emergency_contact: validatedData.emergencyContact || null,
      children_names: validatedData.childrenNames || null
    })

    return NextResponse.json(personnel, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
