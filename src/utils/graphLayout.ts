import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from 'd3-force'
import type { VaultEntry } from '../types'
import { resolveEntry, wikilinkTarget } from './wikilink'

export interface GraphNode {
  id: string
  title: string
  path: string
  type: string | null
  icon: string | null
  color: string | null
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  kind: 'wikilink' | 'relates-to' | 'relationship'
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Build a graph from vault entries: files become nodes, wikilinks and
 * frontmatter relationships become edges. Uses the app's canonical
 * wikilink resolver to match targets against entries.
 */
export function buildGraphData(entries: VaultEntry[]): GraphData {
  const nodes: GraphNode[] = []
  const edgeMap = new Map<string, GraphEdge>()

  for (const entry of entries) {
    nodes.push({
      id: entry.path,
      title: entry.title || entry.filename,
      path: entry.path,
      type: entry.isA,
      icon: entry.icon,
      color: entry.color,
    })

    // Wikilinks (outgoingLinks) — already plain targets, no [[ ]] wrapping
    for (const target of entry.outgoingLinks) {
      const resolved = resolveEntry(entries, target, entry)
      if (!resolved || resolved.path === entry.path) continue
      const edgeId = `${entry.path}::wikilink::${resolved.path}`
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: entry.path,
          target: resolved.path,
          kind: 'wikilink',
        })
      }
    }

    // Frontmatter relates-to — targets may be wikilink refs [[target]] or plain text
    for (const ref of entry.relatedTo) {
      const target = wikilinkTarget(ref)
      const resolved = resolveEntry(entries, target, entry)
      if (!resolved || resolved.path === entry.path) continue
      const edgeId = `${entry.path}::relates-to::${resolved.path}`
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: entry.path,
          target: resolved.path,
          kind: 'relates-to',
        })
      }
    }

    // Frontmatter belongs-to — targets may be wikilink refs [[target]] or plain text
    for (const ref of entry.belongsTo) {
      const target = wikilinkTarget(ref)
      const resolved = resolveEntry(entries, target, entry)
      if (!resolved || resolved.path === entry.path) continue
      const edgeId = `${entry.path}::belongs-to::${resolved.path}`
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: entry.path,
          target: resolved.path,
          kind: 'relates-to',
        })
      }
    }

    // Generic relationship fields (any frontmatter key with wikilinks)
    for (const [field, targets] of Object.entries(entry.relationships)) {
      for (const ref of targets) {
        const target = wikilinkTarget(ref)
        const resolved = resolveEntry(entries, target, entry)
        if (!resolved || resolved.path === entry.path) continue
        const edgeId = `${entry.path}::${field}::${resolved.path}`
        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: entry.path,
            target: resolved.path,
            kind: 'relationship',
          })
        }
      }
    }
  }

  return { nodes, edges: Array.from(edgeMap.values()) }
}

const FORCE_ITERATIONS = 100
const NODE_WIDTH = 150

interface SimNode extends SimulationNodeDatum {
  id: string
}

export interface NodePosition {
  id: string
  position: { x: number; y: number }
}

/**
 * Run a static d3-force simulation to position graph nodes. Returns one
 * centered position per node. Operates on copies of the edges so callers keep
 * their string source/target ids — d3-force's forceLink otherwise mutates each
 * link in place, replacing the ids with node objects.
 */
export function computeLayout(
  graphNodes: { id: string }[],
  graphEdges: { source: string; target: string }[],
): NodePosition[] {
  const nodes: SimNode[] = graphNodes.map((n) => ({ ...n, x: 0, y: 0 }))
  const links = graphEdges.map((e) => ({ source: e.source, target: e.target }))

  const sim = forceSimulation(nodes)
    .force(
      'link',
      forceLink<SimNode, typeof links[number]>(links)
        .id((d) => d.id)
        .distance(120),
    )
    .force('charge', forceManyBody().strength(-300))
    .force('center', forceCenter(0, 0))
    // Pull every node gently toward the origin so disconnected notes stay near
    // the cluster instead of drifting to the edges; collision keeps them apart.
    .force('x', forceX(0).strength(0.08))
    .force('y', forceY(0).strength(0.08))
    .force('collide', forceCollide(NODE_WIDTH / 2 + 20))
    .stop()

  for (let i = 0; i < FORCE_ITERATIONS; i++) {
    sim.tick()
  }

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

/**
 * Compute a path label from a vault file path, e.g. "project/my-note" → "my-note".
 * Uses only the last segment (filename without extension).
 */
export function pathLabel(path: string): string {
  const segments = path.split('/')
  const last = segments[segments.length - 1]
  return last.replace(/\.md$/, '')
}