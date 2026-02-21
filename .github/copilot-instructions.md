# UCSD Course Roadmap - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a UCSD Course Roadmap application built with Next.js 14, TypeScript, Prisma, and PostgreSQL. It demonstrates advanced SQL usage for educational planning.

## Architecture

- **Frontend**: Next.js 14 App Router with React Server Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Key Features**: 
  - Recursive CTEs for prerequisite graph traversal
  - Topological sorting for course scheduling
  - React Flow for graph visualization

## Code Standards

- Use TypeScript with strict type checking
- Follow React Server Components patterns (use 'use client' only when necessary)
- Keep API routes in `src/app/api/`
- Use Prisma for database operations
- For complex SQL queries (like recursive CTEs), use `prisma.$queryRaw`

## Database Schema

The database uses an MVP approach with AND-only prerequisites:
- `courses`: Core course information
- `course_prereq_edges`: Simple prerequisite relationships
- `majors`: Academic programs
- `major_requirements`: Course requirements for each major
- `users`, `user_courses`, `plans`, `plan_items`: User data and saved plans

## Key Algorithms

- **Prerequisite Discovery**: Recursive SQL CTE in `/api/roadmap`
- **Course Scheduling**: Topological sort (Kahn's algorithm) in `/api/plan`
- **Quarter Chunking**: Greedy unit-based allocation

## Development Workflow

1. Database changes: Update `prisma/schema.prisma`, run `npm run db:push`
2. API routes: Create in `src/app/api/[route]/route.ts`
3. Components: Separate client ('use client') and server components
4. Always handle loading and error states in UI components
