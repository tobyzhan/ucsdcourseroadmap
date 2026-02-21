import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Math major
  const mathMajor = await prisma.major.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      ucsdCode: 'MA30',
    },
  })

  console.log('✅ Created major: Mathematics')

  // Create courses
  const coursesData = [
    // Lower Division Math
    { dept: 'MATH', number: '18', title: 'Linear Algebra', unitsMin: 4, unitsMax: 4, description: 'Matrix algebra, Gaussian elimination, determinants, linear independence, bases, dimension, eigenvalues and eigenvectors, applications.' },
    { dept: 'MATH', number: '20A', title: 'Calculus for Science and Engineering', unitsMin: 4, unitsMax: 4, description: 'Differentiation and integration of functions of one variable, with applications.' },
    { dept: 'MATH', number: '20B', title: 'Calculus for Science and Engineering', unitsMin: 4, unitsMax: 4, description: 'Integral calculus of several variables, vector calculus, applications.' },
    { dept: 'MATH', number: '20C', title: 'Calculus and Analytic Geometry for Science and Engineering', unitsMin: 4, unitsMax: 4, description: 'Vector geometry, vector functions, partial differentiation, multiple integration, change of variables in multiple integrals.' },
    { dept: 'MATH', number: '20D', title: 'Introduction to Differential Equations', unitsMin: 4, unitsMax: 4, description: 'Ordinary differential equations: exact, separable, and linear; constant coefficients, undetermined coefficients, variations of parameters.' },
    { dept: 'MATH', number: '20E', title: 'Vector Calculus', unitsMin: 4, unitsMax: 4, description: 'Calculus of vector functions, line integrals, surface integrals, Green\'s theorem, Stokes\' theorem, divergence theorem.' },
    
    // Upper Division Math
    { dept: 'MATH', number: '100A', title: 'Abstract Algebra I', unitsMin: 4, unitsMax: 4, description: 'Groups, subgroups, quotient groups, isomorphism theorems, group actions, Sylow theorems.' },
    { dept: 'MATH', number: '100B', title: 'Abstract Algebra II', unitsMin: 4, unitsMax: 4, description: 'Rings, ideals, quotient rings, polynomial rings, unique factorization domains, fields, field extensions.' },
    { dept: 'MATH', number: '100C', title: 'Abstract Algebra III', unitsMin: 4, unitsMax: 4, description: 'Modules, vector spaces, canonical forms, tensor products, Galois theory.' },
    { dept: 'MATH', number: '102', title: 'Applied Linear Algebra', unitsMin: 4, unitsMax: 4, description: 'Linear equations, matrices, determinants, eigenvalues, eigenvectors, inner products, linear transformations, applications.' },
    { dept: 'MATH', number: '109', title: 'Mathematical Reasoning', unitsMin: 4, unitsMax: 4, description: 'Introduction to methods of proof including mathematical induction, combinatorial arguments, proof by contradiction, and direct proof.' },
    { dept: 'MATH', number: '140A', title: 'Real Analysis I', unitsMin: 4, unitsMax: 4, description: 'Real numbers, topology of Euclidean spaces, metric spaces, continuity, differentiation.' },
    { dept: 'MATH', number: '140B', title: 'Real Analysis II', unitsMin: 4, unitsMax: 4, description: 'Riemann integration, sequences and series of functions, uniform convergence, Fourier series.' },
    { dept: 'MATH', number: '140C', title: 'Real Analysis III', unitsMin: 4, unitsMax: 4, description: 'Lebesgue measure and integration, convergence theorems, differentiation theorems.' },
    { dept: 'MATH', number: '142A', title: 'Introduction to Analysis I', unitsMin: 4, unitsMax: 4, description: 'Sequences, series, continuity, uniform continuity, compactness, completeness.' },
    { dept: 'MATH', number: '142B', title: 'Introduction to Analysis II', unitsMin: 4, unitsMax: 4, description: 'Differentiation, mean value theorem, Taylor\'s theorem, Riemann integration.' },
    { dept: 'MATH', number: '180A', title: 'Introduction to Probability', unitsMin: 4, unitsMax: 4, description: 'Discrete and continuous random variables, expectation, distributions, limit theorems.' },
    { dept: 'MATH', number: '180B', title: 'Introduction to Statistics', unitsMin: 4, unitsMax: 4, description: 'Sampling distributions, estimation, hypothesis testing, confidence intervals, regression.' },
    { dept: 'MATH', number: '180C', title: 'Introduction to Stochastic Processes', unitsMin: 4, unitsMax: 4, description: 'Markov chains, random walks, Poisson processes, queuing theory, applications.' },
    { dept: 'MATH', number: '181A', title: 'Introduction to Mathematical Statistics I', unitsMin: 4, unitsMax: 4, description: 'Probability theory, random variables, moment generating functions, sampling distributions.' },
    { dept: 'MATH', number: '181B', title: 'Introduction to Mathematical Statistics II', unitsMin: 4, unitsMax: 4, description: 'Point estimation, interval estimation, hypothesis testing, regression analysis.' },
    { dept: 'MATH', number: '181C', title: 'Introduction to Mathematical Statistics III', unitsMin: 4, unitsMax: 4, description: 'Analysis of variance, nonparametric methods, sequential analysis.' },
    { dept: 'MATH', number: '184', title: 'Enumerative Combinatorics', unitsMin: 4, unitsMax: 4, description: 'Permutations, combinations, generating functions, recurrence relations, inclusion-exclusion.' },
    { dept: 'MATH', number: '185', title: 'Graph Theory', unitsMin: 4, unitsMax: 4, description: 'Graphs, trees, connectivity, Eulerian and Hamiltonian graphs, planarity, coloring.' },
    { dept: 'MATH', number: '186', title: 'Probability Theory', unitsMin: 4, unitsMax: 4, description: 'Measure-theoretic probability, random variables, independence, laws of large numbers, central limit theorem.' },
    { dept: 'MATH', number: '187A', title: 'Introduction to Cryptography', unitsMin: 4, unitsMax: 4, description: 'Number theory, modular arithmetic, RSA, Diffie-Hellman, elliptic curves, digital signatures.' },
    { dept: 'MATH', number: '190', title: 'Number Theory', unitsMin: 4, unitsMax: 4, description: 'Divisibility, prime numbers, congruences, quadratic reciprocity, arithmetic functions.' },
    { dept: 'MATH', number: '194', title: 'Ordinary Differential Equations', unitsMin: 4, unitsMax: 4, description: 'Existence and uniqueness theorems, linear systems, stability, phase portraits, boundary value problems.' },
    { dept: 'MATH', number: '195', title: 'Teaching Mathematics', unitsMin: 4, unitsMax: 4, description: 'Mathematics teaching methods, curriculum development, classroom practice.' },
    { dept: 'MATH', number: '196', title: 'History of Mathematics', unitsMin: 4, unitsMax: 4, description: 'Development of mathematical ideas from ancient to modern times.' },
  ]

  const courses: Array<{
    id: number
    dept: string
    number: string
    title: string
    unitsMin: number
    unitsMax: number
    description: string | null
    createdAt: Date
    updatedAt: Date
  }> = []
  for (const data of coursesData) {
    const course = await prisma.course.upsert({
      where: { dept_number: { dept: data.dept, number: data.number } },
      update: {},
      create: data,
    })
    courses.push(course)
  }

  console.log(`✅ Created ${courses.length} courses`)

  // Helper function to find course by dept and number
  const findCourse = (dept: string, number: string) => 
    courses.find(c => c.dept === dept && c.number === number)!

  // Create prerequisite relationships
  const prereqPairs: [string, string, string, string][] = [
    // [course dept, course number, prereq dept, prereq number]
    
    // Lower division prerequisites
    ['MATH', '20B', 'MATH', '20A'],
    ['MATH', '20C', 'MATH', '20B'],
    ['MATH', '20D', 'MATH', '20C'],
    ['MATH', '20E', 'MATH', '20C'],
    ['MATH', '20E', 'MATH', '20D'],
    
    // Upper division prerequisites
    ['MATH', '100A', 'MATH', '18'],
    ['MATH', '100A', 'MATH', '20C'],
    ['MATH', '100A', 'MATH', '109'],
    
    ['MATH', '100B', 'MATH', '100A'],
    ['MATH', '100C', 'MATH', '100B'],
    
    ['MATH', '102', 'MATH', '18'],
    ['MATH', '102', 'MATH', '20C'],
    
    ['MATH', '140A', 'MATH', '20C'],
    ['MATH', '140A', 'MATH', '109'],
    
    ['MATH', '140B', 'MATH', '140A'],
    ['MATH', '140C', 'MATH', '140B'],
    
    ['MATH', '142A', 'MATH', '20C'],
    ['MATH', '142A', 'MATH', '109'],
    
    ['MATH', '142B', 'MATH', '142A'],
    
    ['MATH', '180A', 'MATH', '20C'],
    ['MATH', '180A', 'MATH', '18'],
    
    ['MATH', '180B', 'MATH', '180A'],
    ['MATH', '180C', 'MATH', '180B'],
    
    ['MATH', '181A', 'MATH', '180A'],
    ['MATH', '181A', 'MATH', '142A'],
    
    ['MATH', '181B', 'MATH', '181A'],
    ['MATH', '181C', 'MATH', '181B'],
    
    ['MATH', '184', 'MATH', '109'],
    ['MATH', '185', 'MATH', '109'],
    
    ['MATH', '186', 'MATH', '180A'],
    ['MATH', '186', 'MATH', '140A'],
    
    ['MATH', '187A', 'MATH', '109'],
    ['MATH', '190', 'MATH', '109'],
    
    ['MATH', '194', 'MATH', '20D'],
    ['MATH', '194', 'MATH', '18'],
    ['MATH', '194', 'MATH', '109'],
    
    ['MATH', '195', 'MATH', '100A'],
    ['MATH', '196', 'MATH', '100A'],
  ]

  for (const [courseDept, courseNum, prereqDept, prereqNum] of prereqPairs) {
    const course = findCourse(courseDept, courseNum)
    const prereq = findCourse(prereqDept, prereqNum)
    
    if (course && prereq) {
      await prisma.coursePrereqEdge.upsert({
        where: {
          courseId_prereqCourseId: {
            courseId: course.id,
            prereqCourseId: prereq.id,
          },
        },
        update: {},
        create: {
          courseId: course.id,
          prereqCourseId: prereq.id,
        },
      })
    }
  }

  console.log(`✅ Created ${prereqPairs.length} prerequisite edges`)

  // Create major requirements
  const lowerDivCourses = ['18', '20A', '20B', '20C', '20D', '20E']
  const upperDivCore = ['100A', '109', '140A', '142A', '180A']
  const upperDivElectives = ['100B', '100C', '102', '140B', '140C', '142B', '180B', '180C', '181A', '181B', '181C', '184', '185', '186', '187A', '190', '194', '195', '196']

  for (const num of lowerDivCourses) {
    const course = findCourse('MATH', num)
    if (course) {
      await prisma.majorRequirement.upsert({
        where: {
          majorId_courseId: {
            majorId: mathMajor.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          majorId: mathMajor.id,
          courseId: course.id,
          groupName: 'Lower Division',
          required: true,
        },
      })
    }
  }

  for (const num of upperDivCore) {
    const course = findCourse('MATH', num)
    if (course) {
      await prisma.majorRequirement.upsert({
        where: {
          majorId_courseId: {
            majorId: mathMajor.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          majorId: mathMajor.id,
          courseId: course.id,
          groupName: 'Upper Division Core',
          required: true,
        },
      })
    }
  }

  for (const num of upperDivElectives) {
    const course = findCourse('MATH', num)
    if (course) {
      await prisma.majorRequirement.upsert({
        where: {
          majorId_courseId: {
            majorId: mathMajor.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          majorId: mathMajor.id,
          courseId: course.id,
          groupName: 'Upper Division Electives',
          required: false,
        },
      })
    }
  }

  console.log(`✅ Created major requirements for Mathematics`)

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ucsd.edu' },
    update: {},
    create: {
      email: 'demo@ucsd.edu',
      name: 'Demo Student',
    },
  })

  console.log(`✅ Created demo user`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
