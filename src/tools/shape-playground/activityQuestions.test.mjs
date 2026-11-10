import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countingQuestions, patternQuestions } from './activityQuestions.ts'

test('counting has ten questions with three distinct choices and the correct shape count', () => {
  assert.equal(countingQuestions.length, 10)
  for (const question of countingQuestions) {
    assert.equal(question.shapes.filter((shape) => shape === question.target).length, question.answer)
    assert.ok(question.shapes.some((shape) => shape !== question.target))
    assert.equal(question.choices.length, 3)
    assert.equal(new Set(question.choices).size, 3)
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1)
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
