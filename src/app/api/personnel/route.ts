import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
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

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { department: { contains: search, mode: 'insensitive' as const } },
            { position: { contains: search, mode: 'insensitive' as const } },
            { status: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [personnel, total] = await Promise.all([
      prisma.personnel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: true
        }
      }),
      prisma.personnel.count({ where })
    ])

    return NextResponse.json({
      personnel,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
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

    const existingPersonnel = await prisma.personnel.findUnique({
      where: { email: validatedData.email }
    })

    if (existingPersonnel) {
      return NextResponse.json({ error: 'Personnel with this email already exists' }, { status: 400 })
    }

    const personnel = await prisma.personnel.create({
      data: validatedData,
      include: {
        documents: true
      }
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
