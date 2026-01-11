import { useState, useEffect } from 'react'
import { LivePlayerProvider } from '@twick/live-player'
import { TimelineProvider } from '@twick/timeline'
import { Timeline } from './components/Timeline/Timeline'
import { NodeGraph } from './components/NodeGraph/NodeGraph'
import { CanvasView } from './components/NodeGraph/CanvasView'
import { VideoPlayback } from './components/Playback/VideoPlayback'
import { EditorToolbar } from './components/Toolbar/EditorToolbar'
import { ChatPanel } from './components/Chat/ChatPanel'
import { TextEditPanel } from './components/TextEditor/TextEditPanel'
import { useEditorStore } from './store/editorStore'
import { Workflow } from 'lucide-react'
import { getRandomVideoUrl, getVideoDuration } from './utils/videoLoader'
import clsx from 'clsx'

// Initial timeline data for Twick
const INITIAL_TIMELINE_DATA = {
  tracks: [],
  version: 1,
}

function App() {
  const [activePanel, setActivePanel] = useState<'timeline' | 'nodegraph'>('timeline')
  const { isPlaying, playhead, duration, setPlayhead, setIsPlaying, viewMode } = useEditorStore()

  // Auto-load a random video on mount
  useEffect(() => {
    const loadRandomVideo = async () => {
      const currentTracks = useEditorStore.getState().tracks
      
      // Check if there are already clips
      const hasClips = currentTracks.some(track => track.clips.length > 0)
      if (hasClips) return // Don't auto-load if user already has content

      const videoTrack = currentTracks.find(t => t.type === 'video')
      if (!videoTrack) return

      try {
        const randomUrl = getRandomVideoUrl()
        const videoDuration = await getVideoDuration(randomUrl)
        const filename = randomUrl.split('/').pop()?.split('?')[0] || 'Sample Video'

        const state = useEditorStore.getState()
        state.addClip(videoTrack.id, {
          name: filename,
          type: 'video',
          startTime: 0,
          duration: videoDuration,
          trimStart: 0,
          trimEnd: videoDuration,
          videoUrl: randomUrl,
        })

        state.setDuration(Math.max(state.duration, videoDuration))
      } catch (error) {
        console.error('Failed to load random video:', error)
      }
    }

    // Small delay to ensure tracks are initialized
    const timer = setTimeout(loadRandomVideo, 500)
    return () => clearTimeout(timer)
  }, []) // Only run once on mount

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Spacebar to play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }

      // Arrow keys for scrubbing
      if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPlayhead(Math.max(0, playhead - 1))
      }
      if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPlayhead(Math.min(duration, playhead + 1))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, playhead, duration, setPlayhead, setIsPlaying])

  // Canvas mode: Full node graph view (Flick's creation interface)
  if (viewMode === 'canvas') {
    return (
      <div className="h-screen flex flex-col bg-flick-primary overflow-hidden">
        {/* Top Header Bar - Flick Style */}
        <div className="flex items-center justify-between px-6 py-3 bg-flick-primary border-b border-flick-border">
          <div className="flex items-center gap-4">
            <div className="text-base font-semibold text-flick-text">FLICK</div>
            <div className="flex items-center gap-2 text-sm text-flick-text-muted">
              <span>My First Story</span>
              <div className="w-5 h-5 rounded-full bg-flick-border flex items-center justify-center text-xs">N</div>
            </div>
            <div className="text-xs text-flick-text-muted">16:9</div>
          </div>
        </div>

        {/* Main Content Area - Canvas View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Canvas Area - Full width */}
          <div className="flex-1 overflow-hidden">
            <CanvasView />
          </div>

          {/* Right Sidebar - AI Chat */}
          <div className="w-80 flex-shrink-0 bg-flick-primary flex flex-col relative">
            <ChatPanel />
          </div>
        </div>
      </div>
    )
  }
  
  // Editor mode: Timeline editor (our video editor interface)
  return (
    <LivePlayerProvider>
      <TimelineProvider
        contextId="flick-studio"
        resolution={{ width: 1920, height: 1080 }}
        initialData={INITIAL_TIMELINE_DATA}
        analytics={{ enabled: false }}
      >
        <div className="h-screen flex flex-col bg-flick-primary overflow-hidden">
          {/* Top Header Bar - Flick Style */}
          <div className="flex items-center justify-between px-6 py-3 bg-flick-primary border-b border-flick-border">
            <div className="flex items-center gap-4">
              <div className="text-base font-semibold text-flick-text">FLICK</div>
              <div className="flex items-center gap-2 text-sm text-flick-text-muted">
                <span>My First Story</span>
                <div className="w-5 h-5 rounded-full bg-flick-border flex items-center justify-center text-xs">N</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-mono text-flick-text-muted">
                {playhead.toFixed(2)}s / {duration.toFixed(2)}s
              </div>
              {isPlaying && (
                <div className="flex items-center gap-2 text-flick-text text-xs">
                  <div className="w-1.5 h-1.5 bg-flick-text rounded-full animate-pulse" />
                  <span>Playing</span>
                </div>
              )}
              {/* Chat button removed - chat is in sidebar */}
            </div>
          </div>

          {/* Main Content Area - Two Panel Layout */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Central Canvas - Video Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-flick-primary">
              {/* Video Playback - Takes most of the space */}
              <div className="flex-1 overflow-hidden min-h-0 bg-flick-primary p-6">
                <VideoPlayback className="w-full h-full border border-flick-border rounded-sm" />
              </div>

              {/* Minimal Toolbar */}
              <div className="flex-shrink-0 border-t border-flick-border bg-flick-primary relative">
                <EditorToolbar />
                <TextEditPanel />
              </div>

              {/* Timeline or Node Graph */}
              <div className="flex-1 min-h-[280px] max-h-[400px] overflow-hidden border-t border-flick-border bg-flick-primary">
                {/* Panel Tabs */}
                <div className="flex items-center gap-0 px-4 pt-2 bg-flick-primary border-b border-flick-border">
                  <button
                    onClick={() => setActivePanel('timeline')}
                    className={clsx(
                      'px-4 py-2 text-xs font-medium transition-colors border-b-2',
                      activePanel === 'timeline'
                        ? 'border-flick-text text-flick-text'
                        : 'border-transparent text-flick-text-muted hover:text-flick-text'
                    )}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActivePanel('nodegraph')}
                    className={clsx(
                      'px-4 py-2 text-xs font-medium transition-colors border-b-2 flex items-center gap-2',
                      activePanel === 'nodegraph'
                        ? 'border-flick-text text-flick-text'
                        : 'border-transparent text-flick-text-muted hover:text-flick-text'
                    )}
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    Node Graph
                  </button>
                </div>

                {/* Panel Content */}
                <div className="h-full bg-flick-primary">
                  {activePanel === 'timeline' && <Timeline />}
                  {activePanel === 'nodegraph' && <NodeGraph />}
                </div>
              </div>
            </div>

            {/* Right Sidebar - AI Chat */}
            <div className="w-80 flex-shrink-0 bg-flick-primary flex flex-col relative">
              <ChatPanel />
            </div>
          </div>

          {/* Bottom Toolbar removed */}
        </div>
      </TimelineProvider>
    </LivePlayerProvider>
  )
}

export default App
