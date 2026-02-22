'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TakenCourse {
  id: number
  code: string
  title: string
}

interface TranscriptContextValue {
  takenCourseIds: number[]
  takenCourses: TakenCourse[]
  setTakenData: (ids: number[], courses: TakenCourse[]) => void
  clearTranscript: () => void
}

const TranscriptContext = createContext<TranscriptContextValue>({
  takenCourseIds: [],
  takenCourses: [],
  setTakenData: () => {},
  clearTranscript: () => {},
})

const STORAGE_KEY = 'ucsd_taken_courses'

export function TranscriptProvider({ children }: { children: React.ReactNode }) {
  const [takenCourseIds, setTakenCourseIds] = useState<number[]>([])
  const [takenCourses, setTakenCourses] = useState<TakenCourse[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { ids, courses } = JSON.parse(stored)
        setTakenCourseIds(ids ?? [])
        setTakenCourses(courses ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  const setTakenData = (ids: number[], courses: TakenCourse[]) => {
    setTakenCourseIds(ids)
    setTakenCourses(courses)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, courses }))
  }

  const clearTranscript = () => {
    setTakenCourseIds([])
    setTakenCourses([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <TranscriptContext.Provider value={{ takenCourseIds, takenCourses, setTakenData, clearTranscript }}>
      {children}
    </TranscriptContext.Provider>
  )
}

export function useTranscript() {
  return useContext(TranscriptContext)
}
