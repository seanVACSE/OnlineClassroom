import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Circle, LayoutGrid, Maximize, Minimize, Paintbrush, Shapes, Sparkles, Square, Star, Tags, Triangle } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { countingQuestions, patternQuestions, type ActivityShape } from './activityQuestions'
import './ShapeActivities.css'

const root = '/tools/shape-playground'
const shapeIcons = { circle: Circle, square: Square, triangle: Triangle, star: Star }
const cardImages = import.meta.glob<string>('/src/assets/shape-playground/cards/*.png', { eager: true, import: 'default' })

function CardImage({ name, children }: { name: string; children: ReactNode }) {
  const image = cardImages[`/src/assets/shape-playground/cards/${name}.png`]
  return image ? <img className="activity-card-image" src={image} alt="" /> : children
}

function Picture({ shape, className = '' }: { shape: ActivityShape; className?: string }) {
  const Icon = shapeIcons[shape]
  return <Icon className={`activity-picture activity-picture--${shape} ${className}`} aria-hidden="true" strokeWidth={2} />
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
    <main className="activity-page">
      <ActivityHeader back="/" title="Shape Playground" backLabel="Back to classroom" />
      <section className="activity-select">
        <h2>Choose an activity</h2>
        <div className="activity-cards">
          <Link className="activity-card activity-card--yellow" to={`${root}/free`}>
            <CardImage name="free-design"><Paintbrush size={54} aria-hidden="true" /></CardImage><strong>Free Design</strong><span>Make your own picture</span>
          </Link>
          <Link className="activity-card activity-card--green" to={`${root}/grades/k-1`}>
            <CardImage name="grades-k-1"><Shapes size={54} aria-hidden="true" /></CardImage><strong>Grades K–1</strong><span>Play with shapes</span>
          </Link>
          <Link className="activity-card activity-card--blue" to={`${root}/grades/2-3`}>
            <CardImage name="grades-2-3"><LayoutGrid size={54} aria-hidden="true" /></CardImage><strong>Grades 2–3</strong><span>Shape activities</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

export function ShapeGradeSelect() {
  const { grade } = useParams()
  if (grade !== 'k-1' && grade !== '2-3') return <Navigate to={root} replace />
  return (
    <main className="activity-page">
      <ActivityHeader back={root} title={`Grades ${grade === 'k-1' ? 'K–1' : '2–3'}`} backLabel="Back to shape activities" />
      <section className="activity-select">
        {grade === 'k-1' ? (
          <>
            <h2>Pick a game</h2>
            <div className="activity-cards">
              <Link className="activity-card activity-card--yellow" to={`${root}/grades/k-1/count`}>
                <CardImage name="count-the-shapes"><span className="activity-card-shapes"><Picture shape="circle" /><Picture shape="triangle" /></span></CardImage>
                <strong>1. Count the Shapes</strong><span>10 questions</span>
              </Link>
              <Link className="activity-card activity-card--blue" to={`${root}/grades/k-1/patterns`}>
                <CardImage name="shape-patterns"><span className="activity-card-shapes"><Picture shape="square" /><Picture shape="star" /></span></CardImage>
                <strong>2. Shape Patterns</strong><span>10 questions</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2>Pick an activity</h2>
            <div className="activity-cards">
              <Link className="activity-card activity-card--yellow" to={`${root}/grades/2-3/nametag`}>
                <CardImage name="create-a-nametag"><Tags size={54} aria-hidden="true" /></CardImage><strong>Create a Nametag</strong><span>Make a nametag with shapes and text</span>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export function ShapeGame() {
  const { grade, activity } = useParams()
  if (grade !== 'k-1' || (activity !== 'count' && activity !== 'patterns')) return <Navigate to={root} replace />
  return <Game key={activity} activity={activity} />
}

function Game({ activity }: { activity: 'count' | 'patterns' }) {
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<'wrong' | 'correct' | null>(null)
  const [finished, setFinished] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const gameRef = useRef<HTMLElement>(null)
  const count = countingQuestions[index]
  const pattern = patternQuestions[index]
  const total = activity === 'count' ? countingQuestions.length : patternQuestions.length

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
        <Link className="activity-back" to={`${root}/grades/k-1`} aria-label="Back to grades K–1 activities"><ArrowLeft size={22} /><span>Back</span></Link>
        <span className="activity-game-title">{activity === 'count' ? 'Count the Shapes' : 'Shape Patterns'}</span>
        <button className="activity-fullscreen" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
      </div>
      {fullscreenError && <p className="activity-fullscreen-error" role="status">Fullscreen is unavailable in this browser.</p>}
      {finished ? (
        <section className="activity-finished">
          <Sparkles size={72} aria-hidden="true" />
          <h1>Great job!</h1>
          <p>You finished all {total} questions!</p>
          <div className="activity-finish-actions">
            <button onClick={() => { setIndex(0); setFinished(false); setResult(null) }}>Play again</button>
            <Link to={`${root}/grades/k-1`}>More games</Link>
          </div>
        </section>
      ) : (
        <section className="activity-round">
          <div className="activity-progress" aria-label={`Question ${index + 1} of ${total}`}>
            <span>{index + 1} / {total}</span>
            <div className="activity-progress-track"><div style={{ width: `${(index + 1) / total * 100}%` }} /></div>
          </div>
          {activity === 'count' ? (
            <>
              <h1 className="activity-prompt" aria-label={`How many ${count.target} shapes?`}>How many <Picture shape={count.target} /> ?</h1>
              <div className="activity-shape-board" aria-label={`Shapes to count: ${count.shapes.join(', ')}`}>
                {count.shapes.map((shape, i) => <Picture key={i} shape={shape} />)}
              </div>
              <div className="activity-answers" aria-label="Choose a number">
                {count.choices.map((choice) => <button key={choice} disabled={result === 'correct'} onClick={() => answer(choice === count.answer)}>{choice}</button>)}
              </div>
            </>
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
