import { useState, type FormEvent } from 'react'
import { ArrowLeft, Grid2X2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildCrosswordCells, crosswordSize, crosswordWords, matchesAnswer, revealedLetter, type CrosswordWord } from './crosswordData'
import { upperCrosswordSize, upperCrosswordWords } from './crosswordUpperData'
import { crosswordPdfBase64 } from './crosswordPdf'
import { submitTracingPdf } from '../tracing/tracingSubmit'
import '../tracing/Tracing.css'
import './Crossword.css'

const lowerCells = buildCrosswordCells(crosswordSize, crosswordWords)
const upperCells = buildCrosswordCells(upperCrosswordSize, upperCrosswordWords)

export function Crossword({ level = '2-3' }: { level?: '2-3' | '4-6' }) {
  const upper = level === '4-6'
  const words = upper ? upperCrosswordWords : crosswordWords
  const size = upper ? upperCrosswordSize : crosswordSize
  const cells = upper ? upperCells : lowerCells
  const [selectedId, setSelectedId] = useState(words[0].id)
  const [solved, setSolved] = useState<string[]>([])
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'confirming' | 'submitting' | 'success' | 'error'>('idle')
  const [studentName, setStudentName] = useState('')
  const [submitError, setSubmitError] = useState('')
  const selected = words.find((word) => word.id === selectedId)!
  const complete = solved.length === words.length

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = studentName.trim()
    if (!name) { setSubmitError('Please enter your name.'); return }
    setSubmitState('submitting')
    setSubmitError('')
    try {
      const pdf = crosswordPdfBase64(name, size, words, solved)
      const success = await submitTracingPdf(name, 'Thanksgiving Crossword 4-6', pdf)
      if (!success) throw new Error('The server did not confirm the submission.')
      setSubmitState('success')
    } catch (error) {
      console.error('[crossword submit] failed', error)
      setSubmitError(error instanceof Error ? error.message : 'Unknown error')
      setSubmitState('error')
    }
  }

  function choose(word: CrosswordWord) {
    setSelectedId(word.id)
    setValue('')
    setFeedback('')
  }

  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (solved.includes(selected.id)) {
      setFeedback('You already solved this clue. Choose another one!')
    } else if (matchesAnswer(value, selected)) {
      setSolved((previous) => [...previous, selected.id])
      setValue('')
      setFeedback('Great job! Your word is on the puzzle.')
    } else {
      setFeedback(value.trim() ? 'Not quite. Check your spelling and try again!' : 'Type your answer first.')
    }
  }

  return <main className="crossword-page">
    <header className="crossword-header">
      <Link to="/tools/thanksgiving" className="back-link"><ArrowLeft size={17} /> Back to Thanksgiving</Link>
      <h1>Thanksgiving Crossword <span>Grades {upper ? '4–6' : '2–3'}</span></h1>
    </header>
    <p className="crossword-intro">Choose a clue, type your answer, and check it. Correct words appear in the puzzle!</p>
    <div className="crossword-layout">
      <section className="crossword-board-section" aria-label="Crossword puzzle">
        <p className={`crossword-scroll-hint${upper ? ' is-large' : ''}`}>Swipe the puzzle left or right to see the whole grid.</p>
        <div className="crossword-grid-scroll">
        <div className="crossword-grid" role="group" aria-label="Crossword grid" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, minWidth: Math.max(560, size * 48 + 16) }}>
          {cells.map((cell) => {
            const letter = revealedLetter(cell, solved)
            const active = cell.words.some((word) => word.id === selected.id)
            return cell.words.length === 0
              ? <span className="crossword-block" key={`${cell.row}-${cell.col}`} aria-hidden="true" />
              : <button type="button" className={`crossword-cell${active ? ' is-active' : ''}${cell.number ? ' is-numbered' : ''}`} key={`${cell.row}-${cell.col}`}
                aria-label={`Row ${cell.row + 1}, column ${cell.col + 1}${cell.number ? `, clue ${cell.number}` : ''}${letter ? `, ${letter}` : ', empty'}`}
                onClick={() => {
                  const currentIndex = cell.words.findIndex((word) => word.id === selected.id)
                  choose(cell.words[(currentIndex + 1) % cell.words.length])
                }}>
                {cell.number && <span className="crossword-number">{cell.number}</span>}
                {letter && <span className="crossword-letter">{letter}</span>}
              </button>
          })}
        </div>
        </div>
        <p className="crossword-progress">{solved.length} of {words.length} words solved</p>
      </section>
      <section className="crossword-panel" aria-label="Clues and answer">
        <form className="crossword-answer" onSubmit={check}>
          <label htmlFor="crossword-answer"><strong>{selected.number} {selected.direction === 'across' ? 'Across' : 'Down'}:</strong> {selected.clue} <span>({selected.answer.length} letters)</span></label>
          <div className="crossword-answer-row">
            <input id="crossword-answer" value={value} onChange={(event) => setValue(event.target.value)} maxLength={selected.answer.length} autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={solved.includes(selected.id)} />
            <button type="submit" disabled={solved.includes(selected.id)}>Check</button>
          </div>
          <p className="crossword-feedback" aria-live="polite">{complete ? 'Amazing! You solved the whole crossword!' : feedback || (solved.includes(selected.id) ? 'Solved! Choose another clue.' : ' ')}</p>
        </form>
        <div className="crossword-clues">
          {(['across', 'down'] as const).map((direction) => <div key={direction}>
            <h2>{direction === 'across' ? 'Across' : 'Down'}</h2>
            <ol>
              {words.filter((word) => word.direction === direction).map((word) => <li key={word.id}>
                <button type="button" className={`crossword-clue${selected.id === word.id ? ' is-selected' : ''}`} aria-pressed={selected.id === word.id} onClick={() => choose(word)}>
                  <strong>{word.number}.</strong> {word.clue} <span>({word.answer.length}){solved.includes(word.id) ? ' ✓' : ''}</span>
                </button>
              </li>)}
            </ol>
          </div>)}
        </div>
        <button type="button" className="crossword-reset" onClick={() => {
          if (window.confirm('Start the crossword over?')) { setSolved([]); choose(words[0]) }
        }}><Grid2X2 size={16} aria-hidden="true" /> Start over</button>
        {upper && <button type="button" className="crossword-submit" onClick={() => { setSubmitError(''); setSubmitState('confirming') }}>Submit crossword</button>}
      </section>
    </div>
    {upper && submitState !== 'idle' && <div className="tracing-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="crossword-submit-title">
      <div className="tracing-modal">
        {submitState === 'success' ? <>
          <p id="crossword-submit-title">Your crossword was submitted!</p>
          <div className="tracing-modal-actions"><button type="button" onClick={() => setSubmitState('idle')}>Close</button><Link to="/tools/thanksgiving">Back to Thanksgiving</Link></div>
        </> : submitState === 'submitting' ? <p id="crossword-submit-title">Submitting…</p> : <form className="crossword-submit-form" onSubmit={(event) => void submit(event)}>
          <p id="crossword-submit-title">{submitState === 'error' ? 'Submission failed. Please try again.' : 'Submit your crossword?'}</p>
          <p>{solved.length} of {words.length} words solved. Your PDF will show your current progress.</p>
          <label className="tracing-name-field"><span>Your name</span><input value={studentName} onChange={(event) => setStudentName(event.target.value)} autoComplete="name" maxLength={100} required /></label>
          {submitError && <p className="crossword-submit-error" role="alert">{submitError}</p>}
          <div className="tracing-modal-actions"><button type="button" onClick={() => setSubmitState('idle')}>Cancel</button><button type="submit" className="tracing-export">{submitState === 'error' ? 'Try again' : 'Submit'}</button></div>
        </form>}
      </div>
    </div>}
  </main>
}
