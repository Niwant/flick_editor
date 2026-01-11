import { Handle, Position, NodeProps } from 'reactflow'
import clsx from 'clsx'
import { Image, Video, Loader2 } from 'lucide-react'

export function CanvasNode({ data }: NodeProps) {
  const nodeType = data.type || 'effect'
  const isInstruction = nodeType === 'instruction'
  const isContent = nodeType === 'content'
  const status = data.status || 'ready'
  
  // Instruction nodes (peach-colored, with text)
  if (isInstruction) {
    return (
      <div className="px-4 py-3 rounded-sm bg-flick-peach text-flick-text min-w-[200px] max-w-[260px] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
        <div className="font-semibold text-[11px] mb-2">{data.label}</div>
        {data.instructionText && (
          <div className="text-[10px] text-flick-text-muted leading-relaxed whitespace-pre-line">
            {data.instructionText}
          </div>
        )}
        {data.outputs && data.outputs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-black/10">
            {data.outputs.map((output: any) => (
              <div key={output.id} className="flex items-center gap-2 text-[9px] mt-1">
                <span className="text-flick-text-muted">{output.name}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  className="w-2 h-2 ml-auto"
                  style={{
                    background: '#c7c2b8',
                    border: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Content nodes (white boxes with thumbnails)
  if (isContent) {
    const hasVideo = data.outputs?.some((o: any) => o.type === 'video')
    const isEmpty = !data.thumbnailUrl
    
    return (
      <div
        className={clsx(
          'rounded-sm bg-white text-flick-text min-w-[140px] overflow-hidden relative shadow-[0_8px_20px_rgba(0,0,0,0.08)]',
          isEmpty ? 'border border-dashed border-black/30' : 'border border-black/10'
        )}
      >
        {/* Input handles (left side) */}
        {data.inputs && data.inputs.length > 0 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
            {data.inputs.map((input: any) => (
              <Handle
                key={input.id}
                type="target"
                position={Position.Left}
                id={input.id}
                className="w-2 h-2"
                style={{
                  background: '#c7c2b8',
                  border: 'none',
                }}
              />
            ))}
          </div>
        )}
        
        {/* Thumbnail */}
        {data.thumbnailUrl ? (
          <div className="w-full aspect-video bg-flick-secondary relative" style={{ maxHeight: '96px' }}>
            <img
              src={data.thumbnailUrl}
              alt={data.label}
              className="w-full h-full object-cover"
            />
            {status === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-video bg-white flex flex-col items-center justify-center text-center px-3" style={{ maxHeight: '96px' }}>
            <div className="text-[10px] font-medium text-flick-text-muted">
              {data.label || 'Ready to generate video'}
            </div>
            <div className="text-[9px] text-flick-text-light mt-1">
              {hasVideo ? 'Image to Video' : 'Image'}
            </div>
          </div>
        )}
        
        {/* Output handles (right side) */}
        {data.outputs && data.outputs.length > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
            {data.outputs.map((output: any) => (
              <Handle
                key={output.id}
                type="source"
                position={Position.Right}
                id={output.id}
                className="w-2 h-2"
                style={{
                  background: '#c7c2b8',
                  border: 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Regular nodes (default styling) - This shouldn't be reached for instruction/content
  const colorClass = isInstruction 
    ? 'bg-flick-peach' 
    : isContent
    ? 'bg-flick-primary border-2 border-flick-text'
    : 'bg-flick-secondary border-flick-border'
  
  return (
    <div className={clsx('px-3 py-2.5 rounded-sm border text-flick-text min-w-[180px]', colorClass)}>
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
                  background: output.type === 'video' ? '#ef4444' : output.type === 'image' ? '#3b82f6' : '#1a1a1a',
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
