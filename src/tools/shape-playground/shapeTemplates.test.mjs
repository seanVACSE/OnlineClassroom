import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shapeTemplates, templatePaths } from './templateDesigns.ts'

test('templates have large, non-overlapping, supported shape outlines inside the board', () => {
  assert.equal(shapeTemplates.length, 3)
  assert.equal(new Set(shapeTemplates.map((template) => template.id)).size, shapeTemplates.length)
  for (const template of shapeTemplates) {
    assert.ok(template.slots.length >= 7)
    assert.equal(new Set(template.slots.map((slot) => slot.id)).size, template.slots.length)
    for (const [index, slot] of template.slots.entries()) {
      assert.ok(templatePaths[slot.shape])
      assert.ok(slot.width >= 70 && slot.height >= 70)
      assert.ok(slot.width * 646 / 1000 >= 44 && slot.height * 386 / 600 >= 44, `${template.id}: ${slot.id} is too small on a narrow screen`)
      if (slot.shape === 'square' || slot.shape === 'circle') assert.equal(slot.width, slot.height)
      if (slot.shape === 'rectangle') assert.notEqual(slot.width, slot.height)
      assert.ok(slot.x >= 0 && slot.y >= 0 && slot.x + slot.width <= 1000 && slot.y + slot.height <= 600)
      for (const other of template.slots.slice(index + 1)) {
        assert.ok(slot.x + slot.width <= other.x || other.x + other.width <= slot.x || slot.y + slot.height <= other.y || other.y + other.height <= slot.y, `${template.id}: ${slot.id} overlaps ${other.id}`)
      }
    }
  }
})
