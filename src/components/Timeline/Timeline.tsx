import { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { formatTimecode } from '../../utils/timeUtils'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Lock, Unlock } from 'lucide-react'
import clsx from 'clsx'

export function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const justDraggedClipRef = useRef(false)
  const {
    tracks,
    playhead,
    duration,
    isPlaying,
    zoom,
    selectedClipIds,
    setPlayhead,
    setIsPlaying,
    setZoom,
    selectClip,
    toggleClipSelection,
    removeClip,
    updateTrack,
  } = useEditorStore()

  const [draggedClip, setDraggedClip] = useState<{ trackId: string; clipId: string; offset: number } | null>(null)

  // Calculate pixels per second based on zoom
  const pixelsPerSecond = zoom * 100

  // Convert time to pixel position
  const timeToPixel = (time: number) => time * pixelsPerSecond

  // Convert pixel position to time
  const pixelToTime = (pixel: number) => pixel / pixelsPerSecond

  // Handle timeline scrub
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't scrub if we just finished dragging a clip (click fires after mouseup)
    if (justDraggedClipRef.current) {
      justDraggedClipRef.current = false
      return
    }
    
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 180 // Account for track labels
    const time = pixelToTime(Math.max(0, x))
    setPlayhead(Math.min(time, duration))
  }

  // Handle clip drag
  const handleClipMouseDown = (e: React.MouseEvent, trackId: string, clipId: string) => {
    e.stopPropagation()
    const isAdditive = e.metaKey || e.ctrlKey || e.shiftKey
    const clip = tracks.find(t => t.id === trackId)?.clips.find(c => c.id === clipId)
    if (!clip) return

    if (isAdditive) {
      toggleClipSelection(clipId)
      return
    }

    e.preventDefault() // Prevent default drag behavior

    const clipElement = e.currentTarget as HTMLElement
    const rect = clipElement.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const offset = clickX / pixelsPerSecond

    setDraggedClip({ trackId, clipId, offset })
    if (!selectedClipIds.includes(clipId)) {
      selectClip(clipId)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return
      const timelineRect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - timelineRect.left - 180 - (offset * pixelsPerSecond)
      const newStartTime = Math.max(0, pixelToTime(x))
      useEditorStore.getState().updateClip(trackId, clipId, { startTime: newStartTime })
    }

    const handleMouseUp = () => {
      setDraggedClip(null)
      justDraggedClipRef.current = true
      // Reset the flag after a short delay to allow click event to check it
      setTimeout(() => {
        justDraggedClipRef.current = false
      }, 100)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Auto-scroll timeline to keep playhead visible
  useEffect(() => {
    if (!timelineRef.current || isPlaying) return
    const playheadPixel = timeToPixel(playhead)
    const scrollLeft = timelineRef.current.scrollLeft
    const containerWidth = timelineRef.current.clientWidth - 180

    if (playheadPixel < scrollLeft || playheadPixel > scrollLeft + containerWidth) {
      timelineRef.current.scrollLeft = Math.max(0, playheadPixel - containerWidth / 2)
    }
  }, [playhead, isPlaying, timeToPixel])

  return (
    <div className="flex flex-col h-full bg-flick-primary border-t border-flick-border">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-flick-border bg-flick-primary">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-flick-secondary rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-flick-text" />
            ) : (
              <Play className="w-4 h-4 text-flick-text" />
            )}
          </button>
          <button
            onClick={() => setPlayhead(Math.max(0, playhead - 1))}
            className="p-1.5 hover:bg-flick-secondary rounded transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5 text-flick-text" />
          </button>
          <button
            onClick={() => setPlayhead(Math.min(duration, playhead + 1))}
            className="p-1.5 hover:bg-flick-secondary rounded transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 text-flick-text" />
          </button>
          
          <div className="ml-2 text-xs font-mono text-flick-text-muted">
            {formatTimecode(playhead)} / {formatTimecode(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 h-1 bg-flick-border rounded-lg appearance-none cursor-pointer accent-flick-text"
          />
          <span className="text-xs text-flick-text-muted w-10 font-mono">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto scrollbar-hide" ref={timelineRef}>
        <div className="relative min-h-full" onClick={handleTimelineClick}>
          {/* Time Ruler */}
          <div className="sticky top-0 z-20 bg-flick-primary border-b border-flick-border" style={{ height: '28px', paddingLeft: '180px' }}>
            <div className="relative h-full">
              {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => {
                const time = i
                const x = timeToPixel(time)
                return (
                  <div
                    key={time}
                    className="absolute top-0 border-l border-flick-border text-xs text-flick-text-muted font-mono"
                    style={{ left: `${x}px`, height: '100%' }}
                  >
                    <span className="absolute top-1 left-1.5">{formatTimecode(time)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-flick-text-muted z-30 pointer-events-none"
            style={{
              left: `${180 + timeToPixel(playhead)}px`,
              height: '100%',
            }}
          >
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-flick-text-muted rounded-full" />
          </div>

          {/* Tracks */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className={clsx(
                'timeline-track relative flex items-center border-b border-flick-border',
                track.type === 'video' ? 'bg-flick-primary' : 'bg-flick-primary'
              )}
              style={{ height: `${track.height}px`, paddingLeft: '180px' }}
            >
              {/* Track Label */}
              <div className="absolute left-0 w-[180px] h-full flex items-center justify-between px-3 bg-flick-secondary border-r border-flick-border z-10">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={() => updateTrack(track.id, { muted: !track.muted })}
                    className="flex-shrink-0 p-1 hover:bg-flick-accent rounded transition-colors"
                  >
                    {track.muted ? (
                      <VolumeX className="w-3.5 h-3.5 text-flick-text-muted" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-flick-text" />
                    )}
                  </button>
                  <button
                    onClick={() => updateTrack(track.id, { locked: !track.locked })}
                    className="flex-shrink-0 p-1 hover:bg-flick-accent rounded transition-colors"
                  >
                    {track.locked ? (
                      <Lock className="w-3.5 h-3.5 text-flick-text-muted" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-flick-text" />
                    )}
                  </button>
                  <span className="text-xs font-medium text-flick-text truncate">{track.name}</span>
                </div>
              </div>

              {/* Track Content with Clips */}
              <div className="flex-1 relative h-full">
                {track.clips.map((clip) => {
                  const clipStart = timeToPixel(clip.startTime)
                  const clipWidth = timeToPixel(clip.duration)
                  
                  return (
                    <div
                      key={clip.id}
                      data-clip={clip.id}
                      className={clsx(
                        'absolute top-1 bottom-1 rounded-sm cursor-move transition-all border select-none',
                        selectedClipIds.includes(clip.id)
                          ? 'border-flick-text bg-flick-secondary'
                          : 'border-flick-border bg-flick-secondary hover:bg-flick-accent',
                        track.type === 'video' ? 'text-flick-text' : 'text-flick-text',
                        draggedClip?.clipId === clip.id && 'opacity-90',
                        clip.type === 'text' && 'bg-blue-50 border-blue-200'
                      )}
                      style={{
                        left: `${clipStart}px`,
                        width: `${clipWidth}px`,
                        minWidth: '40px',
                      }}
                      onMouseDown={(e) => {
                        if (!track.locked) {
                          handleClipMouseDown(e, track.id, clip.id)
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!draggedClip) {
                          if (e.metaKey || e.ctrlKey || e.shiftKey) {
                            toggleClipSelection(clip.id)
                          } else {
                            selectClip(clip.id)
                          }
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this clip?')) {
                          removeClip(track.id, clip.id)
                        }
                      }}
                    >
                      <div className="px-2 py-1 text-xs font-medium truncate flex items-center gap-1">
                        {clip.type === 'text' && (
                          <span className="text-[10px]">T</span>
                        )}
                        {clip.type === 'text' ? (clip.text || clip.name || 'Text') : (clip.name || 'Untitled')}
                      </div>
                      <div className="absolute top-1 right-1 text-[10px] text-flick-text-muted font-mono">
                        {formatTimecode(clip.duration)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Duration Indicator */}
          <div
            className="absolute top-0 bottom-0 w-px bg-flick-border z-10"
            style={{ left: `${180 + timeToPixel(duration)}px` }}
          />
        </div>
      </div>
    </div>
  )
}
