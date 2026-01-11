import { Plus, MousePointer2, FileText, Film, Grid, Video, ZoomIn, ZoomOut } from 'lucide-react'

interface CanvasToolbarProps {
  onAddNode?: () => void
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onOpenEditor?: () => void
}

export function CanvasToolbar({ onAddNode, zoom = 72, onZoomIn, onZoomOut, onOpenEditor }: CanvasToolbarProps) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-lg shadow-sm">
      {/* Circular Add Button */}
      <button
        onClick={onAddNode}
        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/90 transition-colors shadow-sm"
        title="Add node"
      >
        <Plus className="w-4 h-4" />
      </button>
      
      {/* Pointer Icon */}
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="Select tool"
      >
        <MousePointer2 className="w-4 h-4 text-gray-300" />
      </button>
      
      {/* Document/File Icon */}
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="Document"
      >
        <FileText className="w-4 h-4 text-gray-300" />
      </button>
      
      {/* Film Clapper Icon - Lighter/Inactive Style (Editor Button) */}
      <button
        onClick={onOpenEditor}
        className="p-1.5 hover:bg-gray-100 rounded transition-colors relative"
        title="Editor"
      >
        <Film className="w-5 h-5 text-gray-800" />
        <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-0.5 text-[9px] font-medium text-white shadow">
          New Editor
        </span>
      </button>
      
      {/* Separator */}
      <div className="w-px h-5 bg-gray-300" />
      
      {/* Grid/Film Strip Icon */}
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="Grid"
      >
        <Grid className="w-4 h-4 text-gray-300" />
      </button>
      
      {/* Video Camera Icon */}
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="Video"
      >
        <Video className="w-4 h-4 text-gray-300" />
      </button>
      
      {/* Zoom Indicator */}
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={onZoomOut}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5 text-gray-300" />
        </button>
        <span className="text-sm text-gray-800 font-mono px-2 min-w-[3rem] text-center">
          {Math.round(zoom)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5 text-gray-300" />
        </button>
      </div>
    </div>
  )
}
