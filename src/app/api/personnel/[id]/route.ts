import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePersonnelSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().optional(),
  department: z.string().min(1, 'Department is required').optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Suspended']).optional(),
  biography: z.string().optional(),
  spouseName: z.string().optional(),
  spouseOccupation: z.string().optional(),
  childrenCount: z.string().optional(),
  emergencyContact: z.string().optional(),
  childrenNames: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const personnel = await db.findPersonnelById(parseInt(id))

    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    return NextResponse.json(personnel)
  } catch (error) {
    console.error('Error fetching personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePersonnelSchema.parse(body)

    // Check if personnel exists
    const existingPersonnel = await db.findPersonnelById(parseInt(id))

    if (!existingPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingPersonnel.email) {
      const emailTaken = await db.findPersonnelByEmail(validatedData.email)

      if (emailTaken) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 })
      }
    }

    const personnel = await db.updatePersonnel(parseInt(id), validatedData)

    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    return NextResponse.json(personnel)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existingPersonnel = await db.findPersonnelById(parseInt(id))

    if (!existingPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    const deleted = await db.deletePersonnel(parseInt(id))

    if (!deleted) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Personnel deleted successfully' })
  } catch (error) {
    console.error('Error deleting personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
