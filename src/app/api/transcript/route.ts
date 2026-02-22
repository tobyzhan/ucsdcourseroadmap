import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as pdfParseModule from 'pdf-parse'
// pdf-parse may export as default or named depending on bundler
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  (pdfParseModule as any).default ?? (pdfParseModule as any)

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

    // Extract raw text from PDF
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    // Fetch all courses from DB to match against
    const allCourses = await prisma.course.findMany({
      select: { id: true, dept: true, number: true, title: true },
    })

    // Build regex patterns: match "DEPT NUMBER" e.g. "MATH 20A", "CSE 101"
    // UCSD transcripts typically show them as "MATH  20A" or "MATH 20A"
    const matchedCourseIds: number[] = []
    const matchedCourses: Array<{ id: number; code: string; title: string }> = []

    for (const course of allCourses) {
      // Allow variable whitespace between dept and number (transcripts sometimes double-space)
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
