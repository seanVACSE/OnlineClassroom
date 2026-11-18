import { useRef, useState, type PointerEvent } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { COLORS } from './shapes'
import { shapeTemplates, templatePaths, type TemplateShape, type TemplateSlot } from './templateDesigns'
import './ShapeTemplates.css'

const shapeTypes: TemplateShape[] = ['circle', 'square', 'triangle', 'rectangle']
type Placements = Record<string, string>

function ShapeIcon({ shape, fill, outline = false }: { shape: TemplateShape; fill: string; outline?: boolean }) {
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={templatePaths[shape]} fill={fill} stroke={outline ? '#698579' : '#34433d'} strokeWidth="2.5" strokeDasharray={outline ? '5 4' : undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></svg>
}

export function ShapeTemplates() {
  const [templateIndex, setTemplateIndex] = useState(0)
  const [boards, setBoards] = useState<Record<string, Placements>>({})
  const [selectedShape, setSelectedShape] = useState<TemplateShape | null>(null)
  const [color, setColor] = useState<string>(COLORS[0].value)
  const [feedback, setFeedback] = useState('')
  const [drag, setDrag] = useState<{ shape: TemplateShape; x: number; y: number } | null>(null)
  const pointer = useRef<{ shape: TemplateShape; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const slotsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const template = shapeTemplates[templateIndex]
  const placed = boards[template.id] ?? {}
  const completed = Object.keys(placed).length === template.slots.length

  function place(shape: TemplateShape, slot: TemplateSlot) {
    if (placed[slot.id]) {
      setFeedback('That outline is already filled. Choose another outline.')
      return
    }
    if (shape !== slot.shape) {
      setFeedback(`That outline needs a ${slot.shape}. Try another shape!`)
      return
    }
    setBoards((previous) => ({ ...previous, [template.id]: { ...previous[template.id], [slot.id]: color } }))
    setSelectedShape(null)
    setFeedback(`Great! You placed a ${shape}.`)
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, shape: TemplateShape) {
    if (event.button !== 0) return
    skipClick.current = false
    pointer.current = { shape, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current
    if (!start) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) start.moved = true
    if (start.moved) setDrag({ shape: start.shape, x: event.clientX, y: event.clientY })
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current
    pointer.current = null
    setDrag(null)
    if (!start?.moved) return
    skipClick.current = true
    const slot = template.slots.find((item) => {
      const rect = slotsRef.current[item.id]?.getBoundingClientRect()
      return rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
    })
    if (slot) place(start.shape, slot)
    else {
      setSelectedShape(start.shape)
      setFeedback('Drag onto an outline, or tap an outline to place your shape.')
    }
  }

  function changeTemplate(index: number) {
    setTemplateIndex(index)
    setSelectedShape(null)
    setFeedback('')
  }

  return (
    <main className="activity-game templates-game">
      <header className="activity-game-header">
        <Link className="activity-back" to="/tools/shape-playground/grades/k" aria-label="Back to Kindergarten activities"><ArrowLeft size={22} /><span>Back</span></Link>
        <span className="activity-game-title">Shape Templates</span>
      </header>
      <section className="templates-content">
        <h1>{template.name}</h1>
        <p>Choose a color. Drag a shape to its matching outline, or tap a shape and then an outline.</p>
        <p className="templates-scroll-hint">Swipe the picture left or right to see every shape.</p>
        <div className="templates-workspace">
          <aside className="templates-tools" aria-label="Shapes and colors">
            <strong>Shapes</strong>
            <div className="templates-palette">
              {shapeTypes.map((shape) => (
                <button key={shape} className={`templates-shape templates-shape-${shape}`} aria-label={shape} aria-pressed={selectedShape === shape}
                  onPointerDown={(event) => startDrag(event, shape)} onPointerMove={moveDrag} onPointerUp={endDrag}
                  onPointerCancel={() => { pointer.current = null; setDrag(null) }}
                  onClick={(event) => {
                    if (skipClick.current && event.detail !== 0) { skipClick.current = false; return }
                    skipClick.current = false
                    setSelectedShape(shape)
                    setFeedback(`${shape} selected. Tap its matching outline.`)
                  }}>
                  <ShapeIcon shape={shape} fill={color} /><span>{shape}</span>
                </button>
              ))}
            </div>
            <strong>Pick any color</strong>
            <div className="templates-colors">
              {COLORS.map((item) => <button key={item.value} className="templates-color" style={{ backgroundColor: item.value }} aria-label={item.name} title={item.name} aria-pressed={color === item.value} onClick={() => setColor(item.value)} />)}
            </div>
          </aside>
          <div className="templates-board-scroll">
            <div className="templates-board" role="group" aria-label={`${template.name} template`}>
              {template.slots.map((slot) => (
                <button key={slot.id} ref={(element) => { slotsRef.current[slot.id] = element }}
                  className={`templates-slot${placed[slot.id] ? ' is-filled' : ''}`}
                  style={{ left: `${slot.x / 10}%`, top: `${slot.y / 6}%`, width: `${slot.width / 10}%`, height: `${slot.height / 6}%` }}
                  aria-label={`${slot.id.replaceAll('-', ' ')}: ${slot.shape}, ${placed[slot.id] ? 'filled' : 'empty'}`}
                  onClick={() => { if (!selectedShape) setFeedback('Choose a shape first.'); else place(selectedShape, slot) }}>
                  <ShapeIcon shape={slot.shape} fill={placed[slot.id] ?? '#f5f8f2'} outline={!placed[slot.id]} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="templates-status" aria-live="polite">
          {completed ? <strong><Sparkles size={20} aria-hidden="true" /> You filled all the shapes!</strong> : <span>{feedback || `${Object.keys(placed).length} of ${template.slots.length} shapes placed`}</span>}
        </div>
        <nav className="templates-navigation" aria-label="Template navigation">
          <button disabled={templateIndex === 0} onClick={() => changeTemplate(templateIndex - 1)}>Previous</button>
          <span>{templateIndex + 1} / {shapeTemplates.length}</span>
          <button disabled={templateIndex === shapeTemplates.length - 1} onClick={() => changeTemplate(templateIndex + 1)}>Next template</button>
          <button onClick={() => { if (window.confirm('Start this template over?')) { setBoards((previous) => ({ ...previous, [template.id]: {} })); setSelectedShape(null); setFeedback('Template cleared.') } }}>Start over</button>
        </nav>
      </section>
      {drag && <div className="templates-drag-preview" style={{ left: drag.x, top: drag.y }}><ShapeIcon shape={drag.shape} fill={color} /></div>}
    </main>
  )
}
