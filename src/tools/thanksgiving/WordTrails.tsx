import { useRef, useState, type PointerEvent } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { extendTrail, matchingTrail, trailPuzzles } from './wordTrailsData'
import './WordTrails.css'

interface PuzzleProgress {
  found: string[]
}

export function WordTrails() {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, PuzzleProgress>>({})
  const [path, setPath] = useState<number[]>([])
  const [feedback, setFeedback] = useState('')
  const [hint, setHint] = useState<number | null>(null)
  const pathRef = useRef<number[]>([])
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const puzzle = trailPuzzles[puzzleIndex]
  const columns = puzzle.rows[0].length
  const letters = puzzle.rows.join('').split('')
  const found = progress[puzzle.id]?.found ?? []
  const foundWords = puzzle.words.filter((word) => found.includes(word.word))
  const occupied = new Set(foundWords.flatMap((word) => word.cells))
  const complete = found.length === puzzle.words.length

  function setTrail(next: number[]) {
    pathRef.current = next
    setPath(next)
  }

  function addCell(index: number) {
    if (occupied.has(index)) return
    setTrail(extendTrail(pathRef.current, index, columns))
  }

  function checkTrail() {
    const current = pathRef.current
    if (!current.length) { setFeedback('Choose some letters first.'); return }
    const match = matchingTrail(puzzle, current)
    if (!match) {
      setFeedback('Not a hidden word. Try another path!')
      setTrail([])
      return
    }
    if (found.includes(match.word)) {
      setFeedback('You already found that word!')
      setTrail([])
      return
    }
    setProgress((previous) => ({
      ...previous,
      [puzzle.id]: { found: [...(previous[puzzle.id]?.found ?? []), match.word] },
    }))
    setFeedback(match.special ? `You found the edge-to-edge theme word: ${match.word}!` : `You found ${match.word}!`)
    setHint(null)
    setTrail([])
  }

  function cellAt(x: number, y: number): number | undefined {
    const element = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('[data-trail-cell]')
    if (!element || !gridRef.current?.contains(element)) return undefined
    return Number(element.dataset.trailCell)
  }

  function startPointer(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== 0 || !event.isPrimary) return
    event.preventDefault()
    if (occupied.has(index)) { setFeedback('Those letters are already in a found word.'); return }
    if (pathRef.current[pathRef.current.length - 1] === index && pathRef.current.length > 1) {
      checkTrail()
      return
    }
    addCell(index)
    setFeedback('')
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
    gridRef.current?.setPointerCapture(event.pointerId)
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    if (!start || start.id !== event.pointerId) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) start.moved = true
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    const steps = Math.max(1, Math.ceil(distance / 8))
    for (let i = 1; i <= steps; i += 1) {
      const cell = cellAt(start.x + (event.clientX - start.x) * i / steps, start.y + (event.clientY - start.y) * i / steps)
      if (cell !== undefined) addCell(cell)
    }
    start.x = event.clientX
    start.y = event.clientY
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    const active = pointer.current
    if (!active || active.id !== event.pointerId) return
    pointer.current = null
    if (active.moved) checkTrail()
  }

  function changePuzzle(index: number) {
    setPuzzleIndex(index)
    setTrail([])
    setHint(null)
    setFeedback('')
  }

  function lines(cells: number[]): string {
    return cells.map((cell) => `${(cell % columns + 0.5) * 100 / columns},${(Math.floor(cell / columns) + 0.5) * 100 / puzzle.rows.length}`).join(' ')
  }

  return <main className="trails-page">
    <header className="trails-header">
      <Link to="/tools/thanksgiving" className="back-link"><ArrowLeft size={18} /> Back to Thanksgiving</Link>
      <h1>Thanksgiving Word Trails</h1>
    </header>
    <nav className="trails-puzzles" aria-label="Choose a puzzle">
      {trailPuzzles.map((item, index) => <button key={item.id} type="button" aria-pressed={puzzleIndex === index} onClick={() => changePuzzle(index)}>{item.name}</button>)}
    </nav>
    <div className="trails-layout">
      <section className="trails-board-panel" aria-label={`${puzzle.name} letter puzzle`}>
        <h2>{puzzle.name}</h2>
        <p>{puzzle.theme}</p>
        <div className="trails-grid" ref={gridRef} role="group" aria-label="Letter grid" onPointerMove={movePointer} onPointerUp={endPointer}
          onPointerCancel={() => { pointer.current = null; setTrail([]); setFeedback('Selection cancelled. Try again.') }}>
          <svg className="trails-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {foundWords.map((word) => <polyline key={word.word} points={lines(word.cells)} className={word.special ? 'trails-line-special' : 'trails-line-found'} />)}
            {path.length > 1 && <polyline points={lines(path)} className="trails-line-active" />}
          </svg>
          {letters.map((letter, index) => {
            const word = foundWords.find((item) => item.cells.includes(index))
            return <button key={index} type="button" data-trail-cell={index}
              className={`trails-cell${word ? word.special ? ' is-special' : ' is-found' : ''}${path.includes(index) ? ' is-active' : ''}${hint === index ? ' is-hint' : ''}`}
              aria-label={`Row ${Math.floor(index / columns) + 1}, column ${index % columns + 1}, ${letter}${word ? ', found' : ''}`}
              aria-pressed={path.includes(index)} onPointerDown={(event) => startPointer(event, index)}
              onClick={(event) => {
                if (event.detail !== 0) return
                if (occupied.has(index)) { setFeedback('Those letters are already in a found word.'); return }
                if (pathRef.current[pathRef.current.length - 1] === index && pathRef.current.length > 1) checkTrail()
                else { addCell(index); setFeedback('') }
              }}>{letter}</button>
          })}
        </div>
        <div className="trails-selection" aria-live="polite">Selected: {path.map((index) => letters[index]).join('') || '—'}</div>
        <div className="trails-actions">
          <button type="button" onClick={checkTrail} disabled={!path.length}>Check word</button>
          <button type="button" onClick={() => { setTrail([]); setFeedback('Selection cleared.') }} disabled={!path.length}>Clear selection</button>
        </div>
        <p className="trails-feedback" aria-live="polite">{complete ? 'Wonderful! You found every word!' : feedback || '\u00a0'}</p>
      </section>
      <aside className="trails-info">
        <h2>How to play</h2>
        <p>Drag through touching letters in any direction to find a word. Or tap letters one at a time, then tap <strong>Check word</strong>. Tap the previous letter to undo a step.</p>
        <p>Find all the theme words and the special word that connects two opposite edges. Every letter belongs to one word.</p>
        <strong>{found.length} of {puzzle.words.length} words found</strong>
        <ul className="trails-found">
          {foundWords.map((word) => <li key={word.word}>{word.word}{word.special ? ' ★' : ''}</li>)}
        </ul>
        <div className="trails-actions">
          <button type="button" disabled={complete} onClick={() => {
            const next = puzzle.words.find((word) => !found.includes(word.word))
            if (next) { setHint(next.cells[0]); setFeedback('The outlined letter starts a hidden word.') }
          }}>Show a starting letter</button>
          <button type="button" onClick={() => {
            if (!window.confirm('Start this puzzle over?')) return
            setProgress((previous) => ({ ...previous, [puzzle.id]: { found: [] } }))
            setTrail([])
            setHint(null)
            setFeedback('Puzzle cleared.')
          }}><RotateCcw size={17} aria-hidden="true" /> Start over</button>
        </div>
      </aside>
    </div>
  </main>
}
