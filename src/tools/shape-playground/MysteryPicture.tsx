import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowLeft, Maximize, Minimize, Palette, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { answerColors, mysteryPuzzles, type PictureRegion } from './mysteryPictureData'
import { checkAnswer, colorRegion, retryDelayMs, solveRegion, type PictureProgress } from './mysteryGame'
import { kindergartenColors, kindergartenNumber } from './kindergartenPicture'
import './MysteryPicture.css'

function QuestionDialog({ region, onClose, onAnswer, waiting }: { region: PictureRegion; onClose: () => void; onAnswer: (value: number) => void; waiting: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])

  function handleKey(event: KeyboardEvent<HTMLDialogElement>) {
    if (/^[0-9]$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      onAnswer(Number(event.key))
    }
  }

  return (
    <dialog ref={dialogRef} className="mystery-dialog" aria-labelledby="mystery-question-title" onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={handleKey}>
      <h2 id="mystery-question-title">What is {region.addends[0]} + {region.addends[1]}?</h2>
      <p>Choose your answer:</p>
      <div className="mystery-number-pad">
        {Array.from({ length: 10 }, (_, number) => (
          <button key={number} disabled={waiting} onClick={() => onAnswer(number)}>{number}</button>
        ))}
      </div>
      <p className="mystery-dialog-feedback" role="status">{waiting ? 'Take a moment to think. Please wait before trying again.' : 'Choose the sum.'}</p>
      <button className="mystery-cancel" onClick={onClose}>Back to picture</button>
    </dialog>
  )
}

export function MysteryPicture({ back, backLabel, mode = 'addition' }: { back: string; backLabel: string; mode?: 'addition' | 'numbers' }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [unlockedIndex, setUnlockedIndex] = useState(0)
  const [progressByPuzzle, setProgressByPuzzle] = useState<Record<string, PictureProgress>>({})
  const [selected, setSelected] = useState<PictureRegion | null>(null)
  const [selectedColor, setSelectedColor] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [retryAt, setRetryAt] = useState(0)
  const retryAtRef = useRef(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const gameRef = useRef<HTMLElement>(null)
  const regionRefs = useRef<Record<string, SVGGElement | null>>({})
  const puzzle = mysteryPuzzles[puzzleIndex]
  const isNumbers = mode === 'numbers'
  const colors = isNumbers ? kindergartenColors : answerColors
  const title = isNumbers ? 'Color by Number' : 'Math Mystery Picture: Addition'
  const progress = progressByPuzzle[puzzle.id] ?? { solved: [], colored: [] }

  useEffect(() => {
    if (!retryAt) return
    const timer = window.setTimeout(() => {
      retryAtRef.current = 0
      setRetryAt(0)
    }, Math.max(0, retryAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [retryAt])

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

  function answer(value: number) {
    if (!selected) return
    const result = checkAnswer(selected, value, retryAtRef.current, Date.now())
    if (result === 'wait') return
    if (result === 'wrong') {
      const deadline = Date.now() + retryDelayMs
      retryAtRef.current = deadline
      setRetryAt(deadline)
      return
    }
    setProgressByPuzzle((previous) => ({ ...previous, [puzzle.id]: solveRegion(previous[puzzle.id] ?? { solved: [], colored: [] }, selected) }))
    setFeedback('Correct! Choose the matching color, then tap the number.')
    closeQuestion()
  }

  function selectRegion(region: PictureRegion) {
    if (progress.colored.includes(region.id)) return
    if (!isNumbers && !progress.solved.includes(region.id)) {
      setFeedback('')
      setSelected(region)
      return
    }
    if (selectedColor === null) {
      setFeedback('Choose a color first, then tap the matching number.')
      return
    }
    const target = isNumbers ? kindergartenNumber(puzzle.id, region) : region.addends[0] + region.addends[1]
    if (selectedColor !== target) {
      setFeedback('That color does not match this number. Try another color!')
      return
    }
    setProgressByPuzzle((previous) => ({ ...previous, [puzzle.id]: colorRegion(previous[puzzle.id] ?? { solved: [], colored: [] }, region, selectedColor, target, !isNumbers) }))
    setFeedback('Nice coloring!')
    if (progress.colored.length + 1 === puzzle.regions.length) {
      setUnlockedIndex((previous) => Math.max(previous, Math.min(puzzleIndex + 1, mysteryPuzzles.length - 1)))
    }
  }

  function changePicture(index: number) {
    setPuzzleIndex(index)
    setSelectedColor(null)
    setFeedback('')
  }

  const finished = progress.colored.length === puzzle.regions.length
  const availableColors = new Set(puzzle.regions.map((region) => isNumbers ? kindergartenNumber(puzzle.id, region) : region.addends[0] + region.addends[1]))
  return (
    <main className="activity-game mystery-game" ref={gameRef}>
      <div className="activity-game-header">
        <Link className="activity-back" to={back} aria-label={backLabel}><ArrowLeft size={22} /><span>Back</span></Link>
        <span className="activity-game-title">{title}</span>
        <button className="activity-fullscreen" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
      </div>
      {fullscreenError && <p className="activity-fullscreen-error" role="status">Fullscreen is unavailable in this browser.</p>}
      <section className="mystery-content">
        <h1>{title} <Palette size={26} aria-hidden="true" /></h1>
        <p>Picture {puzzleIndex + 1} of {mysteryPuzzles.length} · {puzzle.difficulty} — {isNumbers ? 'Choose a color, then tap the matching number!' : 'Solve a problem, then choose its color and tap the number!'}</p>
        <div className="activity-progress" aria-label={`${progress.colored.length} of ${puzzle.regions.length} parts colored`}>
          <span>{progress.colored.length} / {puzzle.regions.length}</span>
          <div className="activity-progress-track"><div style={{ width: `${progress.colored.length / puzzle.regions.length * 100}%` }} /></div>
        </div>
        <div className="mystery-board">
          <svg viewBox="0 0 800 520" role="group" aria-label={isNumbers ? 'Picture. Choose a color and match the numbers.' : 'Mystery picture. Solve problems and color the matching numbers.'} className="mystery-picture">
            {puzzle.regions.map((region) => {
              const isSolved = isNumbers || progress.solved.includes(region.id)
              const isColored = progress.colored.includes(region.id)
              const sum = isNumbers ? kindergartenNumber(puzzle.id, region) : region.addends[0] + region.addends[1]
              return (
                <g
                  key={region.id}
                  ref={(element) => { regionRefs.current[region.id] = element }}
                  className={`mystery-region${isColored ? ' is-colored' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-disabled={isColored}
                  aria-label={isColored ? `${region.name}, colored ${colors[sum].name}` : isSolved ? `${region.name}, ${isNumbers ? 'number' : 'answer'} ${sum}, ready to color` : `${region.name}: ${region.addends[0]} plus ${region.addends[1]}, not yet solved`}
                  onClick={() => selectRegion(region)}
                  onKeyDown={(event) => {
                    if (!isColored && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      selectRegion(region)
                    }
                  }}
                >
                  <path d={region.path} fill={isColored ? colors[sum].fill : '#fffefa'} fillRule="evenodd" />
                  {!isColored && <text x={region.labelX} y={region.labelY} textAnchor="middle" dominantBaseline="central">{isSolved ? sum : `${region.addends[0]}+${region.addends[1]}`}</text>}
                </g>
              )
            })}
            {puzzle.details?.map((path, index) => <path key={index} d={path} fill="#263d34" pointerEvents="none" aria-hidden="true" />)}
          </svg>
        </div>
        <div className="mystery-legend" role="group" aria-label="Choose a color">
          {Object.entries(colors).filter(([answer]) => availableColors.has(Number(answer))).map(([answer, color]) => <button key={answer} aria-pressed={selectedColor === Number(answer)} onClick={() => { setSelectedColor(Number(answer)); setFeedback(`${color.name} selected. Tap a ${answer} to color it.`) }}><i style={{ backgroundColor: color.fill }} aria-hidden="true" />{answer} = {color.name}</button>)}
        </div>
        <div className="mystery-color-feedback" role="status">{feedback}</div>
        <div className="mystery-finish" aria-live="polite">
          {finished && <strong><Sparkles size={22} aria-hidden="true" /> {puzzleIndex === mysteryPuzzles.length - 1 ? 'You finished all the pictures!' : 'You revealed the picture!'}</strong>}
        </div>
        <nav className="mystery-navigation" aria-label="Picture navigation">
          <button disabled={puzzleIndex === 0} onClick={() => changePicture(puzzleIndex - 1)}>Previous picture</button>
          {finished && <button onClick={() => { setProgressByPuzzle((previous) => ({ ...previous, [puzzle.id]: { solved: [], colored: [] } })); setSelectedColor(null); setFeedback('') }}>Play this picture again</button>}
          {puzzleIndex < mysteryPuzzles.length - 1 && <button disabled={puzzleIndex + 1 > unlockedIndex} onClick={() => changePicture(puzzleIndex + 1)}>{puzzleIndex + 1 > unlockedIndex ? 'Finish to unlock next' : 'Next picture'}</button>}
        </nav>
      </section>
      {selected && <QuestionDialog key={selected.id} region={selected} onClose={closeQuestion} onAnswer={answer} waiting={retryAt !== 0} />}
    </main>
  )
}
