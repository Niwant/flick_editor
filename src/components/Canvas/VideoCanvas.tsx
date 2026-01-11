import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '../../store/editorStore'
import { Move, RotateCw, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'

interface VideoCanvasProps {
  className?: string
}

export function VideoCanvas({ className }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { canvasElements, selectedCanvasElementId, updateCanvasElement, selectCanvasElement } = useEditorStore()
  const [zoom, setZoom] = useState(1)
  const [panning, setPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null)

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
      selection: true,
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = canvas

    // Handle object selection
    canvas.on('selection:created', (e) => {
      if (e.selected?.[0]) {
        selectCanvasElement((e.selected[0] as any).elementId || null)
      }
    })

    canvas.on('selection:updated', (e) => {
      if (e.selected?.[0]) {
        selectCanvasElement((e.selected[0] as any).elementId || null)
      }
    })

    canvas.on('selection:cleared', () => {
      selectCanvasElement(null)
    })

    // Handle object modification
    canvas.on('object:modified', (e) => {
      const obj = e.target
      if (obj && (obj as any).elementId) {
        const elementId = (obj as any).elementId
        updateCanvasElement(elementId, {
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
          rotation: obj.angle || 0,
          opacity: obj.opacity || 1,
        })
      }
    })

    // Handle panning
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e
      if (evt.altKey || evt.button === 1) {
        setPanning(true)
        setLastPanPoint({ x: evt.clientX, y: evt.clientY })
        canvas.defaultCursor = 'grabbing'
      }
    })

    canvas.on('mouse:move', (opt) => {
      if (panning && lastPanPoint) {
        const evt = opt.e
        const vpt = canvas.viewportTransform
        if (vpt) {
          vpt[4] += evt.clientX - lastPanPoint.x
          vpt[5] += evt.clientY - lastPanPoint.y
          canvas.setViewportTransform(vpt)
          setLastPanPoint({ x: evt.clientX, y: evt.clientY })
        }
      }
    })

    canvas.on('mouse:up', () => {
      setPanning(false)
      setLastPanPoint(null)
      canvas.defaultCursor = 'default'
    })

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  // Sync canvas elements with Fabric.js objects
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const currentObjects = canvas.getObjects()
    // Remove objects that no longer exist in state
    currentObjects.forEach((obj) => {
      const elementId = (obj as any).elementId
      if (elementId && !canvasElements.find((e) => e.id === elementId)) {
        canvas.remove(obj)
      }
    })

    // Add or update objects from state
    canvasElements.forEach((element) => {
      const existingObj = currentObjects.find(
        (obj) => (obj as any).elementId === element.id
      ) as fabric.Object

      if (existingObj) {
        // Update existing object
        existingObj.set({
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          angle: element.rotation,
          opacity: element.opacity,
        })
        existingObj.setCoords()
      } else {
        // Create new object based on type
        let fabricObj: fabric.Object

        switch (element.type) {
          case 'video':
            fabricObj = new fabric.Rect({
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fill: '#4f46e5',
              stroke: '#818cf8',
              strokeWidth: 2,
            })
            break
          case 'image':
            fabricObj = new fabric.Rect({
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fill: '#10b981',
              stroke: '#34d399',
              strokeWidth: 2,
            })
            break
          case 'text':
            fabricObj = new fabric.IText('Sample Text', {
              left: element.x,
              top: element.y,
              fontSize: element.properties?.fontSize || 48,
              fill: element.properties?.color || '#ffffff',
              fontFamily: element.properties?.fontFamily || 'Arial',
            })
            break
          case 'shape':
            fabricObj = new fabric.Rect({
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fill: element.properties?.fill || '#8b5cf6',
              stroke: element.properties?.stroke || '#a78bfa',
              strokeWidth: 2,
            })
            break
          default:
            return
        }

        ;(fabricObj as any).elementId = element.id
        canvas.add(fabricObj)
      }
    })

    // Update selection
    if (selectedCanvasElementId) {
      const selectedObj = canvas.getObjects().find(
        (obj) => (obj as any).elementId === selectedCanvasElementId
      )
      if (selectedObj) {
        canvas.setActiveObject(selectedObj)
      }
    } else {
      canvas.discardActiveObject()
    }

    canvas.renderAll()
  }, [canvasElements, selectedCanvasElementId, updateCanvasElement, selectCanvasElement])

  // Apply zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !containerRef.current) return

    const container = containerRef.current
    const canvasWidth = 1920
    const canvasHeight = 1080

    // Calculate zoom to fit container
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scaleX = (containerWidth / canvasWidth) * zoom
    const scaleY = (containerHeight / canvasHeight) * zoom
    const scale = Math.min(scaleX, scaleY)

    canvas.setDimensions({
      width: containerWidth,
      height: containerHeight,
    })

    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[0] = scale
      vpt[3] = scale
      canvas.setViewportTransform(vpt)
    }
  }, [zoom])

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 5))
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.1))
  const handleFitToScreen = () => {
    setZoom(1)
    const canvas = fabricCanvasRef.current
    if (canvas && containerRef.current) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    }
  }

  return (
    <div ref={containerRef} className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block" />
      
      {/* Canvas Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/10 hover:bg-white/20 rounded backdrop-blur-sm transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/10 hover:bg-white/20 rounded backdrop-blur-sm transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-2 bg-white/10 hover:bg-white/20 rounded backdrop-blur-sm transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Canvas Info Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-white text-sm bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <span>Alt + Drag to pan</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Safe Area Guides */}
      <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30" style={{
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: '5%',
      }} />
    </div>
  )
}
