import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PrereqGraph } from '@/components/PrereqGraph'
import { PlanGenerator } from '@/components/PlanGenerator'
import Link from 'next/link'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const courseId = parseInt(id)

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      prereqsFor: {
        include: {
          prereqCourse: true,
        },
      },
      isPrereqFor: {
        include: {
          course: true,
        },
      },
      majorRequirements: {
        include: {
          major: true,
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {course.dept} {course.number}
            </h1>
            <h2 className="text-2xl text-gray-700 mb-4">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                {course.unitsMin}-{course.unitsMax} Units
              </span>
              {course.majorRequirements.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                  Required for: {course.majorRequirements.map((r: any) => r.major.name).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prerequisites Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Direct Prerequisites</h3>
            {course.prereqsFor.length > 0 ? (
              <ul className="space-y-2">
                {course.prereqsFor.map((edge: any) => (
                  <li key={edge.id}>
                    <Link
                      href={`/course/${edge.prereqCourse.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {edge.prereqCourse.dept} {edge.prereqCourse.number} - {edge.prereqCourse.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No prerequisites</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">This Course Unlocks</h3>
            {course.isPrereqFor.length > 0 ? (
              <ul className="space-y-2">
                {course.isPrereqFor.slice(0, 5).map((edge: any) => (
                  <li key={edge.id}>
                    <Link
                      href={`/course/${edge.course.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {edge.course.dept} {edge.course.number} - {edge.course.title}
                    </Link>
                  </li>
                ))}
                {course.isPrereqFor.length > 5 && (
                  <li className="text-gray-600 text-sm">
                    +{course.isPrereqFor.length - 5} more courses
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-gray-600">This is not a prerequisite for other courses</p>
            )}
          </div>
        </div>

        {/* Prerequisite Graph */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Complete Prerequisite Tree</h3>
          <p className="text-gray-600 mb-4">
            All courses you need to take before {course.dept} {course.number}
          </p>
          <PrereqGraph courseId={courseId} />
        </div>

        {/* Plan Generator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Generate Your Roadmap</h3>
          <p className="text-gray-600 mb-4">
            Create a quarter-by-quarter plan to reach this course
          </p>
          <PlanGenerator courseId={courseId} courseTitle={`${course.dept} ${course.number}`} />
        </div>
      </div>
    </div>
  )
}
