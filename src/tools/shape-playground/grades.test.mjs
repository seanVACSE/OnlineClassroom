import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gradeActivities, gradeIds, gradeLabels, isGrade, isGradeActivity } from './grades.ts'

test('each grade has the shared games, with first-grade math and upper-grade nametags', () => {
  assert.deepEqual(gradeIds, ['k', '1', '2', '3'])
  for (const grade of gradeIds) {
    assert.ok(isGrade(grade))
    assert.ok(gradeLabels[grade])
    assert.equal(new Set(gradeActivities[grade]).size, gradeActivities[grade].length)
    for (const activity of ['count', 'patterns', 'sort']) assert.ok(isGradeActivity(grade, activity))
    assert.equal(isGradeActivity(grade, 'mystery-picture'), grade === '1')
    assert.equal(isGradeActivity(grade, 'number-picture'), grade === 'k')
    assert.equal(isGradeActivity(grade, 'nametag'), grade === '2' || grade === '3')
    assert.equal(isGradeActivity(grade, 'unknown'), false)
  }
  for (const grade of ['k-1', '2-3', '4', '', undefined]) assert.equal(isGrade(grade), false)
})
