import { useState, type FormEvent } from 'react'
import { ArrowLeft, Grid2X2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { crosswordSize, crosswordWords, matchesAnswer, wordCells, type CrosswordWord } from './crosswordData'
import './Crossword.css'

const cells = Array.from({ length: crosswordSize * crosswordSize }, (_, index) => {
  const row = Math.floor(index / crosswordSize)
  const col = index % crosswordSize
  const words = crosswordWords.filter((word) => wordCells(word).some((cell) => cell.row === row && cell.col === col))
  const start = words.find((word) => word.row === row && word.col === col)
  return { row, col, words, number: start?.number }
})

export function Crossword() {
  const [selectedId, setSelectedId] = useState(crosswordWords[0].id)
  const [solved, setSolved] = useState<string[]>([])
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const selected = crosswordWords.find((word) => word.id === selectedId)!
  const complete = solved.length === crosswordWords.length

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
      <h1>Thanksgiving Crossword <span>Grades 2–3</span></h1>
    </header>
    <p className="crossword-intro">Choose a clue, type your answer, and check it. Correct words appear in the puzzle!</p>
    <div className="crossword-layout">
      <section className="crossword-board-section" aria-label="Crossword puzzle">
        <div className="crossword-grid" role="group" aria-label="Crossword grid">
          {cells.map((cell) => {
            const solvedWord = cell.words.find((word) => solved.includes(word.id))
            const letter = solvedWord && wordCells(solvedWord).find((part) => part.row === cell.row && part.col === cell.col)?.letter
            const active = cell.words.some((word) => word.id === selected.id)
            return cell.words.length === 0
              ? <span className="crossword-block" key={`${cell.row}-${cell.col}`} aria-hidden="true" />
              : <button type="button" className={`crossword-cell${active ? ' is-active' : ''}`} key={`${cell.row}-${cell.col}`}
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
        <p className="crossword-progress">{solved.length} of {crosswordWords.length} words solved</p>
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
              {crosswordWords.filter((word) => word.direction === direction).map((word) => <li key={word.id}>
                <button type="button" className={`crossword-clue${selected.id === word.id ? ' is-selected' : ''}`} aria-pressed={selected.id === word.id} onClick={() => choose(word)}>
                  <strong>{word.number}.</strong> {word.clue} <span>({word.answer.length}){solved.includes(word.id) ? ' ✓' : ''}</span>
                </button>
              </li>)}
            </ol>
          </div>)}
        </div>
        <button type="button" className="crossword-reset" onClick={() => {
          if (window.confirm('Start the crossword over?')) { setSolved([]); choose(crosswordWords[0]) }
        }}><Grid2X2 size={16} aria-hidden="true" /> Start over</button>
      </section>
    </div>
  </main>
}
