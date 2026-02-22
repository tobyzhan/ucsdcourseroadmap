import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force Node.js runtime — pdf-parse requires Node.js fs/buffer APIs
export const runtime = 'nodejs'

/**
 * POST /api/transcript
 * Accepts a PDF upload, extracts text, matches course codes against the DB.
 * Returns an array of course IDs that appear in the transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('transcript') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamically import pdf-parse/node inside the handler so Turbopack
    // doesn't try to statically bundle it at build time
    const pdfParseModule = await import('pdf-parse/node')
    const pdfParse = pdfParseModule.default ?? (pdfParseModule as any)
    const pdfData = await pdfParse(buffer)
    const text: string = pdfData.text

    // Fetch all courses from DB to match against
    const allCourses = await prisma.course.findMany({
      select: { id: true, dept: true, number: true, title: true },
    })

    // Match "DEPT NUMBER" patterns e.g. "MATH 20A", "CSE 101"
    // Allow 1-4 spaces between dept and number (transcripts sometimes double-space)
    const matchedCourseIds: number[] = []
    const matchedCourses: Array<{ id: number; code: string; title: string }> = []

    for (const course of allCourses) {
      const pattern = new RegExp(
        `\\b${escapeRegex(course.dept)}\\s{1,4}${escapeRegex(course.number)}\\b`,
        'i'
      )
      if (pattern.test(text)) {
        matchedCourseIds.push(course.id)
        matchedCourses.push({
          id: course.id,
          code: `${course.dept} ${course.number}`,
          title: course.title,
        })
      }
    }

    return NextResponse.json({
      takenCourseIds: matchedCourseIds,
      takenCourses: matchedCourses,
      totalFound: matchedCourses.length,
    })
  } catch (error) {
    console.error('Transcript parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse transcript' },
      { status: 500 }
    )
  }
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
