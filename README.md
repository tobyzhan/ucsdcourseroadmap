# UCSD Course Roadmap 🗺️

> ⚠️ **Work in Progress** — This project is actively being developed. Features may be incomplete or change at any time.

A full-stack web application that helps UCSD students visualize prerequisite chains and generate intelligent quarter-by-quarter course plans.

**🔗 Live Demo: [https://ucsdcourseroadmap-5br0mglph-tobyzhans-projects.vercel.app/](https://ucsdcourseroadmap-5br0mglph-tobyzhans-projects.vercel.app/)**

---

## What It Does

- **Search courses** by code (e.g. `MATH 180A`) or title
- **Visualize prerequisite trees** as an interactive graph
- **Generate a quarter plan** that respects prereq ordering, workload limits, and term availability
- **Upload your unofficial transcript** (PDF) to auto-detect completed courses — completed courses are highlighted with a ✓ on the graph and in search results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL (Neon — cloud hosted) |
| ORM | Prisma |
| Graph UI | React Flow |
| Deployment | Vercel |

---

## Current Features

### 🔍 Course Search
- Search by department code or course title
- Results show a green **✓ Completed** badge for courses detected in your transcript

### 🗺️ Prerequisite Graph
- Interactive React Flow graph of the full prerequisite tree
- Color coded nodes:
  - 🔵 Blue — target course
  - 🟢 Green — already completed
  - ⚪ White — still needed

### 📅 Smart Quarter Planner
- Longest-path levelization to determine earliest possible quarter per course
- Parallelism — independent courses are scheduled in the same quarter
- Workload balancing — avoids stacking multiple high-difficulty courses
- Configurable constraints:
  - Max units per quarter (default 16)
  - Max difficulty per quarter (default 24)
  - Max courses per quarter (default 4)
- Term availability awareness (e.g. a course only offered in Fall won't be scheduled in Winter)
- Returns blockers and suggestions when a plan can't be completed

### 📄 Transcript Upload (work in progress)
- Drag-and-drop PDF upload of your UCSD unofficial transcript
- Parses the PDF and matches course codes against the database

---

## Known Limitations

> This is an early version. Here's what's missing or incomplete:

- **Only 30 Math courses** are in the database — the full UCSD catalog has 5,000+
- **Only 1 major** (Mathematics) is supported
- **AND-only prerequisites** — OR logic (e.g. "MATH 20C *or* MATH 31BH"), co-requisites, and grade minimums are not yet supported
- **No user accounts** — transcript data is stored in your browser only (`localStorage`), not on the server
- **No authentication** — Google SSO with `@ucsd.edu` restriction is planned
- **No saved plans** — the database schema supports it but the UI doesn't yet
- **Transcript parsing** works best with text-based PDFs; scanned image transcripts will not parse correctly

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── courses/       # Course search endpoint
│   │   ├── roadmap/       # Recursive CTE prereq expansion
│   │   ├── plan/          # Smart quarter planner
│   │   └── transcript/    # PDF transcript parser
│   ├── course/[id]/       # Course detail page + prereq graph
│   └── page.tsx           # Home page
├── components/
│   ├── CourseSearch.tsx
│   ├── PrereqGraph.tsx
│   ├── PlanGenerator.tsx
│   └── TranscriptUpload.tsx
├── context/
│   └── TranscriptContext.tsx
├── lib/
│   └── planner.ts         # Smart planner algorithm
└── types/
    └── api.ts             # Shared TypeScript types
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Sample data (30 Math courses)
```

---

## Key Algorithms

### Recursive CTE (SQL) — Prerequisite Discovery
```sql
WITH RECURSIVE prereqs AS (
  SELECT course_id, prereq_course_id
  FROM course_prereq_edges
  WHERE course_id = $1

  UNION ALL

  SELECT e.course_id, e.prereq_course_id
  FROM course_prereq_edges e
  JOIN prereqs p ON e.course_id = p.prereq_course_id
)
SELECT * FROM prereqs;
```

### Longest-Path Levelization — Quarter Planner
```
earliest[course] = 1 + max(earliest[prereq] for all prereqs)
```
Courses at the same level have no dependency on each other and can be taken in parallel.

---

## Roadmap (Planned Features)

- [ ] Google OAuth with `@ucsd.edu` restriction
- [ ] Saved plans per user (database-backed)
- [ ] Full UCSD course catalog (all departments)
- [ ] OR prerequisite logic
- [ ] Co-requisite support
- [ ] Quarter offering data (which courses run Fall/Winter/Spring)
- [ ] Multiple major support
- [ ] Mobile-optimized UI

---

## License

MIT
