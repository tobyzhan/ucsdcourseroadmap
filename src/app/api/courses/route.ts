import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const majorId = searchParams.get('majorId')
    
    if (!query && !majorId) {
      return NextResponse.json({ courses: [] })
    }

    let courses

    if (majorId) {
      // Get courses for a specific major
      courses = await prisma.course.findMany({
        where: {
          majorRequirements: {
            some: {
              majorId: parseInt(majorId),
            },
          },
        },
        include: {
          _count: {
            select: {
              prereqsFor: true,
              isPrereqFor: true,
            },
          },
        },
        orderBy: [
          { dept: 'asc' },
          { number: 'asc' },
        ],
      })
    } else {
      // Search by dept and/or number and/or title
      const searchTerms = query.trim().split(/\s+/)
      const deptPattern = searchTerms[0]?.toUpperCase()
      const numberPattern = searchTerms[1]
      
      courses = await prisma.course.findMany({
        where: {
          OR: [
            {
              AND: [
                { dept: { contains: deptPattern, mode: 'insensitive' } },
                numberPattern
                  ? { number: { contains: numberPattern, mode: 'insensitive' } }
                  : {},
              ],
            },
            {
              title: { contains: query, mode: 'insensitive' },
            },
          ],
        },
        include: {
          _count: {
            select: {
              prereqsFor: true,
              isPrereqFor: true,
            },
          },
        },
        take: 50,
        orderBy: [
          { dept: 'asc' },
          { number: 'asc' },
        ],
      })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Course search error:', error)
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    )
  }
}
