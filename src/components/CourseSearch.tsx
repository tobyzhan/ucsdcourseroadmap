'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  dept: string
  number: string
  title: string
  unitsMin: number
  unitsMax: number
  _count?: {
    prereqsFor: number
    isPrereqFor: number
  }
}

export function CourseSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/courses?query=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data.courses || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (courseId: number) => {
    router.push(`/course/${courseId}`)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="e.g., MATH 180A or Linear Algebra"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((course) => (
            <button
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-gray-900">
                {course.dept} {course.number}
              </div>
              <div className="text-sm text-gray-600">{course.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {course.unitsMin}-{course.unitsMax} units
                {course._count && (
                  <span className="ml-3">
                    {course._count.prereqsFor} prerequisites
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-600">
          No courses found for "{query}"
        </div>
      )}
    </div>
  )
}
