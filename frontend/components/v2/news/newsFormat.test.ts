import {
  ALL_ISSUES,
  formatDate,
  formatRecordDate,
  formatStat,
  groupRecord,
  hostLabel,
  isExternalHref,
  issuesOf,
  splitEmails,
  type RecordItem,
} from './newsFormat'

const item = (id: string, kind: string, date: string, issue: string): RecordItem => ({_id: id, kind, date, issue, title: id})

test('formats dates without shifting time zones', () => {
  expect(formatDate('2025-05-07', 'day')).toBe('May 7, 2025')
  expect(formatDate('2025-06-01T00:00:00.000Z', 'monthLong')).toBe('June 2025')
  expect(formatDate('2026-10-01', 'monthShort')).toBe('Oct 2026')
  expect(formatDate(null)).toBe('')
  expect(formatRecordDate('2026-05-05', 'day')).toBe('May 5, 2026')
  expect(formatRecordDate('2026-10-01', 'month')).toBe('Oct 2026')
})

test('outside links open in a new tab; pages on this site do not', () => {
  expect(isExternalHref('https://www.prlog.org/13143852')).toBe(true)
  expect(isExternalHref('/letter/ab-1357')).toBe(false)
  expect(isExternalHref('')).toBe(false)
  expect(hostLabel('https://www.census.gov/library/stories/x.html')).toBe('census.gov')
  expect(hostLabel('https://povertycenter.columbia.edu/sites/x.pdf')).toBe('povertycenter.columbia.edu')
})

test('lists issues alphabetically after All issues', () => {
  const items = [item('a', 'statement', '2025-06-01', 'Tax Justice'), item('b', 'announcement', '2026-03-10', 'Economic Security'), item('c', 'statement', '2025-06-01', 'Tax Justice')]
  expect(issuesOf(items)).toEqual([ALL_ISSUES, 'Economic Security', 'Tax Justice'])
})

test('filters by type and issue, newest first, grouped by year', () => {
  const items = [
    item('old', 'ourLetter', '2025-05-07', 'Economic Security'),
    item('new', 'coalitionLetter', '2026-10-01', 'Philanthropy'),
    item('mid', 'announcement', '2026-03-10', 'Economic Security'),
  ]
  expect(groupRecord(items, 'all', ALL_ISSUES).map((g) => [g.year, g.items.map((i) => i._id)])).toEqual([
    [2026, ['new', 'mid']],
    [2025, ['old']],
  ])
  expect(groupRecord(items, 'all', 'Economic Security').flatMap((g) => g.items.map((i) => i._id))).toEqual(['mid', 'old'])
  expect(groupRecord(items, 'ourLetter', 'Philanthropy')).toEqual([])
})

test('turns email addresses into link parts', () => {
  expect(splitEmails('Reach us at connect@mboldenchange.org. Thanks')).toEqual([
    {text: 'Reach us at ', email: false},
    {text: 'connect@mboldenchange.org', email: true},
    {text: '. Thanks', email: false},
  ])
})

test('formats count-up numbers', () => {
  expect(formatStat(4.4, 1, '', ' million')).toBe('4.4 million')
  expect(formatStat(5.2, 1, '', '%')).toBe('5.2%')
  expect(formatStat(6500, 0, '$')).toBe('$6,500')
})
