import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from 'd3-force'
import type { VaultEntry } from '../../types'
import { buildGraphData } from '../../utils/graphLayout'
import { GraphNode, type GraphNodeType } from './GraphNode'
import { translate, type AppLocale } from '../../lib/i18n'

const nodeTypes = {
  'graph-node': GraphNode,
}

interface GraphViewProps {
  entries: VaultEntry[]
  onNavigate: (entry: VaultEntry) => void
  locale?: AppLocale
}

const FORCE_ITERATIONS = 100
const NODE_WIDTH = 150

interface SimNode extends SimulationNodeDatum {
  id: string
}

function computeLayout(
  graphNodes: { id: string }[],
  graphEdges: { source: string; target: string }[],
) {
  const nodes: SimNode[] = graphNodes.map((n) => ({ ...n, x: 0, y: 0 }))

  const sim = forceSimulation(nodes)
    .force(
      'link',
      forceLink<SimNode, typeof graphEdges[number]>(graphEdges)
        .id((d) => d.id)
        .distance(120),
    )
    .force('charge', forceManyBody().strength(-300))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(NODE_WIDTH / 2 + 20))
    .stop()

  for (let i = 0; i < FORCE_ITERATIONS; i++) {
    sim.tick()
  }

  // Center the layout
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const n of nodes) {
    if (n.x! < minX) minX = n.x!
    if (n.x! > maxX) maxX = n.x!
    if (n.y! < minY) minY = n.y!
    if (n.y! > maxY) maxY = n.y!
  }

  const offsetX = (maxX + minX) / 2
  const offsetY = (maxY + minY) / 2

  return nodes.map((n) => ({
    id: n.id,
    position: { x: n.x! - offsetX, y: n.y! - offsetY },
  }))
}

export function GraphView({ entries, onNavigate, locale = 'en' }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const entryMapRef = useRef<Map<string, VaultEntry>>(new Map())

  // Keep entry map in sync
  useEffect(() => {
    const map = new Map<string, VaultEntry>()
    for (const e of entries) {
      map.set(e.path, e)
    }
    entryMapRef.current = map
  }, [entries])

  const graph = useMemo(() => buildGraphData(entries), [entries])

  const layout = useMemo(() => computeLayout(graph.nodes, graph.edges), [graph])

  const initialNodes: Node[] = useMemo(
    () =>
      graph.nodes.map((gn) => {
        const pos = layout.find((l) => l.id === gn.id)
        return {
          id: gn.id,
          type: 'graph-node',
          position: pos?.position ?? { x: 0, y: 0 },
          data: {
            label: gn.title,
            path: gn.path,
            icon: gn.icon,
            color: gn.color,
            type: gn.type,
          },
          draggable: false,
        } satisfies Node<GraphNodeType['data']>
      }),
    [graph.nodes, layout],
  )

  const initialEdges: Edge[] = useMemo(
    () =>
      graph.edges.map((ge) => ({
        id: ge.id,
        source: ge.source,
        target: ge.target,
        animated: false,
        style: {
          stroke:
            ge.kind === 'relates-to'
              ? 'var(--muted-foreground)'
              : ge.kind === 'relationship'
                ? 'var(--border)'
                : 'var(--primary)',
          strokeWidth: ge.kind === 'wikilink' ? 1.5 : 1,
          strokeDasharray: ge.kind === 'relationship' ? '4 2' : undefined,
        },
        data: { kind: ge.kind },
      })),
    [graph.edges],
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const entry = entryMapRef.current.get(node.id)
      if (entry) {
        onNavigate(entry)
      }
    },
    [onNavigate],
  )

  const fitViewOptions = useMemo(
    () => ({ padding: 0.2, maxZoom: 1.5 }),
    [],
  )

  if (graph.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>{translate(locale, 'sidebar.graph.empty')}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as GraphNodeType['data'] | undefined
              return data?.color ? `var(--${data.color}-9, var(--primary))` : 'var(--primary)'
            }}
            maskColor="var(--background, #fff)"
            style={{ background: 'var(--card)' }}
          />
          <Controls
            className="!rounded-md !border !border-border !bg-card !text-foreground"
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--border)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}