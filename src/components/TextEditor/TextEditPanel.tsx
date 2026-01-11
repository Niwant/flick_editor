import { useState, useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { X } from 'lucide-react'

export function TextEditPanel() {
  const { tracks, selectedClipId, updateClip, selectClip } = useEditorStore()
  const [isOpen, setIsOpen] = useState(false)
  
  // Find the selected clip
  const selectedClip = selectedClipId 
    ? tracks.find(t => t.clips.some(c => c.id === selectedClipId))?.clips.find(c => c.id === selectedClipId)
    : null

  // Open panel when a text clip is selected
  useEffect(() => {
    setIsOpen(selectedClip?.type === 'text')
  }, [selectedClip?.type, selectedClipId])

  if (!isOpen || !selectedClip || selectedClip.type !== 'text') {
    return null
  }

  const properties = selectedClip.properties || {}
  const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))

  if (!track) return null

  const handleUpdate = (updates: Record<string, any>) => {
    updateClip(track.id, selectedClip.id, {
      properties: {
        ...properties,
        ...updates,
      },
    })
  }

  const handleTextChange = (text: string) => {
    updateClip(track.id, selectedClip.id, { text })
  }

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Palatino',
    'Garamond',
  ]

  const alignments = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ]

  return (
    <div className="absolute right-4 top-full mt-2 w-80 bg-flick-primary border border-flick-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-flick-border">
        <h3 className="text-sm font-semibold text-flick-text">Edit Text</h3>
        <button
          onClick={() => selectClip(null)}
          className="p-1 hover:bg-flick-secondary rounded transition-colors"
        >
          <X className="w-4 h-4 text-flick-text-muted" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Text Content */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Text Content
          </label>
          <textarea
            value={selectedClip.text || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter text..."
            className="w-full px-3 py-2 text-sm bg-flick-secondary border border-flick-border rounded text-flick-text placeholder-flick-text-light focus:outline-none focus:border-flick-text-muted resize-none"
            rows={3}
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Font Size: {properties.fontSize || 48}px
          </label>
          <input
            type="range"
            min="12"
            max="200"
            value={properties.fontSize || 48}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full h-1 bg-flick-border rounded-lg appearance-none cursor-pointer accent-flick-text"
          />
          <div className="flex justify-between text-[10px] text-flick-text-light mt-1">
            <span>12</span>
            <span>200</span>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={properties.color || '#ffffff'}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-12 h-8 border border-flick-border rounded cursor-pointer"
            />
            <input
              type="text"
              value={properties.color || '#ffffff'}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              className="flex-1 px-3 py-1.5 text-xs bg-flick-secondary border border-flick-border rounded text-flick-text focus:outline-none focus:border-flick-text-muted font-mono"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Font Family
          </label>
          <select
            value={properties.fontFamily || 'Arial'}
            onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-1.5 text-sm bg-flick-secondary border border-flick-border rounded text-flick-text focus:outline-none focus:border-flick-text-muted"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Text Alignment
          </label>
          <div className="flex gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleUpdate({ alignment: align.value })}
                className={`flex-1 px-3 py-1.5 text-xs border rounded transition-colors ${
                  (properties.alignment || 'center') === align.value
                    ? 'bg-flick-accent border-flick-text text-flick-text'
                    : 'bg-flick-secondary border-flick-border text-flick-text-muted hover:border-flick-text-muted'
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position X */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Horizontal Position: {Math.round((properties.x || 0.5) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={(properties.x || 0.5) * 100}
            onChange={(e) => handleUpdate({ x: parseInt(e.target.value) / 100 })}
            className="w-full h-1 bg-flick-border rounded-lg appearance-none cursor-pointer accent-flick-text"
          />
          <div className="flex justify-between text-[10px] text-flick-text-light mt-1">
            <span>Left</span>
            <span>Right</span>
          </div>
        </div>

        {/* Position Y */}
        <div>
          <label className="block text-xs font-medium text-flick-text-muted mb-1.5">
            Vertical Position: {Math.round((properties.y || 0.5) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={(properties.y || 0.5) * 100}
            onChange={(e) => handleUpdate({ y: parseInt(e.target.value) / 100 })}
            className="w-full h-1 bg-flick-border rounded-lg appearance-none cursor-pointer accent-flick-text"
          />
          <div className="flex justify-between text-[10px] text-flick-text-light mt-1">
            <span>Top</span>
            <span>Bottom</span>
          </div>
        </div>
      </div>
    </div>
  )
}
