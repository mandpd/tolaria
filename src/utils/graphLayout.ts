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

/**
 * Compute a path label from a vault file path, e.g. "project/my-note" → "my-note".
 * Uses only the last segment (filename without extension).
 */
export function pathLabel(path: string): string {
  const segments = path.split('/')
  const last = segments[segments.length - 1]
  return last.replace(/\.md$/, '')
}