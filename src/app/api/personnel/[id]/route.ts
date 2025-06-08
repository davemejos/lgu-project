import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personnel = await prisma.personnel.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        documents: true
      }
    })

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePersonnelSchema.parse(body)

    // Check if personnel exists
    const existingPersonnel = await prisma.personnel.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingPersonnel.email) {
      const emailTaken = await prisma.personnel.findUnique({
        where: { email: validatedData.email }
      })

      if (emailTaken) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 })
      }
    }

    const personnel = await prisma.personnel.update({
      where: { id: parseInt(params.id) },
      data: validatedData,
      include: {
        documents: true
      }
    })

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingPersonnel = await prisma.personnel.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 })
    }

    await prisma.personnel.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Personnel deleted successfully' })
  } catch (error) {
    console.error('Error deleting personnel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
