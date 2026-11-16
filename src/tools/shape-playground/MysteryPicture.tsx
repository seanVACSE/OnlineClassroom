import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowLeft, Maximize, Minimize, Palette, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { answerColors, mysteryPuzzles, type PictureRegion } from './mysteryPictureData'
import './MysteryPicture.css'

const back = '/tools/shape-playground/grades/k-1'

function QuestionDialog({ region, onClose, onCorrect }: { region: PictureRegion; onClose: () => void; onCorrect: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])

  function answer(value: number) {
    if (value === region.addends[0] + region.addends[1]) onCorrect()
    else setWrong(true)
  }

  function handleKey(event: KeyboardEvent<HTMLDialogElement>) {
    if (/^[0-9]$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      answer(Number(event.key))
    }
  }

  return (
    <dialog ref={dialogRef} className="mystery-dialog" aria-labelledby="mystery-question-title" onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={handleKey}>
      <h2 id="mystery-question-title">What is {region.addends[0]} + {region.addends[1]}?</h2>
      <p>Choose your answer:</p>
      <div className="mystery-number-pad">
        {Array.from({ length: 10 }, (_, number) => (
          <button key={number} onClick={() => answer(number)}>{number}</button>
        ))}
      </div>
      <p className="mystery-dialog-feedback" role="status">{wrong ? 'Try again!' : '\u00a0'}</p>
      <button className="mystery-cancel" onClick={onClose}>Back to picture</button>
    </dialog>
  )
}

export function MysteryPicture() {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [unlockedIndex, setUnlockedIndex] = useState(0)
  const [solvedByPuzzle, setSolvedByPuzzle] = useState<Record<string, string[]>>({})
  const [selected, setSelected] = useState<PictureRegion | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const gameRef = useRef<HTMLElement>(null)
  const regionRefs = useRef<Record<string, SVGGElement | null>>({})
  const puzzle = mysteryPuzzles[puzzleIndex]
  const solved = solvedByPuzzle[puzzle.id] ?? []

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

  function closeQuestion() {
    const id = selected?.id
    setSelected(null)
    if (id) requestAnimationFrame(() => regionRefs.current[id]?.focus())
  }

  function solve() {
    if (!selected) return
    setSolvedByPuzzle((previous) => ({ ...previous, [puzzle.id]: [...(previous[puzzle.id] ?? []), selected.id] }))
    if (solved.length + 1 === puzzle.regions.length) {
      setUnlockedIndex((previous) => Math.max(previous, Math.min(puzzleIndex + 1, mysteryPuzzles.length - 1)))
    }
    closeQuestion()
  }

  const finished = solved.length === puzzle.regions.length
  const availableColors = new Set(puzzle.regions.map((region) => region.addends[0] + region.addends[1]))
  return (
    <main className="activity-game mystery-game" ref={gameRef}>
      <div className="activity-game-header">
        <Link className="activity-back" to={back} aria-label="Back to grades K–1 activities"><ArrowLeft size={22} /><span>Back</span></Link>
        <span className="activity-game-title">Math Mystery Picture</span>
        <button className="activity-fullscreen" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
      </div>
      {fullscreenError && <p className="activity-fullscreen-error" role="status">Fullscreen is unavailable in this browser.</p>}
      <section className="mystery-content">
        <h1>Math Mystery Picture <Palette size={26} aria-hidden="true" /></h1>
        <p>Picture {puzzleIndex + 1} of {mysteryPuzzles.length} · {puzzle.difficulty} — Tap a problem to reveal a color!</p>
        <div className="activity-progress" aria-label={`${solved.length} of ${puzzle.regions.length} parts colored`}>
          <span>{solved.length} / {puzzle.regions.length}</span>
          <div className="activity-progress-track"><div style={{ width: `${solved.length / puzzle.regions.length * 100}%` }} /></div>
        </div>
        <div className="mystery-board">
          <svg viewBox="0 0 800 520" role="group" aria-label="Mystery picture. Choose an unsolved addition problem." className="mystery-picture">
            {puzzle.regions.map((region) => {
              const isSolved = solved.includes(region.id)
              const sum = region.addends[0] + region.addends[1]
              return (
                <g
                  key={region.id}
                  ref={(element) => { regionRefs.current[region.id] = element }}
                  className={`mystery-region${isSolved ? ' is-solved' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-disabled={isSolved}
                  aria-label={isSolved ? `${region.name}, colored ${answerColors[sum].name}` : `${region.name}: ${region.addends[0]} plus ${region.addends[1]}, not yet colored`}
                  onClick={() => { if (!isSolved) setSelected(region) }}
                  onKeyDown={(event) => {
                    if (!isSolved && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      setSelected(region)
                    }
                  }}
                >
                  <path d={region.path} fill={isSolved ? answerColors[sum].fill : '#fffefa'} fillRule="evenodd" />
                  {!isSolved && <text x={region.labelX} y={region.labelY} textAnchor="middle" dominantBaseline="central">{region.addends[0]}+{region.addends[1]}</text>}
                </g>
              )
            })}
          </svg>
        </div>
        <div className="mystery-legend" aria-label="Answer color key">
          {Object.entries(answerColors).filter(([answer]) => availableColors.has(Number(answer))).map(([answer, color]) => <span key={answer}><i style={{ backgroundColor: color.fill }} aria-hidden="true" />{answer} = {color.name}</span>)}
        </div>
        <div className="mystery-finish" aria-live="polite">
          {finished && <strong><Sparkles size={22} aria-hidden="true" /> {puzzleIndex === mysteryPuzzles.length - 1 ? 'You finished all the pictures!' : 'You revealed the picture!'}</strong>}
        </div>
        <nav className="mystery-navigation" aria-label="Picture navigation">
          <button disabled={puzzleIndex === 0} onClick={() => setPuzzleIndex((index) => index - 1)}>Previous picture</button>
          {finished && <button onClick={() => setSolvedByPuzzle((previous) => ({ ...previous, [puzzle.id]: [] }))}>Play this picture again</button>}
          {puzzleIndex < mysteryPuzzles.length - 1 && <button disabled={puzzleIndex + 1 > unlockedIndex} onClick={() => setPuzzleIndex((index) => index + 1)}>{puzzleIndex + 1 > unlockedIndex ? 'Finish to unlock next' : 'Next picture'}</button>}
        </nav>
      </section>
      {selected && <QuestionDialog key={selected.id} region={selected} onClose={closeQuestion} onCorrect={solve} />}
    </main>
  )
}
