import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCrosswordCells, crosswordSize, crosswordWords, matchesAnswer, revealedLetter, wordCells } from './crosswordData.ts'
import { upperCrosswordSize, upperCrosswordWords } from './crosswordUpperData.ts'

for (const [label, size, words, expected] of [['2-3', crosswordSize, crosswordWords, 12], ['4-6', upperCrosswordSize, upperCrosswordWords, 20]]) {
test(`${label} crossword has unique, connected, correctly numbered words`, () => {
  assert.equal(words.length, expected)
  assert.equal(new Set(words.map((word) => word.id)).size, words.length)
  assert.equal(new Set(words.map((word) => word.answer)).size, words.length)
  const cells = new Map()
  const starts = new Map()
  for (const word of words) {
    assert.match(word.answer, /^[A-Z]+$/)
    assert.ok(word.clue)
    const start = `${word.row},${word.col}`
    if (starts.has(start)) assert.equal(starts.get(start), word.number)
    else starts.set(start, word.number)
    const parts = wordCells(word)
    assert.equal(parts.length, word.answer.length)
    for (const cell of parts) {
      assert.ok(cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size)
      const key = `${cell.row},${cell.col}`
      const previous = cells.get(key)
      if (previous) {
        assert.equal(previous.letter, cell.letter, `conflicting letters at ${key}`)
        assert.ok(previous.words.every((other) => other.direction !== word.direction))
        previous.words.push(word)
      } else cells.set(key, { letter: cell.letter, words: [word] })
    }
  }
  const sortedStarts = [...starts.entries()].sort(([a], [b]) => {
    const [ar, ac] = a.split(',').map(Number)
    const [br, bc] = b.split(',').map(Number)
    return ar - br || ac - bc
  })
  sortedStarts.forEach(([, number], index) => assert.equal(number, index + 1))
  const reached = new Set([words[0].id])
  let count
  do {
    count = reached.size
    for (const { words } of cells.values()) {
      if (words.some((word) => reached.has(word.id))) words.forEach((word) => reached.add(word.id))
    }
  } while (reached.size > count)
  assert.equal(reached.size, words.length)
  for (const word of words) {
    const dr = word.direction === 'down' ? 1 : 0
    const dc = word.direction === 'across' ? 1 : 0
    assert.equal(cells.has(`${word.row - dr},${word.col - dc}`), false)
    assert.equal(cells.has(`${word.row + dr * word.answer.length},${word.col + dc * word.answer.length}`), false)
    for (const cell of wordCells(word)) {
      if (cells.get(`${cell.row},${cell.col}`).words.length === 1) {
        assert.equal(cells.has(`${cell.row + dc},${cell.col + dr}`), false)
        assert.equal(cells.has(`${cell.row - dc},${cell.col - dr}`), false)
      }
    }
  }
})
}

test('only solved letters and shared crossings are revealed', () => {
  const cells = buildCrosswordCells(upperCrosswordSize, upperCrosswordWords)
  const shared = cells.find((cell) => cell.words.length === 2)
  const hidden = cells.find((cell) => cell.words.length === 1 && cell.words[0].id !== shared.words[0].id)
  assert.equal(revealedLetter(shared, []), undefined)
  assert.equal(revealedLetter(shared, [shared.words[0].id]), wordCells(shared.words[0]).find((cell) => cell.row === shared.row && cell.col === shared.col).letter)
  assert.equal(revealedLetter(hidden, [shared.words[0].id]), undefined)
})

test('answers are case-insensitive, trim surrounding spaces, and reject mistakes', () => {
  const word = crosswordWords[0]
  assert.equal(matchesAnswer(' autumn ', word), true)
  assert.equal(matchesAnswer('autum', word), false)
  assert.equal(matchesAnswer('', word), false)
})
