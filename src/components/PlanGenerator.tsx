'use client'

import { useState } from 'react'
import { GeneratePlanRequest, GeneratePlanResponse } from '@/types/api'

export function PlanGenerator({ courseId, courseTitle }: { courseId: number; courseTitle: string }) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<GeneratePlanResponse | null>(null)
  const [targetTerm, setTargetTerm] = useState('Spring')
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 2)

  const handleGeneratePlan = async () => {
    setLoading(true)
    try {
      const request: GeneratePlanRequest = {
        targetCourseId: courseId,
        targetTerm,
        targetYear,
        takenCourseIds: [], // In a real app, this would come from user data
        maxUnitsPerQuarter: 16,
      }

      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const data = await res.json()
      setPlan(data)
    } catch (error) {
      console.error('Failed to generate plan:', error)
      alert('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Term
          </label>
          <select
            value={targetTerm}
            onChange={(e) => setTargetTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Year
          </label>
          <input
            type="number"
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 10}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="mt-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">Plan Summary</h4>
            <p className="text-gray-700">
              Total: {plan.totalQuarters} quarters, {plan.totalUnits} units
            </p>
            <p className="text-gray-600 text-sm">
              You'll be ready to take {courseTitle} by {targetTerm} {targetYear}
            </p>
          </div>

          <div className="space-y-4">
            {plan.plan.map((quarter, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  {quarter.term} {quarter.year} - {quarter.totalUnits} units
                </h5>
                <ul className="space-y-1">
                  {quarter.courses.map((course) => (
                    <li key={course.id} className="text-gray-700">
                      <span className="font-medium">
                        {course.dept} {course.number}
                      </span>{' '}
                      - {course.title} ({course.unitsMax} units)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
