# Development Guide

## 🎯 Your First Development Session

Now that you've set up the project, here's what to do next!

## ✅ Verify Everything Works

### 1. Start the Application
```bash
npm run dev
```

Visit: http://localhost:3000

### 2. Test Course Search
- Type "MATH 180A" in the search box
- Click on "MATH 180A - Introduction to Probability"
- You should see the course detail page

### 3. View Prerequisite Graph
- On the course page, scroll to "Complete Prerequisite Tree"
- You should see an interactive graph showing all prerequisites
- MATH 180A requires MATH 20C and MATH 18
- MATH 20C requires MATH 20B
- MATH 20B requires MATH 20A

### 4. Generate a Plan
- Scroll to "Generate Your Roadmap"
- Click "Generate Plan"
- You should see a quarter-by-quarter schedule

## 🔍 Explore the Code

### Start Here - The Heart of the App

**1. Recursive CTE** (Most Important!)
📍 `src/app/api/roadmap/route.ts`

This is where the magic happens. The recursive SQL query:
```typescript
const prereqResult = await prisma.$queryRaw`
  WITH RECURSIVE prereqs AS (
    SELECT course_id, prereq_course_id, 1 AS depth
    FROM course_prereq_edges
    WHERE course_id = ${courseId}
    
    UNION ALL
    
    SELECT e.course_id, e.prereq_course_id, p.depth + 1
    FROM course_prereq_edges e
    INNER JOIN prereqs p ON e.course_id = p.prereq_course_id
  )
  SELECT * FROM prereqs;
`
```

**What it does**: 
- Starts with direct prerequisites of target course
- Recursively finds prerequisites of those prerequisites
- Returns the entire dependency tree with depth information

**Try changing**: The depth calculation, or add a max depth limit

---

**2. Topological Sort** (Core Algorithm!)
📍 `src/app/api/plan/route.ts`

Look for the `topologicalSort()` function:
```typescript
function topologicalSort(courses, edges) {
  // Build adjacency list
  // Calculate in-degrees (# of prerequisites)
  // Process nodes with no prerequisites first
  // Propagate to dependent courses
}
```

**What it does**: Orders courses so prerequisites always come before dependents

**Try changing**: The chunking logic in `chunkIntoQuarters()`

---

**3. Database Schema**
📍 `prisma/schema.prisma`

The MVP prerequisite model:
```prisma
model CoursePrereqEdge {
  id             Int    @id @default(autoincrement())
  courseId       Int
  prereqCourseId Int
  
  course        Course @relation("CoursePrereqs", ...)
  prereqCourse  Course @relation("PrereqCourse", ...)
}
```

**Try adding**:
- A `required` boolean (for optional vs required prereqs)
- A `group_id` (to support OR prerequisites)

---

## 🛠️ Common Development Tasks

### Add a New Course

Edit `prisma/seed.ts`:

```typescript
const coursesData = [
  // ...existing courses...
  { 
    dept: 'CSE', 
    number: '100', 
    title: 'Advanced Data Structures',
    unitsMin: 4, 
    unitsMax: 4,
    description: 'Advanced data structures and algorithms.'
  },
]
```

Then add prerequisites:
```typescript
const prereqPairs = [
  // ...existing prereqs...
  ['CSE', '100', 'CSE', '12'],  // CSE 100 requires CSE 12
]
```

Run:
```bash
npm run db:seed
```

### Add a New Major

In `prisma/seed.ts`:

```typescript
const csMajor = await prisma.major.upsert({
  where: { name: 'Computer Science' },
  create: {
    name: 'Computer Science',
    ucsdCode: 'CS25',
  },
})
```

### Query the Database Directly

Open Prisma Studio:
```bash
npm run db:studio
```

Visit http://localhost:5555

Or use SQL directly:
```typescript
// In any API route
const result = await prisma.$queryRaw`
  SELECT * FROM courses WHERE dept = 'MATH';
`
```

### Add a New API Endpoint

Create `src/app/api/my-endpoint/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.course.findMany()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

### Add a New Page

Create `src/app/my-page/page.tsx`:

```typescript
export default function MyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">My Page</h1>
    </div>
  )
}
```

Visit: http://localhost:3000/my-page

## 🧪 Debugging Tips

### Check Database Connection
```bash
npm run db:studio
```

If it fails, your DATABASE_URL is wrong.

### View SQL Queries
In `.env`, set:
```
DATABASE_URL="postgresql://..."
```

Prisma will log queries in development mode.

### Check API Responses
Use browser DevTools Network tab or:
```bash
curl http://localhost:3000/api/courses?query=MATH
```

### Fix TypeScript Errors
```bash
npm run lint
```

## 📝 Next Steps - Choose Your Path

### Path 1: Add More Data
- [ ] Add Computer Science courses
- [ ] Add Biology courses
- [ ] Add more majors
- [ ] Increase to 100+ courses

**Why**: Practice SQL, understand real-world data

### Path 2: Improve Algorithms
- [ ] Add OR prerequisites support
- [ ] Implement course conflict detection
- [ ] Add summer quarter support
- [ ] Optimize scheduling (minimize quarters)

**Why**: Practice algorithms, data structures

### Path 3: Add Features
- [ ] User authentication (NextAuth.js)
- [ ] Save/load plans
- [ ] Export to calendar (ICS)
- [ ] Share plans (URL)

**Why**: Full-stack development practice

### Path 4: Improve UI/UX
- [ ] Add loading states
- [ ] Add error handling
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Animations

**Why**: Frontend development practice

## 🎨 Customization Ideas

### Change the Graph Layout
📍 `src/components/PrereqGraph.tsx`

Try different React Flow layouts:
- `dagre` layout (hierarchical)
- Force-directed layout
- Circular layout

### Change the Scheduling Algorithm
📍 `src/app/api/plan/route.ts`

Current: Greedy (fill quarters until max units)

Try:
- Minimize total quarters
- Balance units across quarters
- Prefer certain courses early

### Add Filters
- Filter courses by units
- Filter by department
- Filter by level (upper/lower division)

## 🐛 Common Issues & Solutions

### "Database error"
```bash
# Reset database
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Prisma Client error"
```bash
# Regenerate Prisma Client
npm run db:generate
```

### Port 3000 already in use
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📚 Learning Resources

### SQL
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Recursive Queries Explained](https://www.postgresql.org/docs/current/queries-with.html)

### Algorithms
- [Topological Sort](https://www.geeksforgeeks.org/topological-sorting/)
- [Graph Algorithms](https://visualgo.net/en/graphds)

### Next.js
- [Next.js Tutorial](https://nextjs.org/learn)
- [App Router Docs](https://nextjs.org/docs/app)

### Prisma
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)

## 🎯 Challenge Yourself

Ready for a challenge? Try these:

1. **Easy**: Add a "random course" button that shows a random course
2. **Medium**: Add course ratings and reviews
3. **Hard**: Implement OR prerequisites (MATH 18 OR CSE 21)
4. **Expert**: Add AI-powered course recommendations based on interests

## 🤝 Need Help?

- Check `PROJECT_SUMMARY.md` for architecture overview
- Check `QUICKSTART.md` for setup issues
- Check `README.md` for general info
- Look at the code comments
- Search the [Next.js docs](https://nextjs.org/docs)
- Search the [Prisma docs](https://www.prisma.io/docs)

Happy coding! 🚀
