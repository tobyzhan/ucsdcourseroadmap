// API Types for Course Roadmap

export interface CourseNode {
  id: number
  dept: string
  number: string
  title: string
  unitsMin: number
  unitsMax: number
  difficulty: number   // 1–10
  workload: number     // 1–10
  typicalTerms: string[] // e.g. ["FA","WI","SP"]
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

export interface QuarterTotals {
  units: number
  difficulty: number
  workload: number
  courseCount: number
  isHeavy: boolean   // true if any constraint is near/over threshold
}

export interface QuarterPlan {
  term: string
  year: number
  courses: CourseNode[]
  totals: QuarterTotals
  // legacy field kept for backwards compat
  totalUnits: number
}

export interface PlanExplanation {
  blockers: string[]       // reasons something couldn't be scheduled
  suggestions: string[]    // actionable advice
  warnings: string[]       // soft warnings (e.g. heavy quarter)
}

export interface GeneratePlanRequest {
  targetCourseId: number
  targetTerm: string
  targetYear: number
  takenCourseIds: number[]
  maxUnitsPerQuarter?: number       // default 16
  maxDifficultyPerQuarter?: number  // default 24
  maxCoursesPerQuarter?: number     // default 4
}

export interface GeneratePlanResponse {
  plan: QuarterPlan[]
  totalQuarters: number
  totalUnits: number
  unscheduled: CourseNode[]
  explanation: PlanExplanation
}
