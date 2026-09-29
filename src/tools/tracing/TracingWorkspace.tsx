import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, Eraser, Maximize, Minimize, PenLine, Trash2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTracingAssignment } from '../../data/tracingAssets'
import { getTracingColor } from '../../data/tracingColors'
import { clearStrokes, loadStrokes, saveStrokes } from './tracingStorage'
import { drawStroke, replayStrokes, widthForTool, type Stroke, type TraceTool, type TracePoint } from './tracingStrokes'
import { exportAssignmentAsPdf } from './exportPdf'
import './Tracing.css'

const MAX_CANVAS_DIMENSION = 1400

export function TracingWorkspace() {
  const { assignmentId } = useParams()
  const assignment = assignmentId ? getTracingAssignment(assignmentId) : undefined

  const [currentIndex, setCurrentIndex] = useState(0)
  const [tool, setTool] = useState<TraceTool>('pen')
  const [strokesByFile, setStrokesByFile] = useState<Record<string, Stroke[]>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentStrokeRef = useRef<Stroke | null>(null)

  const color = assignment ? getTracingColor(assignment.id) : '#000'
  const currentImage = assignment?.images[currentIndex]

  // Load all saved strokes for this assignment once, up front.
  useEffect(() => {
    if (!assignment) return
    const initial: Record<string, Stroke[]> = {}
    for (const image of assignment.images) {
      initial[image.fileName] = loadStrokes(assignment.id, image.fileName)
    }
    setStrokesByFile(initial)
    setCurrentIndex(0)
  }, [assignment])

  // Draw the base image + replay saved strokes whenever the current image changes.
  useEffect(() => {
    if (!assignment || !currentImage) return
    const baseCanvas = baseCanvasRef.current
    const drawCanvas = drawCanvasRef.current
    if (!baseCanvas || !drawCanvas) return

    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
      const width = Math.round(img.naturalWidth * scale)
      const height = Math.round(img.naturalHeight * scale)

      for (const canvas of [baseCanvas, drawCanvas]) {
        canvas.width = width
        canvas.height = height
      }

      const baseCtx = baseCanvas.getContext('2d')
      baseCtx?.drawImage(img, 0, 0, width, height)

      const drawCtx = drawCanvas.getContext('2d')
      if (drawCtx) {
        replayStrokes(drawCtx, strokesByFile[currentImage.fileName] ?? [], width, height)
      }

      setImageAspect(width / height)
    }
    img.src = currentImage.url
    // strokesByFile intentionally omitted: this effect should only re-run on image change,
    // strokes are replayed fresh from state at that moment via the closure above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, currentImage])

  // Keep isFullscreen in sync when the browser exits fullscreen (e.g. via Esc).
  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen()
    }
  }, [])

  const getNormalizedPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentImage) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const point = getNormalizedPoint(event)
    const width = widthForTool(tool, Math.min(canvas.width, canvas.height))
    const stroke: Stroke = { tool, color, width, points: [point] }
    currentStrokeRef.current = stroke

    const ctx = canvas.getContext('2d')
    if (ctx) drawStroke(ctx, stroke, canvas.width, canvas.height)
  }, [color, currentImage, getNormalizedPoint, tool])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current
    const canvas = drawCanvasRef.current
    if (!stroke || !canvas) return

    const point = getNormalizedPoint(event)
    const previous = stroke.points[stroke.points.length - 1]
    stroke.points.push(point)

    const ctx = canvas.getContext('2d')
    if (ctx) {
      drawStroke(ctx, { ...stroke, points: [previous, point] }, canvas.width, canvas.height)
    }
  }, [getNormalizedPoint])

  const handlePointerUp = useCallback(() => {
    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    if (!stroke || !assignment || !currentImage) return

    setStrokesByFile((prev) => {
      const updated = [...(prev[currentImage.fileName] ?? []), stroke]
      saveStrokes(assignment.id, currentImage.fileName, updated)
      return { ...prev, [currentImage.fileName]: updated }
    })
  }, [assignment, currentImage])

  const handleClear = useCallback(() => {
    if (!assignment || !currentImage) return
    if (!window.confirm('Clear all drawing on this image?')) return

    clearStrokes(assignment.id, currentImage.fileName)
    setStrokesByFile((prev) => ({ ...prev, [currentImage.fileName]: [] }))

    const canvas = drawCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [assignment, currentImage])

  const handleExport = useCallback(async () => {
    if (!assignment) return
    setIsExporting(true)
    try {
      await exportAssignmentAsPdf(assignment, strokesByFile)
    } finally {
      setIsExporting(false)
    }
  }, [assignment, strokesByFile])

  if (!assignmentId || !assignment) return <Navigate to="/tools/tracing" replace />

  return (
    <main ref={containerRef} className={`tracing-workspace${isFullscreen ? ' is-fullscreen' : ''}`}>
      <Link className="back-link" to="/tools/tracing"><ArrowLeft size={17} /> Back to assignments</Link>
      <h1>{assignment.name}</h1>

      <div className="tracing-toolbar">
        <button type="button" className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')}>
          <PenLine size={16} /> Pen
        </button>
        <button type="button" className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')}>
          <Eraser size={16} /> Eraser
        </button>
        <button type="button" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
        <button type="button" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button type="button" className="tracing-export" onClick={handleExport} disabled={isExporting}>
          <Download size={16} /> {isExporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      <div className="tracing-canvas-area">
        <div className="tracing-canvas-wrapper" style={imageAspect ? { aspectRatio: `${imageAspect}` } : undefined}>
          <canvas ref={baseCanvasRef} className="tracing-canvas tracing-canvas--base" />
          <canvas
            ref={drawCanvasRef}
            className="tracing-canvas tracing-canvas--draw"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      </div>

      <div className="tracing-nav">
        <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
          Previous
        </button>
        <span>Image {currentIndex + 1} of {assignment.images.length}</span>
        <button
          type="button"
          disabled={currentIndex >= assignment.images.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
        >
          Next
        </button>
      </div>
    </main>
  )
}
