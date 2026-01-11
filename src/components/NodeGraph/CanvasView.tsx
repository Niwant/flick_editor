import { useEffect, useState } from 'react'
import { NodeGraph } from './NodeGraph'
import { CanvasToolbar } from './CanvasToolbar'
import { useEditorStore } from '../../store/editorStore'
import { generateOnboardingNodes, generateRandomVideoNodes, generateFlowConnections } from '../../utils/nodeGenerator'
import { extractFlows, mapFlowsToTimeline } from '../../utils/flowMapper'
import { Track } from '../../types/editor'

export function CanvasView() {
  const { setViewMode } = useEditorStore()
  const [zoom, setZoom] = useState(72)
  
  // Initialize with sample nodes and connections if empty
  useEffect(() => {
    const store = useEditorStore.getState()
    if (store.nodes.length === 0) {
      const sampleNodes = generateOnboardingNodes()
      
      // Add all nodes first (with their original IDs)
      sampleNodes.forEach(node => {
        store.addNode(node)
      })
      
      // Generate connections using the original sampleNodes array (they have the same IDs)
      const connections = generateFlowConnections(sampleNodes)
      
      // Add connections
      connections.forEach(conn => {
        store.addConnection(conn)
      })
    }
  }, [])
  
  const handleAddNode = () => {
    // Add a random video node for now
    const randomNodes = generateRandomVideoNodes(1)
    const store = useEditorStore.getState()
    randomNodes.forEach(node => {
      store.addNode(node)
    })
  }
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }
  
  const handleOpenEditor = () => {
    const store = useEditorStore.getState()

    // Extract flows from the canvas
    const flows = extractFlows(store.nodes, store.connections)
    
    // Map flows to timeline tracks and clips
    const { tracks: newTracks, clips } = mapFlowsToTimeline(flows)
    
    // Build final tracks with clips pre-attached
    const finalTracks: Track[] = []
    
    newTracks.forEach((track) => {
      // Find clips for this track
      const trackClips = clips
        .filter(({ trackId }) => trackId === track.id)
        .map(({ clip }, index) => ({
          ...clip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        }))
      
      finalTracks.push({
        id: track.id,
        name: track.name,
        type: track.type,
        clips: trackClips,
        height: track.height,
        muted: false,
        locked: false,
        solo: false,
      })
    })
    
    // Remove existing tracks (but keep at least one due to removeTrack limitation)
    const currentTrackIds = [...store.tracks.map(t => t.id)]
    // Remove from back to front to avoid index issues
    for (let i = currentTrackIds.length - 1; i >= 1; i--) {
      store.removeTrack(currentTrackIds[i])
    }
    
    // Add new tracks with clips (using updateTrack to set clips directly, avoiding history saves per clip)
    finalTracks.forEach(track => {
      store.addTrack(track.type)
      const currentTracks = useEditorStore.getState().tracks
      const addedTrack = currentTracks[currentTracks.length - 1]
      if (addedTrack) {
        // Update track with name and clips in one call (updateTrack doesn't trigger history saves)
        store.updateTrack(addedTrack.id, {
          name: track.name,
          clips: track.clips,
        })
      }
    })
    
    // Remove the last old track if we added new ones
    if (finalTracks.length > 0 && currentTrackIds.length > 0) {
      const currentTracks = useEditorStore.getState().tracks
      const oldTrack = currentTracks.find(t => currentTrackIds.includes(t.id))
      if (oldTrack) {
        store.removeTrack(oldTrack.id)
      }
    }

    // Ensure playback is stopped when entering the editor
    store.setIsPlaying(false)

    // Switch to editor view
    setViewMode('editor')
  }
  
  return (
    <div className="flex flex-col h-full bg-flick-primary">
      {/* Canvas Graph Area */}
      <div className="flex-1 overflow-hidden relative">
        <NodeGraph />
      </div>
      
      {/* Bottom Toolbar */}
      <div className="flex justify-center pb-4">
        <CanvasToolbar 
          onAddNode={handleAddNode}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onOpenEditor={handleOpenEditor}
        />
      </div>
    </div>
  )
}
