// API Types for Course Roadmap

export interface CourseNode {
  id: number
  dept: string
  number: string
  title: string
  unitsMin: number
  unitsMax: number
  description?: string
  depth?: number
}

export interface PrereqEdge {
  courseId: number
  prereqCourseId: number
}

export interface RoadmapResponse {
  targetCourse: CourseNode
  prerequisites: CourseNode[]
  edges: PrereqEdge[]
}

export interface QuarterPlan {
  term: string
  year: number
  courses: CourseNode[]
  totalUnits: number
}

export interface GeneratePlanRequest {
  targetCourseId: number
  targetTerm: string
  targetYear: number
  takenCourseIds: number[]
  maxUnitsPerQuarter?: number
}

export interface GeneratePlanResponse {
  plan: QuarterPlan[]
  totalQuarters: number
  totalUnits: number
}
