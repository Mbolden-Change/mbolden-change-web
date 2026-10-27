import {test} from 'node:test'
import assert from 'node:assert/strict'
import {fundsErrors, isShown} from './fundRules.ts'

const messages = (funds) => fundsErrors(funds).map((error) => error.message)
const fund = (key, extra = {}) => ({_key: key, linkId: key, ...extra})

test('a fund with no value for the switch counts as shown', () => {
  assert.equal(isShown({}), true)
  assert.equal(isShown({showOnDonatePage: true}), true)
  assert.equal(isShown({showOnDonatePage: false}), false)
})

test('three shown funds and any number of hidden ones pass', () => {
  const funds = [
    fund('where-needed-most'),
    fund('gateway-fund'),
    fund('basic-needs-fund'),
    fund('care-access-fund', {showOnDonatePage: false}),
    fund('stories-systems-change', {showOnDonatePage: false}),
  ]
  assert.deepEqual(fundsErrors(funds), [])
})

test('a fourth shown fund is an error, with missing values counted as on', () => {
  assert.deepEqual(messages([fund('a'), fund('b'), fund('c', {showOnDonatePage: true}), {_key: 'd'}]), [
    'Only 3 funds can show on the Donate page. Turn one off first.',
  ])
})

test('the first fund cannot be turned off', () => {
  const errors = fundsErrors([fund('a', {showOnDonatePage: false}), fund('b')])
  assert.deepEqual(errors, [
    {message: "The first fund (Where it's needed most) always shows.", path: [{_key: 'a'}, 'showOnDonatePage']},
  ])
})

test('a hidden fund needs a link ID', () => {
  for (const linkId of [undefined, '', '  ']) {
    const errors = fundsErrors([fund('a'), {_key: 'b', linkId, showOnDonatePage: false}])
    assert.deepEqual(errors, [{message: 'A hidden fund needs a link ID.', path: [{_key: 'b'}, 'linkId']}])
  }
})

test('link IDs must still be unique', () => {
  assert.deepEqual(messages([fund('a'), {_key: 'b', linkId: 'a'}]), ['Link IDs must be unique in this block.'])
})
