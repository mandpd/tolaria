import { Graph } from '@phosphor-icons/react'
import type { GraphScope, VaultEntry, ViewFile } from '../../types'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { NoteTitleIcon } from '../NoteTitleIcon'
import { filterEntriesForViewFile } from '../../utils/noteListHelpers'
import { translate, type AppLocale } from '../../lib/i18n'

interface GraphPanelListProps {
  entries: VaultEntry[]
  views: ViewFile[]
  scope: GraphScope
  onSelectScope: (scope: GraphScope) => void
  locale?: AppLocale
}

function rowClassName(isActive: boolean): string {
  return cn(
    'h-auto w-full cursor-pointer select-none justify-start gap-2 rounded px-2 py-1.5 text-left transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent',
  )
}

function GraphNoteItem({
  note,
  icon,
  isActive,
  onSelect,
}: {
  note: VaultEntry
  icon: string | null
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <Button type="button" variant="ghost" size="sm" className={rowClassName(isActive)} onClick={onSelect}>
      <NoteTitleIcon icon={icon} size={16} />
      <span className="truncate">{note.title || note.filename}</span>
    </Button>
  )
}

function GraphViewGroup({
  view,
  notes,
  scope,
  onSelectScope,
}: {
  view: ViewFile
  notes: VaultEntry[]
  scope: GraphScope
  onSelectScope: (scope: GraphScope) => void
}) {
  if (notes.length === 0) return null
  return (
    <div className="mt-2">
      <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {view.definition.name}
      </div>
      {notes.map((note) => (
        <GraphNoteItem
          key={note.path}
          note={note}
          icon={view.definition.icon}
          isActive={scope.kind === 'note' && scope.path === note.path}
          onSelect={() => onSelectScope({ kind: 'note', path: note.path })}
        />
      ))}
    </div>
  )
}

export function GraphPanelList({ entries, views, scope, onSelectScope, locale = 'en' }: GraphPanelListProps) {
  const allActive = scope.kind === 'all'
  return (
    <div className="flex h-full flex-col" data-testid="graph-panel-list">
      <div className="border-b border-border px-3 py-2 text-sm font-semibold text-foreground">
        {translate(locale, 'graph.scope.title')}
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={rowClassName(allActive)}
          onClick={() => onSelectScope({ kind: 'all' })}
        >
          <Graph size={16} weight={allActive ? 'fill' : 'regular'} />
          <span className="truncate font-medium">{translate(locale, 'graph.scope.all')}</span>
        </Button>
        {views.map((view) => (
          <GraphViewGroup
            key={`${view.rootPath ?? ''}:${view.filename}`}
            view={view}
            notes={filterEntriesForViewFile(entries, view)}
            scope={scope}
            onSelectScope={onSelectScope}
          />
        ))}
      </div>
    </div>
  )
}
