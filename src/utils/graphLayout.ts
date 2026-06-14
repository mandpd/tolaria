import type { VaultEntry } from '../types'

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
 * frontmatter relationships become edges.
 */
export function buildGraphData(entries: VaultEntry[]): GraphData {
  const pathSet = new Set(entries.map((e) => e.path))
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

    // Wikilinks (outgoingLinks)
    for (const target of entry.outgoingLinks) {
      if (!pathSet.has(target)) continue
      const edgeId = `${entry.path}::wikilink::${target}`
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: entry.path,
          target,
          kind: 'wikilink',
        })
      }
    }

    // Frontmatter relates-to
    for (const target of entry.relatedTo) {
      if (!pathSet.has(target)) continue
      const edgeId = `${entry.path}::relates-to::${target}`
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: entry.path,
          target,
          kind: 'relates-to',
        })
      }
    }

    // Generic relationship fields (any frontmatter key with wikilinks)
    for (const [field, targets] of Object.entries(entry.relationships)) {
      for (const target of targets) {
        if (!pathSet.has(target)) continue
        const edgeId = `${entry.path}::${field}::${target}`
        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: entry.path,
            target,
            kind: 'relationship',
          })
        }
      }
    }
  }

  return { nodes, edges: Array.from(edgeMap.values()) }
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