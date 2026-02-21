'use client'

import { useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface RoadmapData {
  targetCourse: any
  prerequisites: any[]
  edges: Array<{ courseId: number; prereqCourseId: number }>
}

export function PrereqGraph({ courseId }: { courseId: number }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await fetch(`/api/roadmap?courseId=${courseId}`)
        const data: RoadmapData = await res.json()

        // Create nodes for all courses
        const allCourses = [data.targetCourse, ...data.prerequisites]
        
        // Group by depth for layout
        const depthGroups = new Map<number, any[]>()
        allCourses.forEach(course => {
          const depth = course.depth || 0
          if (!depthGroups.has(depth)) {
            depthGroups.set(depth, [])
          }
          depthGroups.get(depth)!.push(course)
        })

        // Create nodes with hierarchical layout
        const flowNodes: Node[] = []
        const maxDepth = Math.max(...Array.from(depthGroups.keys()))
        
        depthGroups.forEach((courses, depth) => {
          courses.forEach((course, index) => {
            const isTarget = course.id === courseId
            flowNodes.push({
              id: String(course.id),
              data: {
                label: (
                  <div className="text-center">
                    <div className="font-semibold">{course.dept} {course.number}</div>
                    <div className="text-xs">{course.title.substring(0, 20)}...</div>
                  </div>
                ),
              },
              position: {
                x: (maxDepth - depth) * 250,
                y: index * 100,
              },
              style: {
                background: isTarget ? '#3b82f6' : '#ffffff',
                color: isTarget ? '#ffffff' : '#000000',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '10px',
                width: 200,
              },
            })
          })
        })

        // Create edges
        const flowEdges: Edge[] = data.edges.map(edge => ({
          id: `${edge.prereqCourseId}-${edge.courseId}`,
          source: String(edge.prereqCourseId),
          target: String(edge.courseId),
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#3b82f6' },
        }))

        setNodes(flowNodes)
        setEdges(flowEdges)
      } catch (error) {
        console.error('Failed to load roadmap:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRoadmap()
  }, [courseId, setNodes, setEdges])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-600">Loading prerequisite tree...</div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-600">This course has no prerequisites</div>
      </div>
    )
  }

  return (
    <div className="h-96 border-2 border-gray-200 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
