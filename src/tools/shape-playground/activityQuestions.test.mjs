import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countingQuestions, patternQuestions, sortingQuestions } from './activityQuestions.ts'

test('counting has ten questions with three distinct choices and the correct shape count', () => {
  assert.equal(countingQuestions.length, 10)
  assert.ok(countingQuestions.some((question) => question.color))
  assert.ok(countingQuestions.some((question) => !question.color))
  for (const [index, question] of countingQuestions.entries()) {
    assert.equal(question.shapes.filter((item) => item.shape === question.target && (!question.color || item.color === question.color)).length, question.answer)
    assert.ok(question.shapes.some((item) => item.shape !== question.target))
    assert.ok(question.shapes.length <= 12)
    assert.equal(new Set(question.shapes.map((_, i) => (i * 5 + index * 3) % 12)).size, question.shapes.length)
    if (question.color) {
      assert.ok(question.shapes.some((item) => item.shape === question.target && item.color !== question.color))
      assert.ok(question.shapes.some((item) => item.shape !== question.target && item.color === question.color))
    }
    assert.equal(question.choices.length, 3)
    assert.equal(new Set(question.choices).size, 3)
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1)
  }
})

test('sorting rounds use both attributes and put every shape in exactly one balanced group', () => {
  assert.equal(sortingQuestions.length, 6)
  assert.deepEqual(new Set(sortingQuestions.map((question) => question.sortBy)), new Set(['shape', 'color']))
  for (const question of sortingQuestions) {
    assert.equal(new Set(question.bins).size, 2)
    assert.equal(question.shapes.length, 6)
    for (const item of question.shapes) {
      assert.equal(question.bins.filter((bin) => bin === item[question.sortBy]).length, 1)
    }
    for (const bin of question.bins) {
      assert.equal(question.shapes.filter((item) => item[question.sortBy] === bin).length, 3)
      const other = question.sortBy === 'shape' ? 'color' : 'shape'
      assert.ok(new Set(question.shapes.filter((item) => item[question.sortBy] === bin).map((item) => item[other])).size > 1)
    }
  }
})

test('patterns have ten questions with three distinct choices and the correct next shape', () => {
  assert.equal(patternQuestions.length, 10)
  for (const [index, question] of patternQuestions.entries()) {
    const period = index < 5 ? 2 : 3
    for (let i = period; i < question.pattern.length; i++) {
      assert.equal(question.pattern[i], question.pattern[i - period])
    }
    assert.equal(question.answer, question.pattern[question.pattern.length - period])
    assert.equal(question.choices.length, 3)
    assert.equal(new Set(question.choices).size, 3)
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1)
  }
})
