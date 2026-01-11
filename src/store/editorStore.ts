import { create } from 'zustand'
import { TimelineState, Track, Clip, CanvasElement, NodeGraphNode, NodeGraphConnection } from '../types/editor'

interface HistoryState {
  tracks: Track[]
  selectedClipId: string | null
}

interface EditorStore extends TimelineState {
  // View mode
  viewMode: 'canvas' | 'editor'
  setViewMode: (mode: 'canvas' | 'editor') => void
  
  // Canvas state
  canvasElements: CanvasElement[]
  selectedCanvasElementId: string | null
  
  // Node graph state
  nodes: NodeGraphNode[]
  connections: NodeGraphConnection[]
  selectedNodeId: string | null
  
  // History state
  history: HistoryState[]
  historyIndex: number
  
  // Actions
  setPlayhead: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  setDuration: (duration: number) => void
  
  // Track actions
  addTrack: (type: 'video' | 'audio') => void
  removeTrack: (trackId: string) => void
  updateTrack: (trackId: string, updates: Partial<Track>) => void
  
  // Clip actions
  addClip: (trackId: string, clip: Omit<Clip, 'id'>) => void
  removeClip: (trackId: string, clipId: string) => void
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void
  selectClip: (clipId: string | null) => void
  toggleClipSelection: (clipId: string) => void
  clearClipSelection: () => void
  splitClip: (trackId: string, clipId: string, splitTime: number) => void
  trimClip: (trackId: string, clipId: string, start?: number, end?: number) => void
  cloneClip: (trackId: string, clipId: string) => void
  
  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  _saveToHistory: () => void
  
  // Canvas actions
  addCanvasElement: (element: Omit<CanvasElement, 'id'>) => void
  removeCanvasElement: (elementId: string) => void
  updateCanvasElement: (elementId: string, updates: Partial<CanvasElement>) => void
  selectCanvasElement: (elementId: string | null) => void
  
  // Node graph actions
  addNode: (node: NodeGraphNode | Omit<NodeGraphNode, 'id'>) => void
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, updates: Partial<NodeGraphNode>) => void
  selectNode: (nodeId: string | null) => void
  addConnection: (connection: Omit<NodeGraphConnection, 'id'>) => void
  removeConnection: (connectionId: string) => void
}

const initialTracks: Track[] = [
  {
    id: 'track-video-1',
    name: 'Video Track 1',
    type: 'video',
    clips: [],
    height: 80,
    muted: false,
    locked: false,
    solo: false,
  },
  {
    id: 'track-audio-1',
    name: 'Audio Track 1',
    type: 'audio',
    clips: [],
    height: 60,
    muted: false,
    locked: false,
    solo: false,
  },
]

const createHistoryState = (tracks: Track[], selectedClipId: string | null): HistoryState => ({
  tracks: JSON.parse(JSON.stringify(tracks)), // Deep clone
  selectedClipId,
})

export const useEditorStore = create<EditorStore>((set, get) => ({
  // View mode
  viewMode: 'canvas',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Timeline state
  tracks: initialTracks,
  playhead: 0,
  duration: 60,
  isPlaying: false,
  zoom: 1,
  fps: 30,
  selectedClipId: null,
  selectedClipIds: [],
  hoveredClipId: null,
  
  // Canvas state
  canvasElements: [],
  selectedCanvasElementId: null,
  
  // Node graph state
  nodes: [],
  connections: [],
  selectedNodeId: null,
  
  // History state
  history: [createHistoryState(initialTracks, null)],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  
  // Timeline actions
  setPlayhead: (time) => set({ playhead: Math.max(0, Math.min(time, get().duration)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 10)) }),
  setDuration: (duration) => set({ duration: Math.max(1, duration) }),
  
  // Track actions
  addTrack: (type) => {
    const trackCount = get().tracks.filter(t => t.type === type).length
    const newTrack: Track = {
      id: `track-${type}-${trackCount + 1}`,
      name: `${type === 'video' ? 'Video' : 'Audio'} Track ${trackCount + 1}`,
      type,
      clips: [],
      height: type === 'video' ? 80 : 60,
      muted: false,
      locked: false,
      solo: false,
    }
    set({ tracks: [...get().tracks, newTrack] })
  },
  
  removeTrack: (trackId) => {
    if (get().tracks.length <= 1) return
    set({ tracks: get().tracks.filter(t => t.id !== trackId) })
  },
  
  updateTrack: (trackId, updates) => {
    set({
      tracks: get().tracks.map(t => t.id === trackId ? { ...t, ...updates } : t),
    })
  },
  
  // Helper to save state to history
  _saveToHistory: () => {
    const state = get()
    const currentHistory = state.history.slice(0, state.historyIndex + 1)
    const newHistory = [...currentHistory, createHistoryState(state.tracks, state.selectedClipId)]
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    })
  },
  
  // Clip actions
  addClip: (trackId, clipData) => {
    get()._saveToHistory()
    const clip: Clip = {
      ...clipData,
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    set({
      tracks: get().tracks.map(track =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, clip] }
          : track
      ),
    })
    
    // Update duration if clip extends beyond
    const clipEnd = clip.startTime + clip.duration
    if (clipEnd > get().duration) {
      get().setDuration(clipEnd)
    }
  },
  
  removeClip: (trackId, clipId) => {
    get()._saveToHistory()
    set({
      tracks: get().tracks.map(track =>
        track.id === trackId
          ? { ...track, clips: track.clips.filter(c => c.id !== clipId) }
          : track
      ),
      selectedClipId: get().selectedClipId === clipId ? null : get().selectedClipId,
      selectedClipIds: get().selectedClipIds.filter(id => id !== clipId),
    })
  },
  
  updateClip: (trackId, clipId, updates) => {
    // Only save to history if this is a significant update (not just dragging)
    // For now, save to history for all updates
    get()._saveToHistory()
    set({
      tracks: get().tracks.map(track =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.map(c =>
                c.id === clipId ? { ...c, ...updates } : c
              ),
            }
          : track
      ),
    })
  },
  
  selectClip: (clipId) => set({
    selectedClipId: clipId,
    selectedClipIds: clipId ? [clipId] : [],
  }),

  toggleClipSelection: (clipId) => {
    const { selectedClipIds, selectedClipId } = get()
    if (selectedClipIds.includes(clipId)) {
      const nextSelected = selectedClipIds.filter(id => id !== clipId)
      set({
        selectedClipIds: nextSelected,
        selectedClipId: selectedClipId === clipId
          ? (nextSelected.length > 0 ? nextSelected[nextSelected.length - 1] : null)
          : selectedClipId,
      })
      return
    }
    set({
      selectedClipIds: [...selectedClipIds, clipId],
      selectedClipId: clipId,
    })
  },

  clearClipSelection: () => set({ selectedClipId: null, selectedClipIds: [] }),
  
  splitClip: (trackId, clipId, splitTime) => {
    const track = get().tracks.find(t => t.id === trackId)
    const clip = track?.clips.find(c => c.id === clipId)
    
    if (!clip || splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) {
      return
    }
    
    get()._saveToHistory()
    
    const firstDuration = splitTime - clip.startTime
    const secondStartTime = splitTime
    const secondDuration = clip.duration - firstDuration
    const sourceStart = clip.trimStart
    const sourceEnd = clip.trimEnd > 0 ? clip.trimEnd : clip.trimStart + clip.duration
    const splitOffset = splitTime - clip.startTime
    
    const secondClip: Clip = {
      ...clip,
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: secondStartTime,
      duration: secondDuration,
      trimStart: sourceStart + splitOffset,
      trimEnd: sourceEnd,
    }
    
    set({
      tracks: get().tracks.map(t =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips
                .map(c => (c.id === clipId
                  ? { ...c, duration: firstDuration, trimStart: sourceStart, trimEnd: sourceStart + splitOffset }
                  : c))
                .concat(secondClip),
            }
          : t
      ),
    })
  },
  
  trimClip: (trackId, clipId, start, end) => {
    const track = get().tracks.find(t => t.id === trackId)
    const clip = track?.clips.find(c => c.id === clipId)
    
    if (!clip) return
    
    get()._saveToHistory()
    
    const updates: Partial<Clip> = {}
    if (start !== undefined) {
      const delta = start - clip.startTime
      updates.startTime = start
      updates.trimStart = clip.trimStart + delta
      updates.duration = clip.duration - delta
    }
    if (end !== undefined) {
      updates.duration = end - clip.startTime
      updates.trimEnd = clip.trimEnd - (clip.startTime + clip.duration - end)
    }
    
    set({
      tracks: get().tracks.map(track =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.map(c =>
                c.id === clipId ? { ...c, ...updates } : c
              ),
            }
          : track
      ),
    })
  },
  
  cloneClip: (trackId, clipId) => {
    const state = get()
    const track = state.tracks.find(t => t.id === trackId)
    const clip = track?.clips.find(c => c.id === clipId)
    
    if (!track || !clip) {
      console.warn('cloneClip: Track or clip not found', { trackId, clipId })
      return
    }
    
    get()._saveToHistory()
    
    // Create a new video track
    const videoTrackCount = state.tracks.filter(t => t.type === 'video').length
    const newTrack: Track = {
      id: `track-video-${Date.now()}`,
      name: `Video Track ${videoTrackCount + 1}`,
      type: 'video',
      clips: [],
      height: 80,
      muted: false,
      locked: false,
      solo: false,
    }
    
    // Create cloned clip with the same start time as the original
    const clonedClip: Clip = {
      ...clip,
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${clip.name} (Copy)`,
      // Keep the same startTime, duration, trim values, etc.
    }
    
    // Add the cloned clip to the new track
    newTrack.clips.push(clonedClip)
    
    // Add the new track to the tracks array
    set({ tracks: [...state.tracks, newTrack] })
    
    // Update duration if needed
    const clipEnd = clonedClip.startTime + clonedClip.duration
    if (clipEnd > get().duration) {
      get().setDuration(clipEnd)
    }
  },
  
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      set({
        tracks: JSON.parse(JSON.stringify(previousState.tracks)),
        selectedClipId: previousState.selectedClipId,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      })
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      set({
        tracks: JSON.parse(JSON.stringify(nextState.tracks)),
        selectedClipId: nextState.selectedClipId,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
      })
    }
  },
  
  // Canvas actions
  addCanvasElement: (elementData) => {
    const element: CanvasElement = {
      ...elementData,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    set({ canvasElements: [...get().canvasElements, element] })
  },
  
  removeCanvasElement: (elementId) => {
    set({
      canvasElements: get().canvasElements.filter(e => e.id !== elementId),
      selectedCanvasElementId: get().selectedCanvasElementId === elementId ? null : get().selectedCanvasElementId,
    })
  },
  
  updateCanvasElement: (elementId, updates) => {
    set({
      canvasElements: get().canvasElements.map(e =>
        e.id === elementId ? { ...e, ...updates } : e
      ),
    })
  },
  
  selectCanvasElement: (elementId) => set({ selectedCanvasElementId: elementId }),
  
  // Node graph actions
  addNode: (nodeData) => {
    const node: NodeGraphNode = {
      ...nodeData,
      id: ('id' in nodeData && nodeData.id) ? nodeData.id : `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    set({ nodes: [...get().nodes, node] })
  },
  
  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      connections: get().connections.filter(
        c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      ),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    })
  },
  
  updateNode: (nodeId, updates) => {
    set({
      nodes: get().nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n)),
    })
  },
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  addConnection: (connectionData) => {
    const connection: NodeGraphConnection = {
      ...connectionData,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    set({ connections: [...get().connections, connection] })
  },
  
  removeConnection: (connectionId) => {
    set({ connections: get().connections.filter(c => c.id !== connectionId) })
  },
}))
