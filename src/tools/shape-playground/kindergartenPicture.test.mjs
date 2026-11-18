import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kindergartenColors, kindergartenNumber } from './kindergartenPicture.ts'
import { answerColors, mysteryPuzzles } from './mysteryPictureData.ts'

test('every kindergarten section has a number with a matching color', () => {
  for (const puzzle of mysteryPuzzles) {
    for (const region of puzzle.regions) {
      const number = kindergartenNumber(puzzle.id, region)
      assert.ok(Number.isInteger(number) && number >= 0 && number <= 9)
      assert.ok(kindergartenColors[number]?.name)
      assert.match(kindergartenColors[number].fill, /^#[0-9a-f]{6}$/i)
    }
  }
})

test('house windows and garden clouds are white and blue flower petals are pink only for kindergarten', () => {
  const house = mysteryPuzzles.find((puzzle) => puzzle.id === 'house')
  const garden = mysteryPuzzles.find((puzzle) => puzzle.id === 'garden')
  const rocket = mysteryPuzzles.find((puzzle) => puzzle.id === 'rocket')
  for (const id of ['window-left', 'window-right']) {
    const region = house.regions.find((item) => item.id === id)
    assert.equal(kindergartenColors[kindergartenNumber(house.id, region)].name, 'white')
    assert.equal(answerColors[region.addends[0] + region.addends[1]].name, 'blue')
  }
  for (const region of garden.regions.filter((item) => item.id.startsWith('cloud-'))) {
    assert.equal(kindergartenColors[kindergartenNumber(garden.id, region)].name, 'white')
  }
  const petals = garden.regions.filter((item) => item.id.startsWith('right-petal-'))
  assert.equal(petals.length, 4)
  for (const region of petals) {
    assert.equal(kindergartenColors[kindergartenNumber(garden.id, region)].name, 'pink')
    assert.equal(answerColors[region.addends[0] + region.addends[1]].name, 'blue')
  }
  assert.equal(rocket.regions.filter((region) => region.id.includes('cloud')).length, 0)
})
