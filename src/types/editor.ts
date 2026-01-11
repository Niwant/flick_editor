export interface Clip {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'text' | 'effect'
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  videoUrl?: string
  audioUrl?: string
  imageUrl?: string
  text?: string
  effects?: Effect[]
  properties?: Record<string, any>
}

export interface Effect {
  id: string
  type: 'blur' | 'color-correction' | 'transition' | 'filter' | 'custom'
  name: string
  parameters: Record<string, any>
  startTime: number
  duration: number
}

export interface Track {
  id: string
  name: string
  type: 'video' | 'audio'
  clips: Clip[]
  height: number
  muted: boolean
  locked: boolean
  solo: boolean
}

export interface TimelineState {
  tracks: Track[]
  playhead: number
  duration: number
  isPlaying: boolean
  zoom: number
  fps: number
  selectedClipId: string | null
  selectedClipIds: string[]
  hoveredClipId: string | null
}

export interface CanvasElement {
  id: string
  type: 'video' | 'image' | 'text' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  properties: Record<string, any>
}

export interface NodeGraphNode {
  id: string
  type: 'input' | 'output' | 'effect' | 'transform' | 'composite' | 'instruction' | 'content'
  label: string
  position: { x: number; y: number }
  inputs: NodePort[]
  outputs: NodePort[]
  properties: Record<string, any>
  // For content nodes (image/video thumbnails)
  thumbnailUrl?: string
  status?: 'ready' | 'processing' | 'completed' | 'error'
  instructionText?: string // For instruction nodes
}

export interface NodePort {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'number' | 'color' | 'vector'
  value?: any
}

export interface NodeGraphConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}
