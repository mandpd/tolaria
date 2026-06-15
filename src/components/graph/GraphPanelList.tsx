import { Graph, Funnel } from '@phosphor-icons/react'
import type { GraphScope, ViewFile } from '../../types'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { NoteTitleIcon } from '../NoteTitleIcon'
import { viewMatchesGraphScope } from '../../utils/graphScope'
import { translate, type AppLocale } from '../../lib/i18n'

interface GraphPanelListProps {
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

function viewRowKey(view: ViewFile): string {
  return `${view.rootPath ?? ''}:${view.filename}`
}

export function GraphPanelList({ views, scope, onSelectScope, locale = 'en' }: GraphPanelListProps) {
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
        {views.map((view) => {
          const isActive = scope.kind === 'view' && viewMatchesGraphScope(view, scope)
          return (
            <Button
              key={viewRowKey(view)}
              type="button"
              variant="ghost"
              size="sm"
              className={rowClassName(isActive)}
              onClick={() => onSelectScope({ kind: 'view', filename: view.filename, rootPath: view.rootPath })}
            >
              {view.definition.icon
                ? <NoteTitleIcon icon={view.definition.icon} size={16} />
                : <Funnel size={16} weight={isActive ? 'fill' : 'regular'} />}
              <span className="truncate">{view.definition.name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
