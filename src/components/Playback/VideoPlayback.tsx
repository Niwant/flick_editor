import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { LivePlayer } from '@twick/live-player'
import { useEditorStore } from '../../store/editorStore'
import { formatTimecode } from '../../utils/timeUtils'
import { convertTracksToProjectData } from '../../utils/projectDataConverter'
import { Play, Pause, Volume2, Maximize2 } from 'lucide-react'
import './VideoPlayback.css'

interface VideoPlaybackProps {
  className?: string
}

export function VideoPlayback({ className }: VideoPlaybackProps) {
  const {
    tracks,
    playhead,
    duration,
    isPlaying,
    setPlayhead,
    setIsPlaying,
    setDuration,
  } = useEditorStore()
  
  const [volume, setVolume] = useState(0.25)
  const videoDurationRef = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [playerSize, setPlayerSize] = useState({ width: 1920, height: 1080 })

  // Convert tracks to projectData format for LivePlayer
  const projectData = useMemo(() => {
    return convertTracksToProjectData(tracks, playerSize)
  }, [tracks, playerSize])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const element = containerRef.current
    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      setPlayerSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      )
    }
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(element)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Check if we have any media to play (including text clips)
  const hasMedia = useMemo(() => {
    return tracks.some(track => 
      track.clips.some(clip => clip.videoUrl || clip.audioUrl || clip.imageUrl || clip.type === 'text')
    )
  }, [tracks])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleFullscreen = () => {
    // Fullscreen implementation
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  // Handle duration change from LivePlayer
  const handleDurationChange = useCallback((newDuration: number) => {
    videoDurationRef.current = newDuration
    if (newDuration > 0) {
      setDuration(newDuration)
    }
  }, [setDuration])

  // Handle time update from LivePlayer
  const handleTimeUpdate = useCallback((time: number) => {
    if (videoDurationRef.current && time >= videoDurationRef.current) {
      setIsPlaying(false)
      setPlayhead(videoDurationRef.current)
    } else {
      setPlayhead(time)
    }
  }, [setPlayhead, setIsPlaying])

  return (
    <div
      ref={containerRef}
      className={`relative bg-flick-primary overflow-hidden border border-flick-border rounded ${className}`}
      style={{ position: 'relative' }}
    >
      {hasMedia ? (
        <div className="video-playback-wrapper" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
          <LivePlayer
            projectData={projectData}
            onDurationChange={handleDurationChange}
            videoSize={playerSize}
            onTimeUpdate={handleTimeUpdate}
            playing={isPlaying}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-flick-text-muted p-8 bg-flick-secondary">
          <div className="text-sm font-medium mb-1">No media loaded</div>
          <div className="text-xs text-center text-flick-text-light">
            Add video or audio clips to the timeline to preview
          </div>
        </div>
      )}

      {/* Minimal Controls Overlay - Only show on hover */}
      {hasMedia && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>

            <div className="flex items-center gap-1.5 text-white text-xs font-mono">
              <span>{formatTimecode(playhead)}</span>
              <span className="text-white/40">/</span>
              <span>{formatTimecode(duration)}</span>
            </div>

            <div className="flex-1 h-0.5 bg-white/20 relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const progress = Math.max(0, Math.min(1, x / rect.width))
                const newTime = progress * duration
                setPlayhead(newTime)
              }}
            >
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${(playhead / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-white/80" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-0.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            <button
              onClick={handleFullscreen}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
