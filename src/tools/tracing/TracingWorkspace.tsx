import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { ArrowLeft, CheckCircle2, Eraser, Hand, Maximize, Minimize, PenLine, Send, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTracingAssignment } from '../../data/tracingAssets'
import { getTracingColor } from '../../data/tracingColors'
import { TRACE_COLORS } from './palette'
import { clearStrokes, loadStrokes, saveStrokes } from './tracingStorage'
import { drawStroke, replayStrokes, widthForTool, type Stroke, type TraceTool, type TracePoint } from './tracingStrokes'
import { exportAssignmentAsPdfBase64 } from './exportPdf'
import { submitTracingPdf } from './tracingSubmit'
import './Tracing.css'

const MAX_CANVAS_DIMENSION = 1400
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

type SubmitState = 'idle' | 'confirming' | 'submitting' | 'success' | 'error'

export function TracingWorkspace() {
  const { assignmentId } = useParams()
  const assignment = assignmentId ? getTracingAssignment(assignmentId) : undefined

  const [currentIndex, setCurrentIndex] = useState(0)
  const [tool, setTool] = useState<TraceTool>('pen')
  const [isHandTool, setIsHandTool] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [color, setColor] = useState(() => (assignment ? getTracingColor(assignment.id) : TRACE_COLORS[0].value))
  const [brushScale, setBrushScale] = useState(1)
  const [strokesByFile, setStrokesByFile] = useState<Record<string, Stroke[]>>({})
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentStrokeRef = useRef<Stroke | null>(null)
  const panStartRef = useRef<{ pointerX: number; pointerY: number; panX: number; panY: number } | null>(null)

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
    setColor(getTracingColor(assignment.id))
  }, [assignment])

  // Draw the base image + replay saved strokes whenever the current image changes.
  useEffect(() => {
    if (!assignment || !currentImage) return
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
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
        // Read straight from storage (always current) rather than state, which may not
        // have finished loading yet on first mount.
        replayStrokes(drawCtx, loadStrokes(assignment.id, currentImage.fileName), width, height)
      }

      setImageAspect(width / height)
    }
    img.src = currentImage.url
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
    if (isHandTool) {
      panStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, panX: pan.x, panY: pan.y }
      setIsPanning(true)
      return
    }
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const point = getNormalizedPoint(event)
    const width = widthForTool(tool, Math.min(canvas.width, canvas.height), brushScale)
    const stroke: Stroke = { tool, color, width, points: [point] }
    currentStrokeRef.current = stroke

    const ctx = canvas.getContext('2d')
    if (ctx) drawStroke(ctx, stroke, canvas.width, canvas.height)
  }, [brushScale, color, currentImage, getNormalizedPoint, isHandTool, pan, tool])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const panStart = panStartRef.current
    if (panStart) {
      setPan({
        x: panStart.panX + event.clientX - panStart.pointerX,
        y: panStart.panY + event.clientY - panStart.pointerY,
      })
      return
    }
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
    if (panStartRef.current) {
      panStartRef.current = null
      setIsPanning(false)
      return
    }
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

    clearStrokes(assignment.id, currentImage.fileName)
    setStrokesByFile((prev) => ({ ...prev, [currentImage.fileName]: [] }))

    const canvas = drawCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [assignment, currentImage])

  const handleSubmitClick = useCallback(() => {
    setSubmitState('confirming')
  }, [])

  const handleConfirmSubmit = useCallback(async () => {
    if (!assignment) return
    setSubmitState('submitting')
    setSubmitError(null)
    try {
      const pdfData = await exportAssignmentAsPdfBase64(assignment, strokesByFile)
      const success = await submitTracingPdf(studentName.trim() || 'Unknown', assignment.name, pdfData)
      if (success) {
        setSubmitState('success')
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } })
      } else {
        setSubmitError('The server did not confirm the submission.')
        setSubmitState('error')
      }
    } catch (error) {
      console.error('[tracing submit] failed', error)
      setSubmitError(error instanceof Error ? error.message : 'Unknown error')
      setSubmitState('error')
    }
  }, [assignment, studentName, strokesByFile])

  const handleColorSelect = useCallback((value: string) => {
    setColor(value)
    setTool('pen')
    setIsHandTool(false)
  }, [])

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
  }, [])

  if (!assignmentId || !assignment) return <Navigate to="/tools/tracing" replace />

  return (
    <main ref={containerRef} className={`tracing-workspace${isFullscreen ? ' is-fullscreen' : ''}`}>
      <Link className="back-link" to="/tools/tracing"><ArrowLeft size={17} /> Back to assignments</Link>
      <h1>{assignment.name}</h1>

      <div className="tracing-toolbar">
        <button type="button" className={tool === 'pen' && !isHandTool ? 'active' : ''} onClick={() => { setTool('pen'); setIsHandTool(false) }}>
          <PenLine size={16} /> Pen
        </button>
        <button type="button" className={tool === 'eraser' && !isHandTool ? 'active' : ''} onClick={() => { setTool('eraser'); setIsHandTool(false) }}>
          <Eraser size={16} /> Eraser
        </button>
        <button type="button" className={isHandTool ? 'active' : ''} onClick={() => setIsHandTool((active) => !active)} title="Hand tool: drag to move the tracing" aria-label="Toggle hand tool">
          <Hand size={16} /> Hand
        </button>
        <button type="button" onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))} disabled={zoom <= MIN_ZOOM} title="Zoom out" aria-label="Zoom out">
          <ZoomOut size={16} />
        </button>
        <button type="button" className="tracing-zoom-level" onClick={resetView} title="Reset view" aria-label={`Reset view, currently ${Math.round(zoom * 100)} percent`}>
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))} disabled={zoom >= MAX_ZOOM} title="Zoom in" aria-label="Zoom in">
          <ZoomIn size={16} />
        </button>
        <button type="button" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
        <button type="button" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button
          type="button"
          className="tracing-export"
          onClick={handleSubmitClick}
          disabled={submitState === 'submitting'}
        >
          <Send size={16} /> Submit
        </button>
      </div>

      <div className="tracing-main">
        <div className="tracing-colors" role="group" aria-label="Pen color">
          {TRACE_COLORS.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              className={`tracing-color-swatch${tool === 'pen' && color === swatch.value ? ' selected' : ''}`}
              style={{ backgroundColor: swatch.value }}
              title={swatch.name}
              aria-label={swatch.name}
              onClick={() => handleColorSelect(swatch.value)}
            />
          ))}
          <input
            type="range"
            className="tracing-size-slider"
            min={1}
            max={6}
            step={1}
            value={brushScale}
            onChange={(event) => setBrushScale(Number(event.target.value))}
            title="Brush size"
            aria-label="Brush size"
          />
        </div>

        <div className={`tracing-canvas-area${isHandTool ? ' is-hand-tool' : ''}${isPanning ? ' is-panning' : ''}`}>
          <div
            className="tracing-canvas-wrapper"
            style={{
              ...(imageAspect ? { aspectRatio: `${imageAspect}` } : {}),
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
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

      {submitState === 'confirming' && (
        <div className="tracing-modal-overlay" role="dialog" aria-modal="true">
          <div className="tracing-modal">
            <p>Submit this tracing?</p>
            <label className="tracing-name-field">
              <span>Your name (optional)</span>
              <input
                type="text"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Unknown"
                autoComplete="name"
              />
            </label>
            <div className="tracing-modal-actions">
              <button type="button" onClick={() => setSubmitState('idle')}>Cancel</button>
              <button type="button" className="tracing-export" onClick={handleConfirmSubmit}>Yes, submit</button>
            </div>
          </div>
        </div>
      )}

      {submitState === 'submitting' && (
        <div className="tracing-modal-overlay" role="dialog" aria-modal="true">
          <div className="tracing-modal">
            <p>Submitting…</p>
          </div>
        </div>
      )}

      {submitState === 'error' && (
        <div className="tracing-modal-overlay" role="dialog" aria-modal="true">
          <div className="tracing-modal">
            <p>Something went wrong submitting your work. Please try again.</p>
            {submitError && <p className="tracing-modal-detail">{submitError}</p>}
            <div className="tracing-modal-actions">
              <button type="button" onClick={() => setSubmitState('idle')}>Close</button>
              <button type="button" className="tracing-export" onClick={handleConfirmSubmit}>Try again</button>
            </div>
          </div>
        </div>
      )}

      {submitState === 'success' && (
        <div className="tracing-modal-overlay" role="dialog" aria-modal="true">
          <div className="tracing-modal tracing-modal-success">
            <CheckCircle2 size={56} className="tracing-success-icon" />
            <p>Great job! Your tracing was submitted.</p>
            <div className="tracing-modal-actions">
              <Link className="tracing-export" to="/tools/tracing">Back to assignments</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
