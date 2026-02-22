'use client'

import { useRef, useState } from 'react'
import { useTranscript } from '@/context/TranscriptContext'

export function TranscriptUpload() {
  const { takenCourses, setTakenData, clearTranscript } = useTranscript()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showCourses, setShowCourses] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('transcript', file)

    try {
      const res = await fetch('/api/transcript', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to parse transcript.')
        return
      }

      setTakenData(data.takenCourseIds, data.takenCourses)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // Already has data — show summary state
  if (takenCourses.length > 0) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-semibold text-green-800">
                Transcript loaded — {takenCourses.length} course{takenCourses.length !== 1 ? 's' : ''} detected
              </p>
              <p className="text-sm text-green-700">
                Completed courses are marked with ✓ in search results and the prerequisite graph
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCourses(v => !v)}
              className="px-3 py-1 text-sm text-green-700 border border-green-400 rounded-lg hover:bg-green-100 transition-colors"
            >
              {showCourses ? 'Hide' : 'View'} courses
            </button>
            <button
              onClick={clearTranscript}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {showCourses && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {takenCourses.map(c => (
              <div key={c.id} className="flex items-center gap-1 bg-white border border-green-200 rounded-lg px-2 py-1">
                <span className="text-green-500 text-sm font-bold">✓</span>
                <span className="text-xs text-gray-800 font-medium">{c.code}</span>
              </div>
            ))}
          </div>
        )}

        {/* Re-upload button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 text-sm text-green-700 underline hover:text-green-900"
        >
          Upload a different transcript
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }} />
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
            <p className="text-blue-600 font-medium">Parsing your transcript…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">📄</span>
            <p className="text-gray-700 font-medium">
              Drop your unofficial transcript PDF here
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">
              Detects completed courses automatically — works with UCSD unofficial transcripts
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
