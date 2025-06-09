import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const result = await db.getAllPersonnel(page, limit)
    let personnel = result.data

    // Filter by search if provided
    if (search) {
      personnel = personnel.filter(person =>
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.email.toLowerCase().includes(search.toLowerCase()) ||
        person.department.toLowerCase().includes(search.toLowerCase()) ||
        (person.position && person.position.toLowerCase().includes(search.toLowerCase())) ||
        person.status.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      personnel,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('Error fetching personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPersonnelSchema.parse(body)

    const existingPersonnel = await db.findPersonnelByEmail(validatedData.email)

    if (existingPersonnel) {
      return NextResponse.json({ error: 'Personnel with this email already exists' }, { status: 400 })
    }

    const personnel = await db.createPersonnel({
      ...validatedData,
      documents: []
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
