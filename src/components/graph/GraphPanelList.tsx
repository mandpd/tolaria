import { useMemo } from 'react'
import { Graph } from '@phosphor-icons/react'
import type { GraphScope, VaultEntry, ViewFile } from '../../types'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { NoteItem } from '../NoteItem'
import { buildTypeEntryMap } from '../../utils/typeColors'
import { filterEntriesForViewFile } from '../../utils/noteListHelpers'
import { translate, type AppLocale } from '../../lib/i18n'

interface GraphPanelListProps {
  entries: VaultEntry[]
  views: ViewFile[]
  scope: GraphScope
  onSelectScope: (scope: GraphScope) => void
  locale?: AppLocale
}

function GraphViewGroup({
  view,
  notes,
  entries,
  typeEntryMap,
  scope,
  onSelectScope,
}: {
  view: ViewFile
  notes: VaultEntry[]
  entries: VaultEntry[]
  typeEntryMap: Record<string, VaultEntry>
  scope: GraphScope
  onSelectScope: (scope: GraphScope) => void
}) {
  if (notes.length === 0) return null
  return (
    <div>
      <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {view.definition.name}
      </div>
      {notes.map((note) => (
        <NoteItem
          key={note.path}
          entry={note}
          isSelected={scope.kind === 'note' && scope.path === note.path}
          typeEntryMap={typeEntryMap}
          allEntries={entries}
          onClickNote={(clicked) => onSelectScope({ kind: 'note', path: clicked.path })}
        />
      ))}
    </div>
  )
}

export function GraphPanelList({ entries, views, scope, onSelectScope, locale = 'en' }: GraphPanelListProps) {
  const typeEntryMap = useMemo(() => buildTypeEntryMap(entries), [entries])
  const allActive = scope.kind === 'all'
  return (
    <div className="flex h-full flex-col" data-testid="graph-panel-list">
      <div className="border-b border-border px-3 py-2 text-sm font-semibold text-foreground">
        {translate(locale, 'graph.scope.title')}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-auto w-full cursor-pointer select-none justify-start gap-2 rounded px-2 py-1.5 text-left transition-colors',
              allActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent',
            )}
            onClick={() => onSelectScope({ kind: 'all' })}
          >
            <Graph size={16} weight={allActive ? 'fill' : 'regular'} />
            <span className="truncate font-medium">{translate(locale, 'graph.scope.all')}</span>
          </Button>
        </div>
        {views.map((view) => (
          <GraphViewGroup
            key={`${view.rootPath ?? ''}:${view.filename}`}
            view={view}
            notes={filterEntriesForViewFile(entries, view)}
            entries={entries}
            typeEntryMap={typeEntryMap}
            scope={scope}
            onSelectScope={onSelectScope}
          />
        ))}
      </div>
    </div>
  )
}
