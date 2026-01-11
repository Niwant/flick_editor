import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEditorStore } from '../../store/editorStore'
import { CustomNode } from './CustomNode'
import { CanvasNode } from './CanvasNode'

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  canvas: CanvasNode,
}

export function NodeGraph() {
  const { nodes: storeNodes, connections: storeConnections, addConnection } = useEditorStore()

  // Convert store nodes to ReactFlow nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(
    storeNodes.map((node) => ({
      id: node.id,
      type: node.type === 'instruction' || node.type === 'content' ? 'canvas' : 'custom',
      position: node.position,
      data: {
        label: node.label,
        type: node.type,
        inputs: node.inputs,
        outputs: node.outputs,
        properties: node.properties,
        thumbnailUrl: (node as any).thumbnailUrl,
        status: (node as any).status,
        instructionText: (node as any).instructionText,
      },
    }))
  )

  // Convert store connections to ReactFlow edges
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    storeConnections.map((conn) => ({
      id: conn.id,
      source: conn.sourceNodeId,
      target: conn.targetNodeId,
      sourceHandle: conn.sourcePortId,
      targetHandle: conn.targetPortId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#c7c2b8', strokeWidth: 1, strokeDasharray: '3 4' },
    }))
  )

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return
      
      addConnection({
        sourceNodeId: params.source,
        sourcePortId: params.sourceHandle,
        targetNodeId: params.target,
        targetPortId: params.targetHandle,
      })
      
      setEdges((eds) => addEdge(params, eds))
    },
    [addConnection, setEdges]
  )

  // Sync with store when it changes
  useEffect(() => {
    setNodes(
      storeNodes.map((node) => ({
        id: node.id,
        type: node.type === 'instruction' || node.type === 'content' ? 'canvas' : 'custom',
        position: node.position,
        data: {
          label: node.label,
          type: node.type,
          inputs: node.inputs,
          outputs: node.outputs,
          properties: node.properties,
          thumbnailUrl: (node as any).thumbnailUrl,
          status: (node as any).status,
          instructionText: (node as any).instructionText,
        },
      }))
    )

    setEdges(
      storeConnections.map((conn) => ({
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        sourceHandle: conn.sourcePortId,
        targetHandle: conn.targetPortId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#c7c2b8', strokeWidth: 1, strokeDasharray: '3 4' },
      }))
    )
  }, [storeNodes, storeConnections, setNodes, setEdges])

  return (
    <div className="w-full h-full bg-[#f8f6f2]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#f8f6f2]"
        connectionLineStyle={{ stroke: '#c7c2b8', strokeWidth: 1, strokeDasharray: '3 4' }}
        defaultEdgeOptions={{ type: 'smoothstep', animated: false, style: { stroke: '#c7c2b8', strokeWidth: 1, strokeDasharray: '3 4' } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={0.4} color="#e7e0d6" />
        <Controls className="bg-white/80 border-black/10 [&>button]:bg-white [&>button]:border-black/10 [&>button]:text-flick-text hover:[&>button]:bg-black/5" />
        <MiniMap
          className="bg-white/80 border-black/10"
          maskColor="rgba(248, 246, 242, 0.8)"
          nodeColor={(node) => {
            const nodeType = node.data?.type
            switch (nodeType) {
              case 'instruction':
                return '#f7d9c5'
              case 'content':
                return '#ffffff'
              default:
                return '#bdb6aa'
            }
          }}
        />
      </ReactFlow>
    </div>
  )
}
