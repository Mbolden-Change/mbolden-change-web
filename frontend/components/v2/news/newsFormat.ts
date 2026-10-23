// Labels, colors, dates and filtering for News & Statements, statements and letters.

export type NewsKind = 'statement' | 'ourLetter' | 'coalitionLetter' | 'announcement'

export const KIND_LABEL: Record<NewsKind, string> = {
  statement: 'Statement',
  ourLetter: 'Our letter',
  coalitionLetter: 'Coalition letter',
  announcement: 'Announcement',
}

/** Type chips, in order, with their color markers. */
export const KIND_CHIPS: Array<{value: 'all' | NewsKind; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'statement', label: 'Statements'},
  {value: 'ourLetter', label: 'Our letters'},
  {value: 'coalitionLetter', label: 'Coalition letters'},
  {value: 'announcement', label: 'Announcements'},
]

export const KIND_COLOR: Record<NewsKind, string> = {
  statement: 'var(--brand-warm-yellow)',
  ourLetter: 'var(--brand-fuchsia)',
  coalitionLetter: 'var(--brand-aqua-teal)',
  announcement: 'var(--brand-black)',
}

/** Card and tag colors chosen in Studio; text on fuchsia and black is white. */
export const SWATCH: Record<string, {bg: string; ink: string}> = {
  yellow: {bg: 'var(--brand-warm-yellow)', ink: 'var(--brand-black)'},
  teal: {bg: 'var(--brand-aqua-teal)', ink: 'var(--brand-black)'},
  fuchsia: {bg: 'var(--brand-fuchsia)', ink: 'var(--brand-white)'},
  black: {bg: 'var(--brand-black)', ink: 'var(--brand-white)'},
}

export const ALL_ISSUES = 'All issues'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Reads YYYY-MM-DD (or an ISO date-time) without shifting it into another time zone. */
function parts(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  if (!match) return null
  return {year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3])}
}

export type DateStyle = 'day' | 'monthShort' | 'monthLong'

/** "May 5, 2026", "Oct 2026" or "June 2025". */
export function formatDate(date: string | null | undefined, style: DateStyle = 'day') {
  const p = date ? parts(date) : null
  if (!p) return ''
  if (style === 'monthShort') return `${SHORT_MONTHS[p.month]} ${p.year}`
  if (style === 'monthLong') return `${LONG_MONTHS[p.month]} ${p.year}`
  return `${LONG_MONTHS[p.month]} ${p.day}, ${p.year}`
}

/** Dates in The Full Record use short months: "May 5, 2026" or "Oct 2026". */
export function formatRecordDate(date: string | null | undefined, precision?: string | null) {
  const p = date ? parts(date) : null
  if (!p) return ''
  if (precision === 'month') return formatDate(date, 'monthShort')
  return `${SHORT_MONTHS[p.month]} ${p.day}, ${p.year}`
}

export function yearOf(date: string | null | undefined) {
  return (date && parts(date)?.year) || null
}

/** Full addresses open in a new tab; pages on this site open in the same tab. */
export function isExternalHref(href: string | null | undefined) {
  return Boolean(href && /^https?:\/\//i.test(href))
}

/** "census.gov" from "https://www.census.gov/library/…". */
export function hostLabel(url: string | null | undefined) {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export type RecordItem = {
  _id: string
  kind?: string | null
  title?: string | null
  date?: string | null
  datePrecision?: string | null
  issue?: string | null
  summary?: string | null
  details?: string | null
  linkLabel?: string | null
  link?: string | null
}

/** "All issues" then each issue in the record, alphabetically. */
export function issuesOf(items: RecordItem[]) {
  const issues = new Set(items.map((item) => item.issue?.trim()).filter((issue): issue is string => Boolean(issue)))
  return [ALL_ISSUES, ...Array.from(issues).sort((a, b) => a.localeCompare(b))]
}

/** Newest first, filtered by type and issue, grouped by year. */
export function groupRecord(items: RecordItem[], kind: string, issue: string) {
  const shown = items
    .filter((item) => (kind === 'all' || item.kind === kind) && (issue === ALL_ISSUES || item.issue?.trim() === issue))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  const years: Array<{year: number; items: RecordItem[]}> = []
  for (const item of shown) {
    const year = yearOf(item.date) ?? 0
    const group = years.find((g) => g.year === year)
    if (group) group.items.push(item)
    else years.push({year, items: [item]})
  }
  return years
}

/** Splits text on email addresses so they can become mailto links. */
export function splitEmails(text: string) {
  return text.split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g).map((part, i) => ({text: part, email: i % 2 === 1}))
}

/** A count-up value with fixed decimals, prefix and suffix, such as "4.4 million" or "5.2%". */
export function formatStat(value: number, decimals = 0, prefix = '', suffix = '') {
  const fixed = value.toFixed(Math.max(0, decimals))
  const [whole, fraction] = fixed.split('.')
  const grouped = Number(whole).toLocaleString('en-US')
  return `${prefix}${fraction ? `${grouped}.${fraction}` : grouped}${suffix}`
}
