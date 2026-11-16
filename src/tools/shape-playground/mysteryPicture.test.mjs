import assert from 'node:assert/strict'
import { test } from 'node:test'
import { answerColors, mysteryPuzzles } from './mysteryPictureData.ts'

test('every picture section has an addition fact within 0–9 and a color for its answer', () => {
  assert.equal(mysteryPuzzles.length, 3)
  assert.deepEqual(mysteryPuzzles.map((puzzle) => puzzle.difficulty), ['Easy', 'Medium', 'Medium'])
  assert.equal(new Set(mysteryPuzzles.map((puzzle) => puzzle.id)).size, mysteryPuzzles.length)
  for (const puzzle of mysteryPuzzles) {
    assert.ok(puzzle.regions.length >= (puzzle.difficulty === 'Easy' ? 13 : 20))
    assert.equal(new Set(puzzle.regions.map((region) => region.id)).size, puzzle.regions.length)
    for (const region of puzzle.regions) {
      assert.ok(region.path)
      assert.ok(region.name)
      assert.equal(region.addends.length, 2)
      assert.ok(region.addends.every((value) => Number.isInteger(value) && value >= 0 && value <= 9))
      const sum = region.addends[0] + region.addends[1]
      assert.ok(sum >= 0 && sum <= 9)
      assert.ok(answerColors[sum]?.name)
      assert.match(answerColors[sum].fill, /^#[0-9a-f]{6}$/i)
      assert.ok(region.labelX >= 0 && region.labelX <= 800 && region.labelY >= 0 && region.labelY <= 520)
    }
  }
  assert.deepEqual(new Set(Object.keys(answerColors).map(Number)), new Set(mysteryPuzzles.flatMap((puzzle) => puzzle.regions.map((region) => region.addends[0] + region.addends[1]))))
})
