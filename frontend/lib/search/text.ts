/** Plain-text helpers for the search index. No '@/' imports, so tests and Node can load it. */

/** One line of text: ordinary spaces and hyphens, no runs of whitespace. */
export function tidy(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[  ]/g, ' ')
    .replace(/‑/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The first `max` characters or so, cut at a word, with an ellipsis when cut. */
export function clip(text: string, max = 140): string {
  const clean = tidy(text)
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max + 1)
  const at = cut.lastIndexOf(' ')
  return `${cut.slice(0, at > 40 ? at : max).replace(/[\s,;:.–—-]+$/, '')}…`
}

/** The first `max` words. */
export function capWords(text: string, max: number): string {
  if (!Number.isFinite(max)) return text
  const words = text.split(' ')
  return words.length <= max ? text : words.slice(0, max).join(' ')
}

/** "Our History" → "our-history", for links to a section of a page. */
export function sectionAnchor(heading: string | null | undefined): string {
  return tidy(heading)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Settings, addresses, button labels and anything a visitor doesn't read as
// content. Hidden search fields are read on purpose, never by this walk.
const SKIP_KEYS = new Set([
  'slug', 'url', 'href', 'link', 'links', 'cta', 'cta1', 'cta2', 'ctas', 'donateLink', 'actionLink', 'imageLink',
  'backLink', 'documentButton', 'documentFile', 'buttonUrl', 'buttonLabel', 'linkLabel', 'actionLabel',
  'newsletterLabel', 'moreLabel', 'moreEyebrow', 'pdfLabel', 'pdf', 'pdfDownload', 'email', 'emailSubject',
  'color', 'accent', 'appearance', 'layout', 'surface', 'tone', 'align', 'mediaPosition', 'mobileLayout',
  'imageStyle', 'kind', 'target', 'sectionId', 'linkId', 'id', 'form', 'video', 'media', 'image', 'cover',
  'supportedByLink', 'supportedByLogo', 'searchSummary', 'searchKeywords', 'datePrecision', 'date',
  'effectiveDate', 'year', 'alt', 'youtube', 'muxPlaybackId', 'time', 'posts', 'page', 'contact', 'related',
  'detail', 'section', 'themeColour', 'emptyText', 'otherWaysLinkText', 'badgeText', 'position',
])
const HEADING_KEYS = new Set(['heading', 'headline', 'title', 'name', 'question', 'subtitle', 'eyebrow'])
const NOT_PROSE = /^(https?:|mailto:|tel:|\/|#|var\()/i

export type Extracted = {headings: string[]; body: string[]}

type Span = {text?: unknown}
type Block = {_type?: string; style?: string; children?: Span[]}

/** The words of a Portable Text array, one string per paragraph. */
export function portableTextToLines(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return (value as Block[])
    .filter((block) => block?._type === 'block')
    .map((block) => tidy((block.children ?? []).map((span) => (typeof span.text === 'string' ? span.text : '')).join('')))
    .filter(Boolean)
}

/**
 * Every piece of readable text inside a block or document: headings apart
 * from running text. Links, settings and images are left out.
 */
export function extractText(value: unknown, into: Extracted = {headings: [], body: []}, key = ''): Extracted {
  if (typeof value === 'string') {
    const text = tidy(value)
    if (text && /[a-z]/i.test(text) && !NOT_PROSE.test(text)) {
      ;(HEADING_KEYS.has(key) ? into.headings : into.body).push(text)
    }
    return into
  }
  if (Array.isArray(value)) {
    for (const item of value) extractText(item, into, key)
    return into
  }
  if (!value || typeof value !== 'object') return into

  const node = value as Record<string, unknown>
  if ('_ref' in node || 'asset' in node) return into
  if (node._type === 'block') {
    const [line] = portableTextToLines([node])
    if (line) (/^h[1-6]$/.test(String(node.style ?? '')) ? into.headings : into.body).push(line)
    return into
  }
  for (const [childKey, child] of Object.entries(node)) {
    if (childKey.startsWith('_') || SKIP_KEYS.has(childKey)) continue
    extractText(child, into, childKey)
  }
  return into
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-11-13" → "Nov 13, 2026", or "Nov 2026" when only the month is known. */
export function shortDate(date: string | null | undefined, precision?: string | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date ?? '')
  if (!match) return ''
  const month = SHORT_MONTHS[Number(match[2]) - 1]
  if (!month) return ''
  return precision === 'month' ? `${month} ${match[1]}` : `${month} ${Number(match[3])}, ${match[1]}`
}

/** A post's date and time → "Nov 13, 2026", by the calendar in California, where we publish. */
export function shortPostDate(date: string): string {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}
