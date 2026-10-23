import {formatStat, laneVar, mailtoHref, onLaneIsWhite, parseStat, partnerVar} from './lanes'

test('parses stats so they can count up, keeping their format', () => {
  const pct = parseStat('100%')!
  expect(formatStat(pct, 0)).toBe('0%')
  expect(formatStat(pct, 100)).toBe('100%')
  const money = parseStat('$144,000')!
  expect(formatStat(money, 72000)).toBe('$72,000')
  expect(formatStat(money, 144000)).toBe('$144,000')
  expect(parseStat('24 total')).toMatchObject({prefix: '', number: 24, suffix: ' total'})
  expect(parseStat('Two')).toBeNull()
})

test('colors and email links', () => {
  expect(laneVar('fuchsia')).toBe('var(--brand-fuchsia)')
  expect(partnerVar('teal')).toBe('var(--brand-fuchsia)')
  expect(partnerVar('fuchsia')).toBe('var(--brand-aqua-teal)')
  expect(onLaneIsWhite('fuchsia')).toBe(true)
  expect(onLaneIsWhite('teal')).toBe(false)
  expect(mailtoHref('sue@mboldenchange.org', 'Youth Cash Transfer: next phase')).toBe(
    'mailto:sue@mboldenchange.org?subject=Youth%20Cash%20Transfer%3A%20next%20phase',
  )
})
