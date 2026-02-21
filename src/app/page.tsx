import Link from 'next/link'
import { CourseSearch } from '@/components/CourseSearch'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              UCSD Course Roadmap
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Plan your path to graduation with intelligent prerequisite mapping
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/majors"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse by Major
              </Link>
              <Link
                href="/roadmap"
                className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Build Custom Plan
              </Link>
            </div>
          </div>

          {/* Course Search */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Search for a Course
            </h2>
            <p className="text-gray-600 mb-6">
              Enter a course code (e.g., "MATH 180A") or title to view prerequisites and plan your roadmap
            </p>
            <CourseSearch />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-3xl mb-3">🗺️</div>
              <h3 className="text-lg font-semibold mb-2">Prerequisite Mapping</h3>
              <p className="text-gray-600">
                Visualize the complete prerequisite tree for any course using advanced graph algorithms
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-3xl mb-3">📅</div>
              <h3 className="text-lg font-semibold mb-2">Quarter Planning</h3>
              <p className="text-gray-600">
                Generate optimal quarter-by-quarter schedules with topological sorting
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Major Requirements</h3>
              <p className="text-gray-600">
                Track progress toward your major and plan your path to graduation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
