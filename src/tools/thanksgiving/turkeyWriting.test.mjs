import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadTurkeyWriting, saveTurkeyWriting, turkeyWritingKey } from './turkeyWriting.ts'

test('turkey writing persists separately for each image and rejects invalid stored data', () => {
  const entries = new Map()
  globalThis.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  }
  const writing = { turkeyName: 'Gobbles', disguise: 'a firefighter', reason: 'I help people' }
  saveTurkeyWriting('turkey.png', writing)
  assert.deepEqual(loadTurkeyWriting('turkey.png'), writing)
  assert.deepEqual(loadTurkeyWriting('other.png'), { turkeyName: '', disguise: '', reason: '' })
  entries.set(turkeyWritingKey('other.png'), '{"reason": 4}')
  assert.throws(() => loadTurkeyWriting('other.png'), /invalid/)
  delete globalThis.localStorage
})
