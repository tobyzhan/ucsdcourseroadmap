/**
 * Smart Quarter Planner
 *
 * Algorithm:
 *  1. Build the prerequisite DAG for the target course (excluding already-taken courses).
 *  2. Compute "earliest possible quarter index" via longest-path (critical-path) analysis.
 *  3. Compute "latest allowed quarter index" so the target lands exactly in targetSlot.
 *  4. Greedily fill quarters using a scored priority queue:
 *       score = w_crit * criticality + w_workload * workloadBalance + w_units * unitsFit
 *  5. Enforce:
 *       - maxUnitsPerQuarter
 *       - maxDifficultyPerQuarter (sum of difficulty scores)
 *       - maxCoursesPerQuarter
 *       - typicalTerms offering constraint (if non-empty)
 *  6. Return rich response: plan, unscheduled courses, and an explanation object.
 */

import type { CourseNode, QuarterPlan, QuarterTotals, PlanExplanation } from '@/types/api'

export interface PlannerInput {
  targetCourseId: number
  targetTerm: string
  targetYear: number
  courses: CourseNode[]           // all courses to schedule (target + its prereqs, already-taken excluded)
  edges: Array<{ from: number; to: number }> // prereq edges within the schedule set
  maxUnitsPerQuarter: number
  maxDifficultyPerQuarter: number
  maxCoursesPerQuarter: number
}

export interface PlannerOutput {
  plan: QuarterPlan[]
  unscheduled: CourseNode[]
  explanation: PlanExplanation
}

const TERMS = ['Fall', 'Winter', 'Spring'] as const
type Term = typeof TERMS[number]

const TERM_CODE: Record<Term, string> = { Fall: 'FA', Winter: 'WI', Spring: 'SP' }

// Quarter index helpers ---------------------------------------------------
function termToIdx(term: string, year: number, baseYear: number): number {
  const ti = TERMS.indexOf(term as Term)
  return (year - baseYear) * 3 + (ti === -1 ? 0 : ti)
}

function idxToQuarter(idx: number, baseYear: number): { term: Term; year: number } {
  const year = baseYear + Math.floor(idx / 3)
  const term = TERMS[idx % 3]
  return { term, year }
}

// -------------------------------------------------------------------------
export function runPlanner(input: PlannerInput): PlannerOutput {
  const {
    targetCourseId,
    targetTerm,
    targetYear,
    courses,
    edges,
    maxUnitsPerQuarter,
    maxDifficultyPerQuarter,
    maxCoursesPerQuarter,
  } = input

  const explanation: PlanExplanation = { blockers: [], suggestions: [], warnings: [] }

  if (courses.length === 0) {
    return {
      plan: [],
      unscheduled: [],
      explanation: {
        blockers: [],
        suggestions: ['All prerequisites are already completed!'],
        warnings: [],
      },
    }
  }

  // Build adjacency structures
  const courseMap = new Map<number, CourseNode>(courses.map(c => [c.id, c]))
  const prereqsOf = new Map<number, Set<number>>()   // course → set of its prereqs
  const dependentsOf = new Map<number, Set<number>>() // course → set of courses that need it

  for (const c of courses) {
    prereqsOf.set(c.id, new Set())
    dependentsOf.set(c.id, new Set())
  }
  for (const { from, to } of edges) {
    prereqsOf.get(to)?.add(from)
    dependentsOf.get(from)?.add(to)
  }

  // ── 1. Critical-path: earliest[id] = minimum quarter index (0-based) ──
  const earliest = new Map<number, number>()
  // Process in topological order via Kahn's
  const inDeg = new Map<number, number>()
  for (const c of courses) inDeg.set(c.id, 0)
  for (const { to } of edges) inDeg.set(to, (inDeg.get(to) ?? 0) + 1)

  let queue: number[] = courses.filter(c => (inDeg.get(c.id) ?? 0) === 0).map(c => c.id)
  for (const id of queue) earliest.set(id, 0)

  const topoOrder: number[] = []
  while (queue.length > 0) {
    const next: number[] = []
    for (const id of queue) {
      topoOrder.push(id)
      for (const dep of dependentsOf.get(id) ?? []) {
        const newEarliest = (earliest.get(id) ?? 0) + 1
        if ((earliest.get(dep) ?? 0) < newEarliest) earliest.set(dep, newEarliest)
        const deg = (inDeg.get(dep) ?? 1) - 1
        inDeg.set(dep, deg)
        if (deg === 0) next.push(dep)
      }
    }
    queue = next
  }

  // Cycle check
  if (topoOrder.length !== courses.length) {
    explanation.blockers.push('Circular dependency detected in prerequisites.')
    return { plan: [], unscheduled: courses, explanation }
  }

  // ── 2. Latest allowed quarter ──
  // targetSlot is the absolute quarter index for the target course
  // Base year is computed from the earliest possible start
  const baseYear = targetYear - Math.floor(termToIdx(targetTerm, targetYear, targetYear) / 3) // simplify: baseYear = targetYear - floored
  // Actually: let base = current year for scheduling; target slot = termToIdx relative to now
  // We use: base = targetYear, but we may need to go before it
  const targetDepth = earliest.get(targetCourseId) ?? 0
  const targetSlotIdx = termToIdx(targetTerm, targetYear, targetYear) // 0 if same year

  // Real base year: we need targetDepth quarters before targetTerm/Year
  // So start at quarter slot (targetSlotIdx - targetDepth) from targetYear
  const startSlotAbsolute = 0 // we'll use relative indices 0..N
  // Compute absolute index of target
  const targetAbsIdx = targetDepth // target is always at its earliest slot since prereqs drive timing

  // Compute latest[id]: latest quarter index before which a course must be scheduled
  // so that the target lands exactly at targetAbsIdx
  const latest = new Map<number, number>()
  // Process in reverse topo order
  latest.set(targetCourseId, targetAbsIdx)
  for (const id of [...topoOrder].reverse()) {
    const lat = latest.get(id) ?? targetAbsIdx
    for (const prereq of prereqsOf.get(id) ?? []) {
      const existing = latest.get(prereq) ?? Infinity
      latest.set(prereq, Math.min(existing, lat - 1))
    }
  }

  // ── 3. Downstream count (criticality heuristic) ──
  const downstreamCount = new Map<number, number>()
  for (const id of [...topoOrder].reverse()) {
    let count = 0
    for (const dep of dependentsOf.get(id) ?? []) {
      count += 1 + (downstreamCount.get(dep) ?? 0)
    }
    downstreamCount.set(id, count)
  }

  // ── 4. Greedy quarter-by-quarter scheduling ──
  const scheduledInQuarter = new Map<number, number>() // courseId → quarterIdx
  const quartersData: Array<{
    courses: CourseNode[]
    units: number
    difficulty: number
    workload: number
  }> = []

  const unscheduled: CourseNode[] = []
  const remaining = new Set<number>(courses.map(c => c.id))

  // Pre-check: offering constraint check
  const offeringBlockers: string[] = []

  let currentQuarterIdx = 0
  const maxQuarters = targetAbsIdx + 5 // safety ceiling

  while (remaining.size > 0 && currentQuarterIdx <= maxQuarters) {
    const qData = quartersData[currentQuarterIdx] ?? { courses: [], units: 0, difficulty: 0, workload: 0 }
    quartersData[currentQuarterIdx] = qData

    const { term } = idxToQuarter(currentQuarterIdx, targetYear - Math.ceil(targetAbsIdx / 3))

    // Available = prereqs all scheduled in strictly earlier quarters
    const available = [...remaining].filter(id => {
      for (const prereq of prereqsOf.get(id) ?? []) {
        const prereqSlot = scheduledInQuarter.get(prereq)
        if (prereqSlot === undefined || prereqSlot >= currentQuarterIdx) return false
      }
      // Must not be scheduled later than its latest slot
      if ((latest.get(id) ?? Infinity) < currentQuarterIdx) return false
      return true
    })

    if (available.length === 0) {
      currentQuarterIdx++
      continue
    }

    // Score each available course
    const scored = available.map(id => {
      const c = courseMap.get(id)!
      const earliestIdx = earliest.get(id) ?? 0
      const latestIdx = latest.get(id) ?? targetAbsIdx
      const slack = latestIdx - currentQuarterIdx // lower = more urgent
      const criticality = (downstreamCount.get(id) ?? 0) + (1 / (slack + 1)) * 10
      // Prefer courses that don't spike difficulty when quarter is already loaded
      const diffLoadFactor = maxDifficultyPerQuarter > 0
        ? 1 - (qData.difficulty + c.difficulty) / maxDifficultyPerQuarter
        : 1
      const score = criticality * 2 + diffLoadFactor * 3
      return { id, score, course: c }
    }).sort((a, b) => b.score - a.score)

    // Offering constraint: filter out courses not offered this term
    const termCode = TERM_CODE[term as Term]

    // Greedily pick courses for this quarter
    for (const { id, course } of scored) {
      if (!remaining.has(id)) continue

      // Offering check
      if (course.typicalTerms.length > 0 && !course.typicalTerms.includes(termCode)) {
        // Don't schedule it this quarter, will retry next quarter
        continue
      }

      // Constraint checks
      if (qData.units + course.unitsMax > maxUnitsPerQuarter) continue
      if (qData.difficulty + course.difficulty > maxDifficultyPerQuarter) continue
      if (qData.courses.length >= maxCoursesPerQuarter) continue

      // Schedule it
      qData.courses.push(course)
      qData.units += course.unitsMax
      qData.difficulty += course.difficulty
      qData.workload += course.workload
      scheduledInQuarter.set(id, currentQuarterIdx)
      remaining.delete(id)
    }

    currentQuarterIdx++
  }

  // Anything still remaining is unscheduled
  for (const id of remaining) {
    const c = courseMap.get(id)
    if (c) {
      unscheduled.push(c)
      // Diagnose why
      const prereqsMissing = [...(prereqsOf.get(id) ?? [])].filter(
        p => scheduledInQuarter.get(p) === undefined && remaining.has(p)
      )
      if (prereqsMissing.length > 0) {
        const names = prereqsMissing.map(p => {
          const pc = courseMap.get(p)
          return pc ? `${pc.dept} ${pc.number}` : String(p)
        })
        explanation.blockers.push(
          `${c.dept} ${c.number} could not be scheduled because its prerequisites are also unscheduled: ${names.join(', ')}.`
        )
      } else {
        explanation.blockers.push(
          `${c.dept} ${c.number} could not fit within the quarter constraints before ${targetTerm} ${targetYear}.`
        )
        explanation.suggestions.push(
          `Try increasing maxCoursesPerQuarter or maxUnitsPerQuarter to fit ${c.dept} ${c.number}.`
        )
      }
    }
  }

  // ── 5. Build final QuarterPlan[] ──
  // Determine calendar base: earliest quarter in the schedule
  const usedIndices = [...scheduledInQuarter.values()]
  const minIdx = usedIndices.length > 0 ? Math.min(...usedIndices) : 0

  // Calendar base: targetYear minus enough years to accommodate minIdx quarters before target
  const targetCalIdx = targetAbsIdx - minIdx  // index of target in output array
  // Translate: slot 0 → some term before targetTerm/Year
  function slotToCalendar(slot: number): { term: Term; year: number } {
    const offset = slot - targetCalIdx
    const targetTermIdx = TERMS.indexOf(targetTerm as Term)
    let ti = targetTermIdx + (offset % 3)
    let yi = targetYear + Math.floor(offset / 3)
    if (ti < 0) { ti += 3; yi-- }
    if (ti >= 3) { ti -= 3; yi++ }
    return { term: TERMS[ti], year: yi }
  }

  const HEAVY_UNIT_THRESHOLD = maxUnitsPerQuarter * 0.85
  const HEAVY_DIFF_THRESHOLD = maxDifficultyPerQuarter * 0.85

  const plan: QuarterPlan[] = []
  for (let i = minIdx; i <= (usedIndices.length > 0 ? Math.max(...usedIndices) : 0); i++) {
    const qData = quartersData[i]
    if (!qData || qData.courses.length === 0) continue
    const { term, year } = slotToCalendar(i)
    const isHeavy = qData.units >= HEAVY_UNIT_THRESHOLD || qData.difficulty >= HEAVY_DIFF_THRESHOLD
    const totals: QuarterTotals = {
      units: qData.units,
      difficulty: qData.difficulty,
      workload: qData.workload,
      courseCount: qData.courses.length,
      isHeavy,
    }
    if (isHeavy) {
      explanation.warnings.push(
        `${term} ${year} is a heavy quarter (${qData.units} units, difficulty sum ${qData.difficulty}). Consider spreading courses if possible.`
      )
    }
    plan.push({ term, year, courses: qData.courses, totals, totalUnits: qData.units })
  }

  if (unscheduled.length === 0 && explanation.blockers.length === 0) {
    explanation.suggestions.push(
      `All ${courses.length} course${courses.length !== 1 ? 's' : ''} scheduled across ${plan.length} quarter${plan.length !== 1 ? 's' : ''}.`
    )
  }

  return { plan, unscheduled, explanation }
}
