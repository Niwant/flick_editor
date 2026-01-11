import { useState, useRef } from 'react'
import { 
  Upload, 
  Video, 
  Music, 
  Scissors,
  Trash2,
  Link2,
  Shuffle,
  Copy,
  Undo2,
  Redo2,
  Type,
} from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { getRandomVideoUrl, getVideoDuration } from '../../utils/videoLoader'
import clsx from 'clsx'

export function EditorToolbar() {
  const { 
    addTrack, 
    addClip, 
    selectedClipId, 
    tracks, 
    splitClip, 
    playhead, 
    removeClip, 
    selectClip, 
    setDuration,
    updateClip,
    cloneClip,
    trimClip,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'media' | 'tools' | 'effects'>('media')
  const [videoUrl, setVideoUrl] = useState('')
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedTrack = selectedClipId
    ? tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    : null
  const selectedClip = selectedClipId
    ? selectedTrack?.clips.find(c => c.id === selectedClipId) || null
    : null

  const motionEffectOptions = [
    { id: 'none', label: 'None', value: null },
    { id: 'fade', label: 'Fade', value: { name: 'fade', animate: 'both', interval: 0.25 } },
    { id: 'rise', label: 'Rise', value: { name: 'rise', animate: 'both', direction: 'up', interval: 0.25, intensity: 200 } },
    { id: 'breathe', label: 'Breathe', value: { name: 'breathe', mode: 'in', intensity: 0.5 } },
    { id: 'succession', label: 'Succession', value: { name: 'succession', animate: 'both', interval: 0.25 } },
    { id: 'blur', label: 'Blur', value: { name: 'blur', animate: 'both', interval: 0.25, intensity: 25 } },
    { id: 'photo-zoom', label: 'Photo Zoom', value: { name: 'photo-zoom', mode: 'in', intensity: 1.2 } },
    { id: 'photo-rise', label: 'Photo Rise', value: { name: 'photo-rise', direction: 'up', intensity: 200 } },
  ]
  const textEffectOptions = [
    { id: 'none', label: 'None', value: null },
    { id: 'typewriter', label: 'Typewriter', value: { name: 'typewriter', bufferTime: 0.1 } },
    { id: 'stream-word', label: 'Stream Word', value: { name: 'stream-word', bufferTime: 0.1 } },
    { id: 'erase', label: 'Erase', value: { name: 'erase', bufferTime: 0.1 } },
    { id: 'elastic', label: 'Elastic', value: { name: 'elastic' } },
  ]
  const filterOptions = [
    { id: 'none', label: 'None', value: null },
    { id: 'saturated', label: 'Saturated', value: 'saturated' },
    { id: 'bright', label: 'Bright', value: 'bright' },
    { id: 'vibrant', label: 'Vibrant', value: 'vibrant' },
    { id: 'retro', label: 'Retro', value: 'retro' },
    { id: 'blackWhite', label: 'Black & White', value: 'blackWhite' },
    { id: 'cool', label: 'Cool', value: 'cool' },
    { id: 'warm', label: 'Warm', value: 'warm' },
    { id: 'cinematic', label: 'Cinematic', value: 'cinematic' },
    { id: 'softGlow', label: 'Soft Glow', value: 'softGlow' },
    { id: 'moody', label: 'Moody', value: 'moody' },
    { id: 'dreamy', label: 'Dreamy', value: 'dreamy' },
    { id: 'inverted', label: 'Inverted', value: 'inverted' },
    { id: 'vintage', label: 'Vintage', value: 'vintage' },
    { id: 'dramatic', label: 'Dramatic', value: 'dramatic' },
    { id: 'faded', label: 'Faded', value: 'faded' },
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const videoTrack = tracks.find(t => t.type === 'video') || tracks[0]
    if (!videoTrack) return

    for (const file of files) {
      const url = URL.createObjectURL(file)
      const isVideo = file.type.startsWith('video/')
      const isAudio = file.type.startsWith('audio/')
      const isImage = file.type.startsWith('image/')

      if (isVideo || isAudio || isImage) {
        const duration = isVideo ? 30 : isAudio ? 30 : 5
        
        const lastClipEnd = videoTrack.clips.length > 0
          ? Math.max(...videoTrack.clips.map(c => c.startTime + c.duration))
          : 0

        addClip(videoTrack.id, {
          name: file.name,
          type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
          startTime: lastClipEnd,
          duration,
          trimStart: 0,
          trimEnd: duration,
          videoUrl: (isVideo || isImage) ? url : undefined,
          audioUrl: isAudio ? url : undefined,
          imageUrl: isImage ? url : undefined,
        })
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddVideoTrack = () => addTrack('video')
  const handleAddAudioTrack = () => addTrack('audio')

  const handleAddText = () => {
    const clipTrack =
      selectedClipId
        ? tracks.find(t => t.clips.some(c => c.id === selectedClipId))
        : null
    const targetTrack =
      clipTrack || tracks.find(t => t.type === 'video') || tracks[0]
    if (!targetTrack) return

    // Create text clip at current playhead position
    addClip(targetTrack.id, {
      name: 'Text',
      type: 'text',
      startTime: playhead,
      duration: 5, // Default 5 seconds
      trimStart: 0,
      trimEnd: 5,
      text: 'Sample Text',
      properties: {
        fontSize: 48,
        color: '#ffffff',
        fontFamily: 'Arial',
        x: 0.5, // Center horizontally (0-1)
        y: 0.5, // Center vertically (0-1)
        alignment: 'center',
      },
    })
  }

  const handleLoadVideoFromUrl = async (url: string) => {
    if (!url.trim()) return

    setIsLoadingUrl(true)
    try {
      // Find or create video track
      let videoTrack = tracks.find(t => t.type === 'video')
      if (!videoTrack) {
        addTrack('video')
        // Wait a bit for track to be created
        await new Promise(resolve => setTimeout(resolve, 100))
        videoTrack = useEditorStore.getState().tracks.find(t => t.type === 'video')
      }

      if (!videoTrack) {
        console.error('Failed to create video track')
        return
      }

      // Get video duration
      const duration = await getVideoDuration(url)

      // Find last clip end time
      const lastClipEnd = videoTrack.clips.length > 0
        ? Math.max(...videoTrack.clips.map(c => c.startTime + c.duration))
        : 0

      // Extract filename from URL
      const filename = url.split('/').pop()?.split('?')[0] || 'Video from URL'

      // Add clip to timeline
      addClip(videoTrack.id, {
        name: filename,
        type: 'video',
        startTime: lastClipEnd,
        duration: duration,
        trimStart: 0,
        trimEnd: duration,
        videoUrl: url,
      })

      // Update timeline duration if needed
      const newEndTime = lastClipEnd + duration
      const currentDuration = useEditorStore.getState().duration
      if (newEndTime > currentDuration) {
        setDuration(newEndTime)
      }

      setVideoUrl('')
    } catch (error) {
      console.error('Error loading video from URL:', error)
      alert('Failed to load video from URL. Please check the URL and try again.')
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleLoadRandomVideo = async () => {
    const randomUrl = getRandomVideoUrl()
    setVideoUrl(randomUrl)
    await handleLoadVideoFromUrl(randomUrl)
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (videoUrl.trim()) {
      await handleLoadVideoFromUrl(videoUrl.trim())
    }
  }

  const handleSplitClip = () => {
    if (!selectedClipId) return
    const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    if (track) {
      splitClip(track.id, selectedClipId, playhead)
    }
  }

  const handleDeleteClip = () => {
    if (!selectedClipId) return
    const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    if (track) {
      removeClip(track.id, selectedClipId)
      selectClip(null)
    }
  }

  const handleCloneClip = () => {
    if (!selectedClipId) return
    const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    if (track) {
      cloneClip(track.id, selectedClipId)
    }
  }

  const handleTrimClipStart = () => {
    if (!selectedClipId) return
    const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    const clip = track?.clips.find(c => c.id === selectedClipId)
    if (track && clip) {
      // Trim from start to playhead
      if (playhead > clip.startTime && playhead < clip.startTime + clip.duration) {
        trimClip(track.id, selectedClipId, playhead, undefined)
      }
    }
  }

  const handleTrimClipEnd = () => {
    if (!selectedClipId) return
    const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    const clip = track?.clips.find(c => c.id === selectedClipId)
    if (track && clip) {
      // Trim from playhead to end
      if (playhead > clip.startTime && playhead < clip.startTime + clip.duration) {
        trimClip(track.id, selectedClipId, undefined, playhead)
      }
    }
  }

  const setSelectedClipProperty = (key: 'animation' | 'textEffect' | 'mediaFilter', value: any) => {
    if (!selectedClip || !selectedTrack) return
    const nextProperties = { ...(selectedClip.properties || {}) }
    if (value) {
      nextProperties[key] = value
    } else {
      delete nextProperties[key]
    }
    updateClip(selectedTrack.id, selectedClip.id, { properties: nextProperties })
  }

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-flick-primary border-b border-flick-border">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveTab('media')}
          className={clsx(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === 'media'
              ? 'text-flick-text'
              : 'text-flick-text-muted hover:text-flick-text'
          )}
        >
          Media
        </button>
        <div className="w-px h-4 bg-flick-border mx-2" />
        <button
          onClick={() => setActiveTab('tools')}
          className={clsx(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === 'tools'
              ? 'text-flick-text'
              : 'text-flick-text-muted hover:text-flick-text'
          )}
        >
          Tools
        </button>
        <div className="w-px h-4 bg-flick-border mx-2" />
        <button
          onClick={() => setActiveTab('effects')}
          className={clsx(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            activeTab === 'effects'
              ? 'text-flick-text'
              : 'text-flick-text-muted hover:text-flick-text'
          )}
        >
          Effects
        </button>
      </div>

      <div className="flex items-center gap-2">
        {activeTab === 'media' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-flick-text border border-flick-border hover:bg-flick-secondary transition-colors rounded"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
            
            {/* URL Input Form */}
            <form onSubmit={handleUrlSubmit} className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 border border-flick-border rounded">
                <Link2 className="w-3.5 h-3.5 text-flick-text-muted" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste video URL..."
                  className="w-48 px-2 py-0.5 text-xs bg-transparent text-flick-text placeholder-flick-text-light focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!videoUrl.trim() || isLoadingUrl}
                  className="px-2 py-0.5 text-xs text-flick-text hover:text-flick-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Load
                </button>
              </div>
            </form>

            <button
              onClick={handleLoadRandomVideo}
              disabled={isLoadingUrl}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-flick-text border border-flick-border hover:bg-flick-secondary transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Load a random sample video"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Random Video
            </button>

            <div className="w-px h-4 bg-flick-border" />

            <button
              onClick={handleAddVideoTrack}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </button>
            <button
              onClick={handleAddAudioTrack}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              Audio
            </button>
            <button
              onClick={handleAddText}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors"
              title="Add text overlay"
            >
              <Type className="w-3.5 h-3.5" />
              Text
            </button>
          </>
        )}

        {activeTab === 'tools' && (
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                Redo
              </button>
            </div>
            
            <div className="w-px h-4 bg-flick-border" />
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleSplitClip}
                disabled={!selectedClipId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Split clip at playhead (S)"
              >
                <Scissors className="w-3.5 h-3.5" />
                Split
              </button>
              <button
                onClick={handleCloneClip}
                disabled={!selectedClipId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clone selected clip (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
                Clone
              </button>
              <button
                onClick={handleTrimClipStart}
                disabled={!selectedClipId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Trim clip start to playhead"
              >
                <Scissors className="w-3.5 h-3.5 rotate-90" />
                Trim Start
              </button>
              <button
                onClick={handleTrimClipEnd}
                disabled={!selectedClipId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Trim clip end to playhead"
              >
                <Scissors className="w-3.5 h-3.5 -rotate-90" />
                Trim End
              </button>
              <button
                onClick={handleDeleteClip}
                disabled={!selectedClipId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-flick-text-muted hover:text-flick-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete selected clip (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}

        {activeTab === 'effects' && (
          <div className="flex items-center gap-4 text-xs text-flick-text-muted">
            {!selectedClip && (
              <span>Select a clip to apply effects</span>
            )}
            {selectedClip && selectedClip.type === 'audio' && (
              <span>Effects are not available for audio clips</span>
            )}
            {selectedClip && selectedClip.type !== 'audio' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-flick-text-muted">Motion</span>
                  <select
                    value={selectedClip.properties?.animation?.name || 'none'}
                    onChange={(e) => {
                      const option = motionEffectOptions.find(item => item.id === e.target.value)
                      setSelectedClipProperty('animation', option?.value || null)
                    }}
                    className="px-2 py-1 bg-flick-primary border border-flick-border rounded text-xs text-flick-text"
                  >
                    {motionEffectOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
                  <div className="flex items-center gap-2">
                    <span className="text-flick-text-muted">Filter</span>
                    <select
                      value={selectedClip.properties?.mediaFilter || 'none'}
                      onChange={(e) => {
                        const option = filterOptions.find(item => item.id === e.target.value)
                        setSelectedClipProperty('mediaFilter', option?.value || null)
                      }}
                      className="px-2 py-1 bg-flick-primary border border-flick-border rounded text-xs text-flick-text"
                    >
                      {filterOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedClip.type === 'text' && (
                  <div className="flex items-center gap-2">
                    <span className="text-flick-text-muted">Text</span>
                    <select
                      value={selectedClip.properties?.textEffect?.name || 'none'}
                      onChange={(e) => {
                        const option = textEffectOptions.find(item => item.id === e.target.value)
                        setSelectedClipProperty('textEffect', option?.value || null)
                      }}
                      className="px-2 py-1 bg-flick-primary border border-flick-border rounded text-xs text-flick-text"
                    >
                      {textEffectOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
