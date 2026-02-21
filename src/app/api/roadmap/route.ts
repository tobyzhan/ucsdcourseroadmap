import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RoadmapResponse, CourseNode, PrereqEdge } from '@/types/api'

/**
 * GET /api/roadmap?courseId=123
 * Returns the prerequisite tree for a target course using recursive SQL CTE
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseIdParam = searchParams.get('courseId')
    
    if (!courseIdParam) {
      return NextResponse.json(
        { error: 'courseId parameter is required' },
        { status: 400 }
      )
    }

    const courseId = parseInt(courseIdParam)

    // Get the target course
    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!targetCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Use recursive CTE to get all prerequisite courses
    // This is the SQL magic that does graph traversal!
    const prereqResult = await prisma.$queryRaw<
      Array<{
        course_id: number
        prereq_course_id: number
        depth: number
      }>
    >`
      WITH RECURSIVE prereqs AS (
        -- Base case: direct prerequisites of the target course
        SELECT 
          course_id,
          prereq_course_id,
          1 AS depth
        FROM course_prereq_edges
        WHERE course_id = ${courseId}

        UNION ALL

        -- Recursive case: prerequisites of prerequisites
        SELECT 
          e.course_id,
          e.prereq_course_id,
          p.depth + 1
        FROM course_prereq_edges e
        INNER JOIN prereqs p ON e.course_id = p.prereq_course_id
      )
      SELECT * FROM prereqs
      ORDER BY depth ASC;
    `

    // Extract unique course IDs
    const prereqCourseIds = new Set<number>()
    prereqResult.forEach((row: { course_id: number; prereq_course_id: number; depth: number }) => {
      prereqCourseIds.add(row.course_id)
      prereqCourseIds.add(row.prereq_course_id)
    })

    // Fetch course details for all prerequisite courses
    const prerequisiteCourses = await prisma.course.findMany({
      where: {
        id: { in: Array.from(prereqCourseIds) },
      },
    })

    // Create a map for quick lookup
    const courseMap = new Map<number, CourseNode>()
    prerequisiteCourses.forEach((course: any) => {
      courseMap.set(course.id, {
        id: course.id,
        dept: course.dept,
        number: course.number,
        title: course.title,
        unitsMin: course.unitsMin,
        unitsMax: course.unitsMax,
        description: course.description || undefined,
      })
    })

    // Add depth information
    const depthMap = new Map<number, number>()
    prereqResult.forEach((row: { course_id: number; prereq_course_id: number; depth: number }) => {
      const currentDepth = depthMap.get(row.prereq_course_id) || 0
      depthMap.set(row.prereq_course_id, Math.max(currentDepth, row.depth))
    })
    depthMap.set(courseId, 0)

    // Apply depth to nodes
    courseMap.forEach((node, id) => {
      node.depth = depthMap.get(id) || 0
    })

    // Build edges array
    const edges: PrereqEdge[] = prereqResult.map((row: { course_id: number; prereq_course_id: number; depth: number }) => ({
      courseId: row.course_id,
      prereqCourseId: row.prereq_course_id,
    }))

    const response: RoadmapResponse = {
      targetCourse: {
        id: targetCourse.id,
        dept: targetCourse.dept,
        number: targetCourse.number,
        title: targetCourse.title,
        unitsMin: targetCourse.unitsMin,
        unitsMax: targetCourse.unitsMax,
        description: targetCourse.description || undefined,
        depth: 0,
      },
      prerequisites: Array.from(courseMap.values()).filter(c => c.id !== courseId),
      edges,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
