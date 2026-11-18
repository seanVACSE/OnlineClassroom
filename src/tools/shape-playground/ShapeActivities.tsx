import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Circle, Maximize, Minimize, Paintbrush, Palette, Shapes, Sparkles, Square, Star, Tags, Triangle } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { countingQuestions, patternQuestions, sortingQuestions, type ActivityColor, type ActivityShape, type SortingQuestion } from './activityQuestions'
import { MysteryPicture } from './MysteryPicture'
import { ShapePlayground } from './ShapePlayground'
import { gradeActivities, gradeIds, gradeLabels, isGrade, isGradeActivity, type Grade } from './grades'
import './ShapeActivities.css'

const root = '/tools/shape-playground'
const selectionBackground = `${import.meta.env.BASE_URL}images/home/background.png`
const shapeIcons = { circle: Circle, square: Square, triangle: Triangle, star: Star }
const cardImages = import.meta.glob<string>('/src/assets/shape-playground/cards/*.png', { eager: true, import: 'default' })

function CardImage({ name, children }: { name: string; children: ReactNode }) {
  const image = cardImages[`/src/assets/shape-playground/cards/${name}.png`]
  return image ? <img className="activity-card-image" src={image} alt="" /> : children
}

function Picture({ shape, color, className = '' }: { shape: ActivityShape; color?: ActivityColor; className?: string }) {
  const Icon = shapeIcons[shape]
  return <Icon className={`activity-picture activity-picture--${shape} ${color ? `activity-color--${color}` : ''} ${className}`} aria-hidden="true" strokeWidth={2} />
}

function SortingRound({ question, onResult }: { question: SortingQuestion; onResult: (result: 'wrong' | 'correct' | null) => void }) {
  const [placed, setPlaced] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [drag, setDrag] = useState<{ index: number; x: number; y: number } | null>(null)
  const pointer = useRef<{ index: number; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const binsRef = useRef<HTMLDivElement>(null)

  function place(index: number, bin: string) {
    if (question.shapes[index][question.sortBy] !== bin) {
      onResult('wrong')
      return
    }
    const next = { ...placed, [index]: bin }
    setPlaced(next)
    setSelected(null)
    onResult(Object.keys(next).length === question.shapes.length ? 'correct' : null)
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== 0) return
    skipClick.current = false
    pointer.current = { index, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current
    if (!start) return
    const x = event.clientX - start.x
    const y = event.clientY - start.y
    if (Math.hypot(x, y) > 8) start.moved = true
    if (start.moved) setDrag({ index: start.index, x, y })
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current
    pointer.current = null
    setDrag(null)
    if (!start?.moved) return
    skipClick.current = true
    const bins = binsRef.current?.querySelectorAll<HTMLButtonElement>('[data-bin]') ?? []
    for (const bin of bins) {
      const rect = bin.getBoundingClientRect()
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom && bin.dataset.bin) {
        place(start.index, bin.dataset.bin)
        return
      }
    }
    setSelected(start.index)
  }

  return (
    <>
      <h1 className="activity-prompt">Sort by {question.sortBy}!</h1>
      <p className="activity-sort-instructions">Drag each shape to its group, or tap a shape and then its group.</p>
      <div className="activity-sort-tray" aria-label="Shapes to sort">
        {question.shapes.map((item, index) => !placed[index] && (
          <button
            key={index}
            className={`activity-sort-piece ${selected === index ? 'is-selected' : ''} ${drag?.index === index ? 'is-dragging' : ''}`}
            style={drag?.index === index ? { transform: `translate(${drag.x}px, ${drag.y}px)` } : undefined}
            aria-label={`${item.color} ${item.shape}`}
            aria-pressed={selected === index}
            onPointerDown={(event) => startDrag(event, index)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => { pointer.current = null; setDrag(null) }}
            onClick={(event) => {
              if (skipClick.current && event.detail !== 0) { skipClick.current = false; return }
              skipClick.current = false
              setSelected(selected === index ? null : index)
            }}
          ><Picture shape={item.shape} color={item.color} /></button>
        ))}
        {Object.keys(placed).length === question.shapes.length && <span>All sorted!</span>}
      </div>
      <div className="activity-sort-bins" ref={binsRef}>
        {question.bins.map((bin) => (
          <button key={bin} data-bin={bin} className="activity-sort-bin" aria-label={`${question.sortBy === 'color' ? `${bin} shapes` : `${bin}s`}, ${Object.values(placed).filter((value) => value === bin).length} sorted`} onClick={() => { if (selected !== null) place(selected, bin) }}>
            <strong>{question.sortBy === 'color' ? `${bin} shapes` : `${bin}s`}</strong>
            <span className="activity-sort-bin-items">
              {question.shapes.map((item, index) => placed[index] === bin && <Picture key={index} shape={item.shape} color={item.color} />)}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function ActivityHeader({ back, title, backLabel }: { back: string; title: string; backLabel: string }) {
  return (
    <header className="activity-header">
      <Link to={back} className="activity-back" aria-label={backLabel}><ArrowLeft size={22} /> <span>Back</span></Link>
      <h1>{title}</h1>
    </header>
  )
}

export function ShapeActivitySelect() {
  return (
    <main className="activity-page" style={{ backgroundImage: `url("${selectionBackground}")` }}>
      <ActivityHeader back="/" title="Shape Playground" backLabel="Back to classroom" />
      <section className="activity-select">
        <h2>Choose an activity</h2>
        <div className="activity-cards">
          <Link className="activity-card activity-card--yellow" to={`${root}/free`}>
            <CardImage name="free-design"><Paintbrush size={54} aria-hidden="true" /></CardImage><strong>Free Design</strong><span>Make your own picture</span>
          </Link>
          {gradeIds.map((grade) => (
            <Link key={grade} className={`activity-card activity-card--${grade === 'k' || grade === '2' ? 'green' : 'blue'}`} to={`${root}/grades/${grade}`}>
              <CardImage name={grade === 'k' || grade === '1' ? 'grades-k-1' : 'grades-2-3'}><Shapes size={54} aria-hidden="true" /></CardImage>
              <strong>{gradeLabels[grade]}</strong><span>Shape activities</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

export function ShapeGradeSelect() {
  const { grade } = useParams()
  if (!isGrade(grade)) return <Navigate to={root} replace />
  return (
    <main className="activity-page" style={{ backgroundImage: `url("${selectionBackground}")` }}>
      <ActivityHeader back={root} title={gradeLabels[grade]} backLabel="Back to shape activities" />
      <section className="activity-select">
            <h2>Pick an activity</h2>
            <div className="activity-cards">
              <Link className="activity-card activity-card--yellow" to={`${root}/grades/${grade}/count`}>
                <CardImage name="count-the-shapes"><span className="activity-card-shapes"><Picture shape="circle" /><Picture shape="triangle" /></span></CardImage>
                <strong>1. Count the Shapes</strong><span>10 questions</span>
              </Link>
              <Link className="activity-card activity-card--blue" to={`${root}/grades/${grade}/patterns`}>
                <CardImage name="shape-patterns"><span className="activity-card-shapes"><Picture shape="square" /><Picture shape="star" /></span></CardImage>
                <strong>2. Shape Patterns</strong><span>10 questions</span>
              </Link>
              <Link className="activity-card activity-card--green" to={`${root}/grades/${grade}/sort`}>
                <CardImage name="sort-the-shapes"><span className="activity-card-shapes"><Picture shape="circle" color="yellow" /><Picture shape="square" color="yellow" /></span></CardImage>
                <strong>3. Shape Sort</strong><span>6 sorting rounds</span>
              </Link>
              {gradeActivities[grade].includes('mystery-picture') && <Link className="activity-card activity-card--yellow" to={`${root}/grades/${grade}/mystery-picture`}>
                <CardImage name="math-mystery-picture"><Palette size={54} aria-hidden="true" /></CardImage>
                <strong>4. Math Mystery Picture</strong><span>First grade addition</span>
              </Link>}
              {gradeActivities[grade].includes('nametag') && <Link className="activity-card activity-card--yellow" to={`${root}/grades/${grade}/nametag`}>
                <CardImage name="create-a-nametag"><Tags size={54} aria-hidden="true" /></CardImage><strong>Create a Nametag</strong><span>Make a nametag with shapes and text</span>
              </Link>}
            </div>
      </section>
    </main>
  )
}

export function ShapeGame() {
  const { grade, activity } = useParams()
  if (grade === 'k-1' && (activity === 'count' || activity === 'patterns' || activity === 'sort' || activity === 'mystery-picture')) return <Navigate to={`${root}/grades/1/${activity}`} replace />
  if (grade === '2-3' && activity === 'nametag') return <Navigate to={`${root}/grades/2/nametag`} replace />
  if (!isGrade(grade)) return <Navigate to={root} replace />
  if (!isGradeActivity(grade, activity)) return <Navigate to={`${root}/grades/${grade}`} replace />
  if (activity === 'mystery-picture') return <MysteryPicture key={grade} back={`${root}/grades/${grade}`} backLabel={`Back to ${gradeLabels[grade]} activities`} />
  if (activity === 'nametag') return <ShapePlayground mode="nametag" back={`${root}/grades/${grade}`} />
  return <Game key={`${grade}-${activity}`} activity={activity} grade={grade} />
}

function Game({ activity, grade }: { activity: 'count' | 'patterns' | 'sort'; grade: Grade }) {
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<'wrong' | 'correct' | null>(null)
  const [finished, setFinished] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const gameRef = useRef<HTMLElement>(null)
  const count = countingQuestions[index]
  const pattern = patternQuestions[index]
  const total = activity === 'count' ? countingQuestions.length : activity === 'sort' ? sortingQuestions.length : patternQuestions.length
  const unit = activity === 'sort' ? 'round' : 'question'

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === gameRef.current)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === gameRef.current) await document.exitFullscreen()
      else if (gameRef.current) await gameRef.current.requestFullscreen()
      setFullscreenError(false)
    } catch {
      setFullscreenError(true)
    }
  }

  function answer(isCorrect: boolean) {
    setResult(isCorrect ? 'correct' : 'wrong')
  }

  function next() {
    if (index + 1 === total) setFinished(true)
    else setIndex(index + 1)
    setResult(null)
  }

  return (
    <main className="activity-game" ref={gameRef}>
      <div className="activity-game-header">
        <Link className="activity-back" to={`${root}/grades/${grade}`} aria-label={`Back to ${gradeLabels[grade]} activities`}><ArrowLeft size={22} /><span>Back</span></Link>
        <span className="activity-game-title">{activity === 'count' ? 'Count the Shapes' : activity === 'sort' ? 'Shape Sort' : 'Shape Patterns'}</span>
        <button className="activity-fullscreen" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
      </div>
      {fullscreenError && <p className="activity-fullscreen-error" role="status">Fullscreen is unavailable in this browser.</p>}
      {finished ? (
        <section className="activity-finished">
          <Sparkles size={72} aria-hidden="true" />
          <h1>Great job!</h1>
          <p>You finished all {total} {unit}s!</p>
          <div className="activity-finish-actions">
            <button onClick={() => { setIndex(0); setFinished(false); setResult(null) }}>Play again</button>
            <Link to={`${root}/grades/${grade}`}>More games</Link>
          </div>
        </section>
      ) : (
        <section className="activity-round">
          <div className="activity-progress" aria-label={`${unit} ${index + 1} of ${total}`}>
            <span>{index + 1} / {total}</span>
            <div className="activity-progress-track"><div style={{ width: `${(index + 1) / total * 100}%` }} /></div>
          </div>
          {activity === 'count' ? (
            <>
              <h1 className="activity-prompt" aria-label={`How many ${count.color ? `${count.color} ` : ''}${count.target}s${count.color ? '' : ' of any color'}?`}>
                How many <Picture shape={count.target} color={count.color} className={count.color ? '' : 'activity-picture--any-color'} /> {count.color ? '?' : 'of any color?'}
              </h1>
              <div className="activity-shape-board activity-count-board" aria-label={`Shapes to count: ${count.shapes.map((item) => `${item.color} ${item.shape}`).join(', ')}`}>
                {count.shapes.map((item, i) => {
                  const slot = (i * 5 + index * 3) % 12
                  return <Picture key={i} shape={item.shape} color={item.color} className={`activity-count-slot-${slot}`} />
                })}
              </div>
              <div className="activity-answers" aria-label="Choose a number">
                {count.choices.map((choice) => <button key={choice} disabled={result === 'correct'} onClick={() => answer(choice === count.answer)}>{choice}</button>)}
              </div>
            </>
          ) : activity === 'sort' ? (
            <SortingRound key={index} question={sortingQuestions[index]} onResult={setResult} />
          ) : (
            <>
              <h1 className="activity-prompt">What comes next?</h1>
              <div className="activity-shape-board activity-pattern-board" aria-label={`Shape pattern: ${pattern.pattern.join(', ')}, what comes next?`}>
                {pattern.pattern.map((shape, i) => <Picture key={i} shape={shape} />)}
                <span className="activity-question-mark">?</span>
              </div>
              <div className="activity-answers" aria-label="Choose a shape">
                {pattern.choices.map((choice) => <button key={choice} disabled={result === 'correct'} onClick={() => answer(choice === pattern.answer)} aria-label={choice}><Picture shape={choice} /></button>)}
              </div>
            </>
          )}
          <div className="activity-feedback" aria-live="polite">
            {result === 'wrong' && <span>Try again!</span>}
            {result === 'correct' && <><span><Check size={23} /> Great job!</span><button onClick={next}>{index + 1 === total ? 'Finish' : 'Next'} <ArrowRight size={20} /></button></>}
          </div>
        </section>
      )}
    </main>
  )
}
