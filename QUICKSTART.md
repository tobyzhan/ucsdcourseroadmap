# Quick Start Guide

## Option 1: Automated Setup (Recommended)

If you have Docker installed:

```bash
./setup.sh
npm run dev
```

This will:
1. Start PostgreSQL in Docker
2. Push the database schema
3. Seed with sample Math courses
4. Ready to run!

## Option 2: Manual Setup

### 1. Start PostgreSQL

**With Docker:**
```bash
docker-compose up -d
```

**Or use a managed service:**
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app)

Update `.env`:
```
DATABASE_URL="your-postgres-connection-string"
```

### 2. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## VS Code Tasks

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux), then type "Run Task":

- **dev: Start Development Server** - Start the app
- **db: Push Schema** - Update database schema
- **db: Seed Database** - Add sample courses
- **db: Open Prisma Studio** - Visual database editor
- **Setup: Quick Start** - Run automated setup

## Verify Installation

1. Visit http://localhost:3000 - You should see the homepage
2. Search for "MATH 180A" - You should see Probability course
3. Click on it to see the prerequisite graph
4. Click "Generate Plan" to test the topological sort

## Troubleshooting

### "Can't connect to database"
- Check if PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in `.env`
- Try: `npm run db:push` again

### "No courses found"
- Run: `npm run db:seed`
- Check in Prisma Studio: `npm run db:studio`

### Port 5432 already in use
- Change port in `docker-compose.yml` and `.env`
- Or stop existing PostgreSQL: `docker stop $(docker ps -q --filter ancestor=postgres)`

## Next Steps

- Browse the code in `src/app/api/` to see the SQL CTEs
- Check `src/app/api/roadmap/route.ts` for the recursive query
- Explore `src/app/api/plan/route.ts` for topological sort
- Add more courses in `prisma/seed.ts`

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema (dev)
npm run db:migrate       # Create migration (prod)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

## Database Tools

**Prisma Studio** (Included):
```bash
npm run db:studio
# Visit http://localhost:5555
```

**pgAdmin** (Optional):
```bash
docker run -p 5050:80 \
  -e 'PGADMIN_DEFAULT_EMAIL=user@domain.com' \
  -e 'PGADMIN_DEFAULT_PASSWORD=password' \
  -d dpage/pgadmin4
```

## Sample Queries

Once your database is running, try these in Prisma Studio or pgAdmin:

**Find all prerequisites for MATH 180A:**
```sql
WITH RECURSIVE prereqs AS (
  SELECT course_id, prereq_course_id, 1 AS depth
  FROM course_prereq_edges
  WHERE course_id = (SELECT id FROM courses WHERE dept='MATH' AND number='180A')
  
  UNION ALL
  
  SELECT e.course_id, e.prereq_course_id, p.depth + 1
  FROM course_prereq_edges e
  JOIN prereqs p ON e.course_id = p.prereq_course_id
)
SELECT c.dept, c.number, c.title, p.depth
FROM prereqs p
JOIN courses c ON c.id = p.prereq_course_id
ORDER BY p.depth;
```

**Count prerequisites per course:**
```sql
SELECT 
  c.dept, 
  c.number, 
  c.title,
  COUNT(e.prereq_course_id) as prereq_count
FROM courses c
LEFT JOIN course_prereq_edges e ON c.id = e.course_id
GROUP BY c.id, c.dept, c.number, c.title
ORDER BY prereq_count DESC;
```
