import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adjacent, extendTrail, matchingTrail, trailPuzzles } from './wordTrailsData.ts'

test('both puzzles cover every cell exactly once with connected words and an edge-to-edge word', () => {
  assert.equal(trailPuzzles.length, 2)
  for (const puzzle of trailPuzzles) {
    const width = puzzle.rows[0].length
    assert.equal(width, 6)
    assert.equal(puzzle.rows.length, 6)
    assert.ok(puzzle.rows.every((row) => row.length === width && /^[A-Z]+$/.test(row)))
    assert.ok(puzzle.words.length >= 7)
    assert.equal(puzzle.words.filter((word) => word.special).length, 1)
    const used = new Set()
    for (const word of puzzle.words) {
      assert.equal(word.cells.map((cell) => puzzle.rows[Math.floor(cell / width)]?.[cell % width]).join(''), word.word)
      assert.equal(new Set(word.cells).size, word.cells.length)
      word.cells.forEach((cell, index) => {
        assert.ok(cell >= 0 && cell < width * puzzle.rows.length)
        assert.ok(!used.has(cell), `${puzzle.id}: repeated cell ${cell}`)
        used.add(cell)
        if (index) assert.ok(adjacent(word.cells[index - 1], cell, width))
      })
      assert.equal(matchingTrail(puzzle, word.cells), word)
      assert.equal(matchingTrail(puzzle, [...word.cells].reverse()), word)
      if (word.special) {
        const rows = word.cells.map((cell) => Math.floor(cell / width))
        const cols = word.cells.map((cell) => cell % width)
        assert.ok((rows.includes(0) && rows.includes(puzzle.rows.length - 1)) || (cols.includes(0) && cols.includes(width - 1)))
      }
    }
    assert.equal(used.size, width * puzzle.rows.length)
  }
})

test('paths allow adjacent letters, undo, and reject repeats and jumps', () => {
  assert.deepEqual(extendTrail([], 0, 6), [0])
  assert.deepEqual(extendTrail([0], 7, 6), [0, 7])
  assert.deepEqual(extendTrail([0, 7], 0, 6), [0])
  assert.deepEqual(extendTrail([0, 7, 8], 0, 6), [0, 7, 8])
  assert.deepEqual(extendTrail([0], 5, 6), [0])
})
