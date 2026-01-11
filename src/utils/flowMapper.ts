import { NodeGraphNode, NodeGraphConnection, Track, Clip } from '../types/editor'

/**
 * Traverse a flow starting from a node and collect all connected nodes in sequence
 */
function traverseFlow(
  startNode: NodeGraphNode,
  nodes: NodeGraphNode[],
  connections: NodeGraphConnection[],
  visited: Set<string>
): NodeGraphNode[] {
  const flow: NodeGraphNode[] = [startNode]
  visited.add(startNode.id)
  
  // Find next node in the flow by following connections
  let currentNode = startNode
  while (true) {
    // Find outgoing connections from current node
    const outgoingConn = connections.find(
      conn => conn.sourceNodeId === currentNode.id
    )
    
    if (!outgoingConn) break
    
    // Find the target node
    const nextNode = nodes.find(n => n.id === outgoingConn.targetNodeId)
    if (!nextNode || visited.has(nextNode.id)) break
    
    flow.push(nextNode)
    visited.add(nextNode.id)
    currentNode = nextNode
  }
  
  return flow
}

/**
 * Extract all flows from the node graph
 * A flow is a sequence of connected nodes starting from a node with no incoming connections
 */
export function extractFlows(
  nodes: NodeGraphNode[],
  connections: NodeGraphConnection[]
): NodeGraphNode[][] {
  const flows: NodeGraphNode[][] = []
  const visited = new Set<string>()
  
  // Filter to only content nodes (ignore instruction nodes)
  const contentNodes = nodes.filter(node => node.type === 'content')
  
  // Find starting nodes (nodes with no incoming connections)
  const startingNodes = contentNodes.filter(node => {
    return !connections.some(conn => conn.targetNodeId === node.id)
  })
  
  // Traverse each flow starting from each starting node
  for (const startNode of startingNodes) {
    if (!visited.has(startNode.id)) {
      const flow = traverseFlow(startNode, contentNodes, connections, visited)
      if (flow.length > 0) {
        flows.push(flow)
      }
    }
  }
  
  return flows
}

/**
 * Map flows to timeline tracks and clips
 * - Each flow gets its own set of tracks
 * - First video in a flow → new track at 0s
 * - Second video in same flow → new track at 10s
 * - Videos from different flows → separate tracks at 0s
 */
export function mapFlowsToTimeline(
  flows: NodeGraphNode[][]
): { tracks: Track[]; clips: Array<{ trackId: string; clip: Omit<Clip, 'id'> }> } {
  const tracks: Track[] = []
  const clips: Array<{ trackId: string; clip: Omit<Clip, 'id'> }> = []
  let trackCounter = 1
  
  for (const flow of flows) {
    // Filter to only video nodes in this flow
    // A node is a video node if it has a video output AND a videoUrl in properties
    const videoNodes = flow.filter(node => {
      const hasVideoOutput = node.outputs?.some(output => output.type === 'video')
      const videoUrl = node.properties?.videoUrl
      const hasVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.length > 0
      return hasVideoOutput && hasVideoUrl
    })
    
    if (videoNodes.length === 0) continue
    
    // First video in the flow → Track at 0s
    if (videoNodes.length >= 1) {
      const firstVideo = videoNodes[0]
      const trackId = `track-video-${trackCounter++}`
      
      tracks.push({
        id: trackId,
        name: `Video Track ${tracks.length + 1}`,
        type: 'video',
        clips: [],
        height: 80,
        muted: false,
        locked: false,
        solo: false,
      })
      
      clips.push({
        trackId,
        clip: {
          startTime: 0,
          duration: 10, // Default duration, could be calculated from video metadata
          videoUrl: firstVideo.properties?.videoUrl || '',
          type: 'video',
          name: firstVideo.label || 'Video Clip',
          trimStart: 0,
          trimEnd: 0,
          effects: [],
        },
      })
    }
    
    // Second video in same flow → New track at 10s
    if (videoNodes.length >= 2) {
      const secondVideo = videoNodes[1]
      const trackId = `track-video-${trackCounter++}`
      
      tracks.push({
        id: trackId,
        name: `Video Track ${tracks.length + 1}`,
        type: 'video',
        clips: [],
        height: 80,
        muted: false,
        locked: false,
        solo: false,
      })
      
      clips.push({
        trackId,
        clip: {
          startTime: 10, // 10s gap from start
          duration: 10, // Default duration
          videoUrl: secondVideo.properties?.videoUrl || '',
          type: 'video',
          name: secondVideo.label || 'Video Clip',
          trimStart: 0,
          trimEnd: 0,
          effects: [],
        },
      })
    }
    
    // If there are more videos in the flow, they would follow the same pattern
    // Third video → new track at 20s, etc.
    for (let i = 2; i < videoNodes.length; i++) {
      const video = videoNodes[i]
      const trackId = `track-video-${trackCounter++}`
      
      tracks.push({
        id: trackId,
        name: `Video Track ${tracks.length + 1}`,
        type: 'video',
        clips: [],
        height: 80,
        muted: false,
        locked: false,
        solo: false,
      })
      
      clips.push({
        trackId,
        clip: {
          startTime: 10 * (i + 1), // 20s, 30s, etc.
          duration: 10,
          videoUrl: video.properties?.videoUrl || '',
          type: 'video',
          name: video.label || 'Video Clip',
          trimStart: 0,
          trimEnd: 0,
          effects: [],
        },
      })
    }
  }
  
  return { tracks, clips }
}
