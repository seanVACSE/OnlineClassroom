import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkAnswer, colorRegion, retryDelayMs, solveRegion } from './mysteryGame.ts'
import { mysteryPuzzles } from './mysteryPictureData.ts'

test('wrong answers impose a full five-second delay on every answer', () => {
  const first = mysteryPuzzles[0].regions[0]
  const other = mysteryPuzzles[0].regions[4]
  assert.equal(checkAnswer(first, 9, 0, 1000), 'wrong')
  const retryAt = 1000 + retryDelayMs
  assert.equal(retryDelayMs, 5000)
  assert.equal(checkAnswer(first, 3, retryAt, 5999), 'wait')
  assert.equal(checkAnswer(other, 9, retryAt, 5999), 'wait')
  assert.equal(checkAnswer(first, 3, retryAt, 6000), 'correct')
})

test('only a solved section can be colored, and only with its matching color', () => {
  const region = mysteryPuzzles[0].regions[0]
  const empty = { solved: [], colored: [] }
  assert.deepEqual(colorRegion(empty, region, 3), empty)
  const solved = solveRegion(empty, region)
  assert.deepEqual(solved, { solved: [region.id], colored: [] })
  assert.deepEqual(solveRegion(solved, region), solved)
  assert.deepEqual(colorRegion(solved, region, null), solved)
  assert.deepEqual(colorRegion(solved, region, 5), solved)
  const colored = colorRegion(solved, region, 3)
  assert.deepEqual(colored, { solved: [region.id], colored: [region.id] })
  assert.deepEqual(colorRegion(colored, region, 3), colored)
})

test('number matching colors without solving, but still rejects the wrong color', () => {
  const region = mysteryPuzzles[0].regions.find((item) => item.id === 'window-left')
  const empty = { solved: [], colored: [] }
  assert.deepEqual(colorRegion(empty, region, 3, 0, false), empty)
  assert.deepEqual(colorRegion(empty, region, 0, 0, false), { solved: [], colored: [region.id] })
})
