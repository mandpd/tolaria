import type { GraphScope, VaultEntry } from '../types'
import { resolveEntry, wikilinkTarget } from './wikilink'

/** Every wikilink/relationship target an entry points at, as plain targets. */
function entryLinkTargets(entry: VaultEntry): string[] {
  return [
    ...entry.outgoingLinks,
    ...entry.relatedTo.map(wikilinkTarget),
    ...entry.belongsTo.map(wikilinkTarget),
    ...Object.values(entry.relationships).flat().map(wikilinkTarget),
  ]
}

/** Paths of the entries an entry links to, resolved against the vault. */
function resolvedNeighborPaths(entry: VaultEntry, allEntries: VaultEntry[]): string[] {
  const paths: string[] = []
  for (const target of entryLinkTargets(entry)) {
    const resolved = resolveEntry(allEntries, target, entry)
    if (resolved) paths.push(resolved.path)
  }
  return paths
}

/**
 * Grow a seed set of entries to include every entry directly connected to a
 * seed — both links out of a seed and links from other notes into a seed — so a
 * View's graph shows the seed notes together with their related notes instead
 * of a handful of disconnected nodes.
 */
export function withConnectedNeighbors(seed: VaultEntry[], allEntries: VaultEntry[]): VaultEntry[] {
  const seedPaths = new Set(seed.map((entry) => entry.path))
  const included = new Set(seedPaths)
  for (const entry of seed) {
    for (const path of resolvedNeighborPaths(entry, allEntries)) included.add(path)
  }
  for (const entry of allEntries) {
    if (included.has(entry.path)) continue
    if (resolvedNeighborPaths(entry, allEntries).some((path) => seedPaths.has(path))) {
      included.add(entry.path)
    }
  }
  return allEntries.filter((entry) => included.has(entry.path))
}

/**
 * Resolve the entries the graph should render for a given scope. `all` returns
 * every entry; `note` returns the chosen note plus the notes directly connected
 * to it, so the graph is centered on that note rather than the whole vault. A
 * missing note resolves to an empty graph.
 */
export function entriesForGraphScope(scope: GraphScope, entries: VaultEntry[]): VaultEntry[] {
  if (scope.kind === 'all') return entries
  const note = entries.find((entry) => entry.path === scope.path)
  if (!note) return []
  return withConnectedNeighbors([note], entries)
}
