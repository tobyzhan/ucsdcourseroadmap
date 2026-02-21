import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const majors = await prisma.major.findMany({
      include: {
        _count: {
          select: {
            requirements: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ majors })
  } catch (error) {
    console.error('Majors fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch majors' },
      { status: 500 }
    )
  }
}
