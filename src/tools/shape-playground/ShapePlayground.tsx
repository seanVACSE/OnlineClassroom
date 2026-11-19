import { useEffect, useRef, useState } from 'react'
import type { DragEvent, PointerEvent } from 'react'
import type Konva from 'konva'
import { Circle, Ellipse, Group, Image as KonvaImage, Layer, Path, Rect, RegularPolygon, Stage, Star, Text, Transformer } from 'react-konva'
import { ArrowLeft, Circle as CircleIcon, Copy, Diamond, Download, Heart, Hexagon, Layers, Maximize, Minimize, Pentagon, RectangleHorizontal, Shapes, Square, Star as StarIcon, Trash2, Triangle, Type } from 'lucide-react'
import { Link } from 'react-router-dom'
import { playgroundBackgrounds } from './backgrounds'
import { COLORS, SHAPE_TYPES, type PlaygroundShape, type ShapeType } from './shapes'
import { shapeTemplates, templatePaths, type TemplateShape } from './templateDesigns'
import './ShapePlayground.css'

const BOARD_WIDTH = 1000
const BOARD_HEIGHT = 700
const STORAGE_KEY = 'shape-playground-v1'
const NAMETAG_STORAGE_KEY = 'shape-playground-nametag-v1'
const DEFAULT_TEXT = 'Your text'
const HANDLE_SIZE = 24
const HANDLE_HIT_STROKE = 20
const TEMPLATE_SHAPES: TemplateShape[] = ['circle', 'square', 'triangle', 'rectangle']
const icons = { circle: CircleIcon, square: Square, triangle: Triangle, rectangle: RectangleHorizontal, oval: CircleIcon, star: StarIcon, heart: Heart, diamond: Diamond, pentagon: Pentagon, hexagon: Hexagon }
type SavedBoards = Record<string, PlaygroundShape[]>

function styleHandle(anchor: Konva.Rect) {
  anchor.hitStrokeWidth(HANDLE_HIT_STROKE)
}

function loadBoards(storageKey: string): SavedBoards {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved as SavedBoards : {}
  } catch {
    return {}
  }
}

function ShapeArtwork({ shape }: { shape: PlaygroundShape }) {
  const fill = shape.color
  const common = { fill, stroke: '#34433d', strokeWidth: 3, lineJoin: 'round' as const }
  switch (shape.type) {
    case 'circle': return <Circle radius={60} {...common} />
    case 'square': return <Rect x={-60} y={-60} width={120} height={120} {...common} />
    case 'rectangle': return <Rect x={-85} y={-50} width={170} height={100} {...common} />
    case 'oval': return <Ellipse radiusX={85} radiusY={50} {...common} />
    case 'triangle': return <RegularPolygon sides={3} radius={75} {...common} />
    case 'diamond': return <RegularPolygon sides={4} radius={75} {...common} />
    case 'pentagon': return <RegularPolygon sides={5} radius={68} {...common} />
    case 'hexagon': return <RegularPolygon sides={6} radius={68} {...common} />
    case 'star': return <Star numPoints={5} innerRadius={32} outerRadius={72} {...common} />
    case 'heart': return <Path data="M 0 55 C -10 45 -68 12 -68 -25 C -68 -65 -18 -75 0 -43 C 18 -75 68 -65 68 -25 C 68 12 10 45 0 55 Z" {...common} />
    case 'text': return <Text x={-150} y={-30} width={300} text={shape.text || ' '} fontFamily="Arial, sans-serif" fontSize={48} fontStyle="bold" align="center" fill={fill} />
  }
}

function BackgroundImage({ url }: { url?: string }) {
  const [image, setImage] = useState<HTMLImageElement>()
  useEffect(() => {
    if (!url) return
    const next = new window.Image()
    next.onload = () => setImage(next)
    next.src = url
    return () => { next.onload = null }
  }, [url])
  if (!url || !image || image.src !== new URL(url, window.location.href).href) return null
  const scale = Math.min(BOARD_WIDTH / image.width, BOARD_HEIGHT / image.height)
  const width = image.width * scale
  const height = image.height * scale
  return <KonvaImage image={image} x={(BOARD_WIDTH - width) / 2} y={(BOARD_HEIGHT - height) / 2} width={width} height={height} listening={false} />
}

export function ShapePlayground({ mode = 'free', back = '/tools/shape-playground' }: { mode?: 'free' | 'nametag' | 'templates'; back?: string }) {
  const isTemplates = mode === 'templates'
  const storageKey = mode === 'nametag' ? NAMETAG_STORAGE_KEY : STORAGE_KEY
  const [backgroundId, setBackgroundId] = useState(() => isTemplates ? shapeTemplates[0].id : 'blank')
  const [boards, setBoards] = useState<SavedBoards>(() => isTemplates ? {} : loadBoards(storageKey))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [color, setColor] = useState<string>(COLORS[0].value)
  const [boardWidth, setBoardWidth] = useState(0)
  const [saveError, setSaveError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const [paletteDrag, setPaletteDrag] = useState<{ type: ShapeType; x: number; y: number } | null>(null)
  const [templateMessage, setTemplateMessage] = useState('')
  const playgroundRef = useRef<HTMLElement>(null)
  const boardArea = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const focusNewText = useRef(false)
  const shapeRefs = useRef<Record<string, Konva.Group | null>>({})
  const palettePointer = useRef<{ type: ShapeType; x: number; y: number; moved: boolean } | null>(null)
  const skipPaletteClick = useRef(false)
  const shapes = boards[backgroundId] ?? []
  const selected = shapes.find((shape) => shape.id === selectedId)
  const background = playgroundBackgrounds.find((item) => item.id === backgroundId)
  const templateIndex = shapeTemplates.findIndex((item) => item.id === backgroundId)
  const template = isTemplates ? shapeTemplates[templateIndex] : undefined
  const availableShapes = isTemplates ? TEMPLATE_SHAPES : SHAPE_TYPES
  const scale = boardWidth / BOARD_WIDTH

  useEffect(() => {
    const container = boardArea.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBoardWidth(Math.max(0, Math.min(width - 2, (height - 2) * BOARD_WIDTH / BOARD_HEIGHT)))
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === playgroundRef.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === playgroundRef.current) {
        await document.exitFullscreen()
      } else if (playgroundRef.current) {
        await playgroundRef.current.requestFullscreen()
      }
      setFullscreenError(false)
    } catch {
      setFullscreenError(true)
    }
  }

  useEffect(() => {
    if (isTemplates) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(boards))
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
  }, [boards, storageKey, isTemplates])

  useEffect(() => {
    if (selected?.type === 'text' && focusNewText.current) {
      textInputRef.current?.focus()
      textInputRef.current?.select()
      focusNewText.current = false
    }
  }, [selectedId, selected])

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    const node = selectedId ? shapeRefs.current[selectedId] : null
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selectedId, shapes, boardWidth])

  function updateShapes(update: (current: PlaygroundShape[]) => PlaygroundShape[]) {
    setBoards((current) => ({ ...current, [backgroundId]: update(current[backgroundId] ?? []) }))
  }

  function updateShape(id: string, changes: Partial<Pick<PlaygroundShape, 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation' | 'color'>>) {
    updateShapes((current) => current.map((shape) => shape.id === id ? { ...shape, ...changes } : shape))
  }

  function updateText(id: string, text: string) {
    updateShapes((current) => current.map((shape) => shape.id === id && shape.type === 'text' ? { ...shape, text } : shape))
  }

  function addShape(type: ShapeType, x = BOARD_WIDTH / 2, y = BOARD_HEIGHT / 2) {
    const id = crypto.randomUUID()
    updateShapes((current) => [...current, { id, type, x, y, scaleX: 1, scaleY: 1, rotation: 0, color }])
    setSelectedId(id)
  }

  function addText() {
    const id = crypto.randomUUID()
    updateShapes((current) => [...current, { id, type: 'text', text: DEFAULT_TEXT, x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2, scaleX: 1, scaleY: 1, rotation: 0, color }])
    focusNewText.current = true
    setSelectedId(id)
  }

  function deleteSelected() {
    if (!selectedId) return
    updateShapes((current) => current.filter((shape) => shape.id !== selectedId))
    setSelectedId(null)
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === 'Escape') setSelectedId(null)
      if (!selected) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        deleteSelected()
      }
      const movement: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
      if (movement[event.key]) {
        event.preventDefault()
        const [dx, dy] = movement[event.key]
        const step = event.shiftKey ? 10 : 1
        updateShape(selected.id, { x: selected.x + dx * step, y: selected.y + dy * step })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const type = event.dataTransfer.getData('text/plain') as ShapeType
    const rect = stageRef.current?.container().getBoundingClientRect()
    if (!rect || !availableShapes.some((shape) => shape === type)) return
    addShape(type, (event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale)
  }

  function startPaletteDrag(event: PointerEvent<HTMLButtonElement>, type: ShapeType) {
    if (!isTemplates || event.button !== 0) return
    skipPaletteClick.current = false
    palettePointer.current = { type, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function movePaletteDrag(event: PointerEvent<HTMLButtonElement>) {
    const pointer = palettePointer.current
    if (!pointer) return
    if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true
    if (pointer.moved) setPaletteDrag({ type: pointer.type, x: event.clientX, y: event.clientY })
  }

  function endPaletteDrag(event: PointerEvent<HTMLButtonElement>) {
    const pointer = palettePointer.current
    palettePointer.current = null
    setPaletteDrag(null)
    if (!pointer?.moved) return
    skipPaletteClick.current = true
    const rect = stageRef.current?.container().getBoundingClientRect()
    if (rect && scale && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
      addShape(pointer.type, (event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale)
      setTemplateMessage('')
    } else {
      setTemplateMessage('Drag a shape onto the picture, or tap a shape to add it.')
    }
  }

  function download() {
    const stage = stageRef.current
    const transformer = transformerRef.current
    if (!stage || !transformer || !scale) return
    transformer.visible(false)
    const url = stage.toDataURL({ pixelRatio: 2 / scale })
    transformer.visible(true)
    transformer.getLayer()?.batchDraw()
    const link = document.createElement('a')
    link.download = isTemplates ? `${backgroundId}-shape-template.png` : mode === 'nametag' ? 'nametag.png' : 'shape-playground.png'
    link.href = url
    link.click()
  }

  return (
    <main className={`playground${isTemplates ? ' playground--templates' : ''}`} ref={playgroundRef}>
      <header className="playground-header">
        <Link className="playground-back" to={back} aria-label="Back to shape activities" title="Back to shape activities"><ArrowLeft size={20} /></Link>
        <div className="playground-heading"><span className="playground-heading-icon"><Shapes size={23} /></span><div><span className="playground-eyebrow">CLASSROOM TOOLS</span><h1>{isTemplates ? 'Shape Templates' : mode === 'nametag' ? 'Create a Nametag' : 'Shape Playground'}</h1></div></div>
        <div className="playground-header-actions">
          <button className="playground-fullscreen" onClick={() => void toggleFullscreen()} title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}<span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span></button>
          <button className="playground-download" onClick={download} disabled={!boardWidth} title="Download picture"><Download size={18} /><span>Download</span></button>
        </div>
      </header>

      <div className="playground-layout">
        <aside className="playground-sidebar" aria-label="Shape, text and color tools">
          {isTemplates && <p className="playground-template-help">Drag a shape onto the picture, or tap to add it. Move and resize it to fit an outline. Choose any colors!</p>}
          <div className="playground-section-heading"><span>SHAPES</span><span className="playground-count">{availableShapes.length}</span></div>
          <div className="playground-shapes">
            {availableShapes.map((type) => {
              const Icon = icons[type]
              return <button key={type} className="playground-shape-button" draggable={!isTemplates}
                onDragStart={(event) => { event.dataTransfer.setData('text/plain', type); event.dataTransfer.effectAllowed = 'copy' }}
                onPointerDown={(event) => startPaletteDrag(event, type)} onPointerMove={movePaletteDrag} onPointerUp={endPaletteDrag}
                onPointerCancel={() => { palettePointer.current = null; setPaletteDrag(null) }}
                onClick={(event) => {
                  if (skipPaletteClick.current && event.detail !== 0) { skipPaletteClick.current = false; return }
                  skipPaletteClick.current = false
                  setTemplateMessage('')
                  addShape(type)
                }} title={`Add ${type}`}><Icon size={28} strokeWidth={1.8} className={type === 'oval' ? 'playground-oval-icon' : undefined} /><span>{type}</span></button>
            })}
            {!isTemplates && <button className="playground-shape-button" onClick={addText} title="Add text"><Type size={28} strokeWidth={1.8} /><span>Text</span></button>}
          </div>
          {selected?.type === 'text' && <label className="playground-text-field">EDIT TEXT<input ref={textInputRef} value={selected.text} maxLength={50} onChange={(event) => updateText(selected.id, event.target.value)} onBlur={(event) => { if (!event.target.value.trim()) updateText(selected.id, DEFAULT_TEXT) }} /></label>}
          <div className="playground-section-heading playground-color-heading"><span>COLOR</span><span className="playground-color-label">{selected ? `Selected ${selected.type === 'text' ? 'text' : 'shape'}` : 'New items'}</span></div>
          <div className="playground-colors">
            {COLORS.map((item) => <button key={item.value} className={`playground-swatch${(selected?.color ?? color) === item.value ? ' is-active' : ''}`} style={{ backgroundColor: item.value }} title={item.name} aria-label={item.name} aria-pressed={(selected?.color ?? color) === item.value} onClick={() => { setColor(item.value); if (selected) updateShape(selected.id, { color: item.value }) }} />)}
            <label className="playground-custom-color" title="Choose a custom color"><span>+</span><input type="color" aria-label="Choose a custom color" value={selected?.color ?? color} onChange={(event) => { setColor(event.target.value); if (selected) updateShape(selected.id, { color: event.target.value }) }} /></label>
          </div>
        </aside>

        <section className="playground-main" aria-label="Shape canvas">
          <div className="playground-board-toolbar">
            {isTemplates ? <div className="playground-template-nav">
              <button disabled={templateIndex === 0} onClick={() => { setBackgroundId(shapeTemplates[templateIndex - 1].id); setSelectedId(null) }}>Previous</button>
              <strong>{template?.name} ({templateIndex + 1}/{shapeTemplates.length})</strong>
              <button disabled={templateIndex === shapeTemplates.length - 1} onClick={() => { setBackgroundId(shapeTemplates[templateIndex + 1].id); setSelectedId(null) }}>Next</button>
            </div> : <label className="playground-background-label">BACKGROUND <select value={backgroundId} onChange={(event) => { setBackgroundId(event.target.value); setSelectedId(null) }}>{playgroundBackgrounds.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
            <div className="playground-actions">
              <button disabled={!selected} title="Duplicate selected item" aria-label="Duplicate selected item" onClick={() => { if (!selected) return; const copy = { ...selected, id: crypto.randomUUID(), x: selected.x + 25, y: selected.y + 25 }; updateShapes((current) => [...current, copy]); setSelectedId(copy.id) }}><Copy size={18} /></button>
              <button disabled={!selected} title="Bring to front" aria-label="Bring to front" onClick={() => { if (!selected) return; updateShapes((current) => [...current.filter((shape) => shape.id !== selected.id), selected]) }}><Layers size={18} /></button>
              <button disabled={!selected} title="Delete selected item" aria-label="Delete selected item" onClick={deleteSelected}><Trash2 size={18} /></button>
              <span className="playground-action-divider" />
              <button className="playground-clear" disabled={!shapes.length} onClick={() => { if (window.confirm('Clear all shapes and text from this canvas?')) { updateShapes(() => []); setSelectedId(null) } }}>Clear canvas</button>
            </div>
          </div>
          {isTemplates && <p className="playground-template-scroll-hint">Swipe the picture left or right to see the whole template.</p>}
          <div className="playground-board-scroll">
          <div className="playground-board-area" ref={boardArea}>
          <div className="playground-board-wrap" style={{ width: boardWidth + 2 }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }} onDrop={handleDrop}>
            {boardWidth > 0 && <Stage ref={stageRef} width={boardWidth} height={BOARD_HEIGHT * scale} scaleX={scale} scaleY={scale} onMouseDown={(event) => { if (event.target === event.target.getStage()) setSelectedId(null) }} onTouchStart={(event) => { if (event.target === event.target.getStage()) setSelectedId(null) }}>
              <Layer>
                <Rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#ffffff" listening={false} />
                <BackgroundImage url={background?.url} />
                {shapes.map((shape) => <Group key={shape.id} ref={(node) => { shapeRefs.current[shape.id] = node }} x={shape.x} y={shape.y} scaleX={shape.scaleX} scaleY={shape.scaleY} rotation={shape.rotation} draggable onClick={() => setSelectedId(shape.id)} onTap={() => setSelectedId(shape.id)} onDragStart={() => setSelectedId(shape.id)} onDragEnd={(event) => updateShape(shape.id, { x: event.target.x(), y: event.target.y() })} onTransformEnd={(event) => { const node = event.target; updateShape(shape.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }) }}><ShapeArtwork shape={shape} /></Group>)}
                {template?.slots.map((slot) => <Path key={slot.id} data={templatePaths[slot.shape]} x={slot.x} y={slot.y + 50} scaleX={slot.width / 100} scaleY={slot.height / 100} stroke="#527b6b" strokeWidth={3} strokeScaleEnabled={false} dash={[9, 6]} listening={false} />)}
                <Transformer ref={transformerRef} rotateEnabled flipEnabled={false} padding={12} anchorSize={HANDLE_SIZE} anchorCornerRadius={HANDLE_SIZE / 2} anchorFill="#ffffff" anchorStroke="#378d7e" anchorStrokeWidth={2} anchorStyleFunc={styleHandle} borderStroke="#378d7e" boundBoxFunc={(oldBox, newBox) => Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20 ? oldBox : newBox} />
              </Layer>
            </Stage>}
          </div>
          </div>
          </div>
          <div className="playground-status" aria-live="polite"><span>{fullscreenError ? 'Fullscreen is unavailable in this browser' : templateMessage || (selected ? `${selected.type.charAt(0).toUpperCase() + selected.type.slice(1)} selected` : 'Your canvas')}</span><span>{isTemplates ? 'Progress lasts until you leave' : saveError ? 'Unable to save on this device' : 'Saved on this device'}</span></div>
        </section>
      </div>
      {paletteDrag && (() => { const Icon = icons[paletteDrag.type]; return <div className="playground-drag-preview" style={{ left: paletteDrag.x, top: paletteDrag.y, color }}><Icon size={52} fill={color} stroke="#34433d" strokeWidth={1.5} /></div> })()}
    </main>
  )
}