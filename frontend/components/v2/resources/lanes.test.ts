import {linkArrow, youTubeIdFrom} from './lanes'

test('reads YouTube IDs from an ID or a link', () => {
  expect(youTubeIdFrom('BQqvvLo4clo')).toBe('BQqvvLo4clo')
  expect(youTubeIdFrom('https://youtu.be/vStPBDukWTw')).toBe('vStPBDukWTw')
  expect(youTubeIdFrom('https://www.youtube.com/watch?v=oKOMnSbQLik')).toBe('oKOMnSbQLik')
  expect(youTubeIdFrom('https://example.com/watch?v=oKOMnSbQLik')).toBeNull()
  expect(youTubeIdFrom('')).toBeNull()
})

test('card arrows: ↓ for a PDF, ↗ for a new tab, → otherwise', () => {
  expect(linkArrow('/reports/tax-credit-access-at-risk.pdf', true)).toBe('↓')
  expect(linkArrow('https://www.mboldenaction.org/movemydaf/', true)).toBe('↗')
  expect(linkArrow('/resources/beyond-compliance', false)).toBe('→')
})
