import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { getTypeColor, getTypeLightColor } from '../../utils/typeColors'
import { cn } from '@/lib/utils'
import { pathLabel } from '../../utils/graphLayout'

export type GraphNodeData = {
  label: string
  path: string
  icon: string | null
  color: string | null
  type: string | null
}

export type GraphNodeType = Node<GraphNodeData, 'graph-node'>

export function GraphNode({ data, selected }: NodeProps<GraphNodeType>) {
  const accentColor = getTypeColor(data.type ?? '', data.color)
  const accentLightColor = getTypeLightColor(data.type ?? '', data.color)

  return (
    <div
      className={cn(
        'rounded-md border bg-card px-3 py-2 text-sm shadow-sm transition-shadow',
        selected && 'ring-2 ring-ring shadow-md',
      )}
      style={{
        borderColor: accentColor,
        backgroundColor: `${accentLightColor}1a`,
        minWidth: 100,
        maxWidth: 200,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div className="flex items-center gap-1.5 truncate">
        {data.icon && (
          <span className="shrink-0 text-xs opacity-70">{data.icon}</span>
        )}
        <span className="truncate font-medium">{data.label}</span>
      </div>
      {data.path && (
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {pathLabel(data.path)}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  )
}