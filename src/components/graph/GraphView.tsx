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
  useNodesInitialized,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { VaultEntry } from '../../types'
import { buildGraphData, computeLayout, type GraphData } from '../../utils/graphLayout'
import { GraphNode, type GraphNodeType } from './GraphNode'
import { translate, type AppLocale } from '../../lib/i18n'

const nodeTypes = {
  'graph-node': GraphNode,
}

const FIT_VIEW_OPTIONS = { padding: 0.2, maxZoom: 1.5 }

/**
 * Fits the viewport to the graph once React Flow has measured the custom nodes.
 * The `fitView` prop only runs on the very first render — before our nodes have
 * dimensions — so it leaves the graph tiny and off-center. Refitting when
 * `useNodesInitialized` flips true centers and scales it correctly.
 */
function FitViewOnReady() {
  const nodesInitialized = useNodesInitialized()
  const { fitView } = useReactFlow()
  useEffect(() => {
    if (nodesInitialized) void fitView(FIT_VIEW_OPTIONS)
  }, [nodesInitialized, fitView])
  return null
}

interface GraphViewProps {
  entries: VaultEntry[]
  onNavigate: (entry: VaultEntry) => void
  locale?: AppLocale
}

function edgeStyle(kind: GraphData['edges'][number]['kind']): React.CSSProperties {
  return {
    stroke:
      kind === 'relates-to'
        ? 'var(--muted-foreground)'
        : kind === 'relationship'
          ? 'var(--border)'
          : 'var(--primary)',
    strokeWidth: kind === 'wikilink' ? 1.5 : 1,
    strokeDasharray: kind === 'relationship' ? '4 2' : undefined,
  }
}

/**
 * Renders one React Flow canvas for a fixed graph. `useNodesState`/`useEdgesState`
 * only read their argument as the initial value, so this component is remounted
 * (via a `key` on the graph signature) whenever the graph changes — that resets
 * the node/edge state to the new layout instead of leaving the previous one.
 */
function GraphCanvas({ graph, onNodeSelect }: { graph: GraphData; onNodeSelect: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
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
        style: edgeStyle(ge.kind),
        data: { kind: ge.kind },
      })),
    [graph.edges],
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => onNodeSelect(node.id),
    [onNodeSelect],
  )

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
          fitViewOptions={FIT_VIEW_OPTIONS}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <FitViewOnReady />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as GraphNodeType['data'] | undefined
              return data?.color ? `var(--${data.color}-9, var(--primary))` : 'var(--primary)'
            }}
            maskColor="var(--background, #fff)"
            style={{ background: 'var(--card)' }}
          />
          <Controls className="!rounded-md !border !border-border !bg-card !text-foreground" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}

export function GraphView({ entries, onNavigate, locale = 'en' }: GraphViewProps) {
  const graph = useMemo(() => buildGraphData(entries), [entries])
  const entryByPath = useMemo(() => {
    const map = new Map<string, VaultEntry>()
    for (const entry of entries) map.set(entry.path, entry)
    return map
  }, [entries])

  const handleNodeSelect = useCallback(
    (id: string) => {
      const entry = entryByPath.get(id)
      if (entry) onNavigate(entry)
    },
    [entryByPath, onNavigate],
  )

  // Signature of the rendered node set. Changing it remounts GraphCanvas so its
  // node/edge state re-initializes when the graph scope (or vault) changes.
  const signature = useMemo(() => graph.nodes.map((node) => node.id).join('|'), [graph])

  if (graph.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>{translate(locale, 'sidebar.graph.empty')}</p>
      </div>
    )
  }

  return <GraphCanvas key={signature} graph={graph} onNodeSelect={handleNodeSelect} />
}
