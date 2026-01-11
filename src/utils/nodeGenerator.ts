import { NodeGraphNode } from '../types/editor'
import { getRandomVideoUrl, SAMPLE_VIDEO_URLS } from './videoLoader'

// Sample image URLs for thumbnails (you can replace with actual image URLs)
const SAMPLE_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', // Forest
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400', // Nature
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', // Landscape
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', // Mountain
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', // Path
]

// Generate instruction nodes (like Flick's onboarding nodes)
export function createInstructionNode(
  label: string,
  instructionText: string,
  position: { x: number; y: number },
  outputTypes: string[] = ['image']
): NodeGraphNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'instruction',
    label,
    position,
    inputs: [],
    outputs: outputTypes.map((type, idx) => ({
      id: `out-${idx}`,
      name: type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'Output',
      type: type as any,
    })),
    properties: {},
    instructionText,
  }
}

// Generate content nodes (image/video thumbnails)
export function createContentNode(
  label: string,
  position: { x: number; y: number },
  type: 'image' | 'video',
  thumbnailUrl?: string,
  videoUrl?: string,
  status: 'ready' | 'processing' | 'completed' | 'error' = 'ready'
): NodeGraphNode {
  const randomImage = SAMPLE_IMAGE_URLS[Math.floor(Math.random() * SAMPLE_IMAGE_URLS.length)]
  
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'content',
    label,
    position,
    inputs: [{
      id: 'in-0',
      name: 'Input',
      type: type === 'video' ? 'video' : 'image',
    }],
    outputs: [{
      id: 'out-0',
      name: type === 'video' ? 'Video' : 'Image',
      type,
      value: videoUrl || thumbnailUrl,
    }],
    properties: {
      videoUrl,
      thumbnailUrl: thumbnailUrl || randomImage,
    },
    thumbnailUrl: thumbnailUrl || randomImage,
    status,
  }
}

// Generate instruction nodes and flows
// Instruction nodes are always there (separate from flows)
// Flow 1: Image → Video → Image → Video
// Flow 2: Image → Video (below flow 1)
export function generateOnboardingNodes(): NodeGraphNode[] {
  const nodes: NodeGraphNode[] = []
  
  // Instruction nodes (always present, separate from flows)
  // "Generate your first image" instruction node
  nodes.push(createInstructionNode(
    'Generate your first image',
    `Here is a Text to Image action node ready to run.
Click on it, write a prompt, select a style and run.
You can create this by clicking on the + button in the tool bar at the bottom.`,
    { x: 100, y: 100 },
    ['image']
  ))
  
  // "1. Edit Image" instruction node
  nodes.push(createInstructionNode(
    '1. Edit Image',
    `Select an image node to edit.
Use the editing tools to modify your image.
Apply filters, adjust colors, or crop as needed.`,
    { x: 100, y: 250 },
    ['image']
  ))
  
  // "2. Generate Video" instruction node
  nodes.push(createInstructionNode(
    '2. Generate Video',
    `Upload or select a start frame image.
Click "Generate Video" button.
Optionally add an end frame for keyframe control.`,
    { x: 100, y: 400 },
    ['video']
  ))
  
  // Flow nodes (separate from instruction nodes)
  const startX = 400
  const startY1 = 100  // First flow Y position
  const startY2 = 400  // Second flow Y position (same as instruction node)
  const spacingX = 200
  
  // Get unique random video URLs for each video node
  // Shuffle the array and pick first 3 to ensure uniqueness
  const shuffledVideos = [...SAMPLE_VIDEO_URLS].sort(() => Math.random() - 0.5)
  const videoUrls = [shuffledVideos[0], shuffledVideos[1], shuffledVideos[2]] // Get 3 unique videos
  
  // Flow 1: Image → Video → Image → Video
  // Image 1
  const img1 = createContentNode(
    'Image 1',
    { x: startX, y: startY1 },
    'image',
    SAMPLE_IMAGE_URLS[0]
  )
  nodes.push(img1)
  
  // Video 1
  const vid1 = createContentNode(
    'Video 1',
    { x: startX + spacingX, y: startY1 },
    'video',
    SAMPLE_IMAGE_URLS[1],
    videoUrls[0], // Use first unique video
    'completed'
  )
  nodes.push(vid1)
  
  // Image 2
  const img2 = createContentNode(
    'Image 2',
    { x: startX + spacingX * 2, y: startY1 },
    'image',
    SAMPLE_IMAGE_URLS[2]
  )
  nodes.push(img2)
  
  // Video 2
  const vid2 = createContentNode(
    'Video 2',
    { x: startX + spacingX * 3, y: startY1 },
    'video',
    SAMPLE_IMAGE_URLS[3],
    videoUrls[1], // Use second unique video
    'completed'
  )
  nodes.push(vid2)
  
  // Flow 2: Image → Video (below flow 1, aligned with instruction node)
  // Image 3
  const img3 = createContentNode(
    'Image 3',
    { x: startX, y: startY2 },
    'image',
    SAMPLE_IMAGE_URLS[4]
  )
  nodes.push(img3)
  
  // Video 3
  const vid3 = createContentNode(
    'Video 3',
    { x: startX + spacingX, y: startY2 },
    'video',
    SAMPLE_IMAGE_URLS[0],
    videoUrls[2], // Use third unique video
    'completed'
  )
  nodes.push(vid3)
  
  return nodes
}

// Generate connections for the flows (only connect content nodes, skip instruction nodes)
export function generateFlowConnections(nodes: NodeGraphNode[]): Array<{ sourceNodeId: string; sourcePortId: string; targetNodeId: string; targetPortId: string }> {
  const connections: Array<{ sourceNodeId: string; sourcePortId: string; targetNodeId: string; targetPortId: string }> = []
  
  // Filter to only content nodes (skip instruction nodes)
  const contentNodes = nodes.filter(node => node.type === 'content')
  
  // Flow 1: Image 1 → Video 1 → Image 2 → Video 2 (first 4 content nodes)
  if (contentNodes.length >= 4) {
    // Image 1 → Video 1 (connect output to input)
    if (contentNodes[0].outputs[0] && contentNodes[1].inputs[0]) {
      connections.push({
        sourceNodeId: contentNodes[0].id,
        sourcePortId: contentNodes[0].outputs[0].id,
        targetNodeId: contentNodes[1].id,
        targetPortId: contentNodes[1].inputs[0].id,
      })
    }
    // Video 1 → Image 2 (connect output to input)
    if (contentNodes[1].outputs[0] && contentNodes[2].inputs[0]) {
      connections.push({
        sourceNodeId: contentNodes[1].id,
        sourcePortId: contentNodes[1].outputs[0].id,
        targetNodeId: contentNodes[2].id,
        targetPortId: contentNodes[2].inputs[0].id,
      })
    }
    // Image 2 → Video 2 (connect output to input)
    if (contentNodes[2].outputs[0] && contentNodes[3].inputs[0]) {
      connections.push({
        sourceNodeId: contentNodes[2].id,
        sourcePortId: contentNodes[2].outputs[0].id,
        targetNodeId: contentNodes[3].id,
        targetPortId: contentNodes[3].inputs[0].id,
      })
    }
  }
  
  // Flow 2: Image 3 → Video 3 (next 2 content nodes)
  if (contentNodes.length >= 6) {
    // Image 3 → Video 3 (connect output to input)
    if (contentNodes[4].outputs[0] && contentNodes[5].inputs[0]) {
      connections.push({
        sourceNodeId: contentNodes[4].id,
        sourcePortId: contentNodes[4].outputs[0].id,
        targetNodeId: contentNodes[5].id,
        targetPortId: contentNodes[5].inputs[0].id,
      })
    }
  }
  
  return connections
}

// Generate random nodes with videos for testing
export function generateRandomVideoNodes(count: number = 5): NodeGraphNode[] {
  const nodes: NodeGraphNode[] = []
  
  for (let i = 0; i < count; i++) {
    const videoUrl = getRandomVideoUrl()
    const randomImage = SAMPLE_IMAGE_URLS[Math.floor(Math.random() * SAMPLE_IMAGE_URLS.length)]
    
    nodes.push(createContentNode(
      `Video ${i + 1}`,
      { 
        x: 100 + (i % 4) * 250, 
        y: 100 + Math.floor(i / 4) * 300 
      },
      'video',
      randomImage,
      videoUrl,
      'completed'
    ))
  }
  
  return nodes
}
