import { Handle, Position, NodeProps } from 'reactflow'
import clsx from 'clsx'

const nodeTypeColors = {
  input: 'bg-flick-secondary border-flick-border',
  output: 'bg-flick-secondary border-flick-border',
  effect: 'bg-flick-accent border-flick-border',
  transform: 'bg-flick-secondary border-flick-border',
  composite: 'bg-flick-secondary border-flick-border',
}

export function CustomNode({ data }: NodeProps) {
  const nodeType = (data.type || 'effect') as keyof typeof nodeTypeColors
  const colorClass = nodeTypeColors[nodeType] || nodeTypeColors.effect

  return (
    <div className={clsx('px-3 py-2.5 rounded-sm border border-flick-border bg-flick-secondary text-flick-text min-w-[180px]', colorClass)}>
      <div className="font-medium text-xs mb-2">{data.label}</div>
      
      {/* Input Ports */}
      {data.inputs && data.inputs.length > 0 && (
        <div className="space-y-1 mb-2">
          {data.inputs.map((input: any) => (
            <div key={input.id} className="flex items-center gap-2 text-[10px]">
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className="w-2.5 h-2.5"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #e5e5e5',
                }}
              />
              <span className="text-flick-text-muted">{input.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Properties */}
      {data.properties && Object.keys(data.properties).length > 0 && (
        <div className="mt-2 pt-2 border-t border-flick-border">
          <div className="text-[10px] text-flick-text-muted space-y-0.5 font-mono">
            {Object.entries(data.properties).slice(0, 2).map(([key, value]) => (
              <div key={key}>
                <span>{key}:</span>{' '}
                <span className="text-flick-text">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Output Ports */}
      {data.outputs && data.outputs.length > 0 && (
        <div className="space-y-1 mt-2">
          {data.outputs.map((output: any) => (
            <div key={output.id} className="flex items-center gap-2 text-[10px]">
              <span className="text-flick-text-muted">{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="w-2.5 h-2.5 ml-auto"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #e5e5e5',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
