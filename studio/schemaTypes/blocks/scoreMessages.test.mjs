import {test} from 'node:test'
import assert from 'node:assert/strict'
import {featuredGuideType} from './resourcesBlocks.ts'

// Runs the Featured Guide "Message for each score" rule from the schema itself.
const field = featuredGuideType.fields.find((f) => f.name === 'scoreMessages')
const rule = field.validation({custom: (fn) => fn})
const check = (messages, previewItems) => rule(messages, {parent: {previewItems}})

test('one more message than checklist items passes', () => {
  assert.equal(check(['None yet', 'One', 'Two', 'All three'], ['a', 'b', 'c']), true)
})

test('too few or too many messages names the count needed', () => {
  const error = 'Add 4 messages: one for each score from 0 to 3.'
  assert.equal(check(['None yet', 'One', 'Two'], ['a', 'b', 'c']), error)
  assert.equal(check(['0', '1', '2', '3', '4'], ['a', 'b', 'c']), error)
})

test('no messages yet is allowed', () => {
  assert.equal(check(undefined, ['a', 'b', 'c']), true)
})

test('with no checklist items, one message is needed', () => {
  assert.equal(check(['Nothing to tick'], undefined), true)
  assert.equal(check([], undefined), 'Add 1 messages: one for each score from 0 to 0.')
})
