import type { GraphScope, VaultEntry, ViewFile } from '../types'
import { filterEntriesForViewFile } from './noteListHelpers'

/** True when a saved View is the one referenced by a `view` graph scope. */
export function viewMatchesGraphScope(
  view: ViewFile,
  scope: Extract<GraphScope, { kind: 'view' }>,
): boolean {
  return view.filename === scope.filename
    && (view.rootPath ?? undefined) === (scope.rootPath ?? undefined)
}

/**
 * Resolve the entries the graph should render for a given scope. `all` returns
 * every entry; `view` returns only the entries matched by that View (so the
 * graph shows just those nodes and the relationships between them). An unknown
 * View resolves to an empty graph.
 */
export function entriesForGraphScope(
  scope: GraphScope,
  entries: VaultEntry[],
  views: ViewFile[],
): VaultEntry[] {
  if (scope.kind === 'all') return entries
  const view = views.find((candidate) => viewMatchesGraphScope(candidate, scope))
  if (!view) return []
  return filterEntriesForViewFile(entries, view)
}
