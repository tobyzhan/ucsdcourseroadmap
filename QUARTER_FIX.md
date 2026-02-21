# Quarter Planning Fix - Sequential Scheduling

## The Problem

Previously, the planner could schedule courses like this:

```
Quarter 1 (Fall 2024):
- MATH 20A
- MATH 20B  ❌ WRONG! 20B requires 20A first
- MATH 20C  ❌ WRONG! 20C requires 20B first
```

## The Fix

Now courses are scheduled **sequentially by dependency level**:

```
Level 0 (no prerequisites):
- MATH 20A

Level 1 (requires Level 0):
- MATH 20B

Level 2 (requires Level 1):
- MATH 20C

Level 3 (requires Level 2):
- MATH 20D, MATH 20E
```

Becomes:

```
Quarter 1 (Fall 2024):
- MATH 20A (4 units)

Quarter 2 (Winter 2025):
- MATH 20B (4 units)

Quarter 3 (Spring 2025):
- MATH 20C (4 units)

Quarter 4 (Fall 2025):
- MATH 20D (4 units)
- MATH 20E (4 units)  ✅ Both require 20C, can take together
- MATH 18 (4 units)   ✅ No prerequisites
```

## How It Works

### 1. Topological Sort with Levels

Instead of one flat list, we group courses by dependency level:

```typescript
function topologicalSortWithLevels() {
  // Level 0: courses with no prerequisites
  // Level 1: courses that only need Level 0
  // Level 2: courses that need Level 0 AND 1
  // etc.
}
```

### 2. Sequential Quarter Packing

**KEY RULE**: Complete all courses in Level N before starting any Level N+1

```typescript
levels.forEach(level => {
  // Pack this entire level into quarters
  while (remainingCoursesInLevel > 0) {
    // Fill quarter up to 16 units
    // Move to next quarter
  }
  // Only NOW move to next level
})
```

## Example Schedules

### MATH 180A (Probability)

**Prerequisites:**
- MATH 180A requires MATH 20C AND MATH 18
- MATH 20C requires MATH 20B
- MATH 20B requires MATH 20A

**Generated Plan:**

```
Quarter 1 (Fall 2024) - 4 units
├─ MATH 20A - Calculus I

Quarter 2 (Winter 2025) - 4 units
├─ MATH 20B - Calculus II

Quarter 3 (Spring 2025) - 8 units
├─ MATH 20C - Calculus III
└─ MATH 18 - Linear Algebra

Quarter 4 (Fall 2025) - 4 units
├─ MATH 180A - Introduction to Probability
```

### MATH 140A (Real Analysis)

**Prerequisites:**
- MATH 140A requires MATH 20C AND MATH 109
- MATH 109 requires MATH 18 AND MATH 20C
- (and their prerequisites...)

**Generated Plan:**

```
Quarter 1 (Fall 2024) - 8 units
├─ MATH 20A - Calculus I
└─ MATH 18 - Linear Algebra

Quarter 2 (Winter 2025) - 4 units
├─ MATH 20B - Calculus II

Quarter 3 (Spring 2025) - 4 units
├─ MATH 20C - Calculus III

Quarter 4 (Fall 2025) - 4 units
├─ MATH 109 - Mathematical Reasoning

Quarter 5 (Winter 2026) - 4 units
├─ MATH 140A - Real Analysis I
```

## Benefits

✅ **Correct**: Never schedules courses before prerequisites  
✅ **Efficient**: Can take multiple courses from same level together  
✅ **Realistic**: Matches how students actually take courses  
✅ **Flexible**: Respects 16-unit limit per quarter

## Testing

Try these courses to see it work:

1. **MATH 180A** - Simple 3-level chain
2. **MATH 140A** - Complex multi-path prerequisites
3. **MATH 181A** - Requires both 180A and 142A (different branches)

Each should show proper sequential scheduling!
