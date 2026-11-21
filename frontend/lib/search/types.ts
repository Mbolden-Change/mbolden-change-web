/** The groups search results appear in, always in this order (set by Minh). */
export const GROUPS = [
  "What We're Tackling",
  'News & Statements',
  'Resources',
  'About',
  'Ready to Grow',
  'Our Point of View',
  'Donate',
  'From mBOLDen Action',
] as const

export type SearchGroup = (typeof GROUPS)[number]

export const ACTION_GROUP: SearchGroup = 'From mBOLDen Action'

/** One thing a search can find. */
export type SearchEntry = {
  id: string
  /** A path on this site, or a full address for mBOLDen Action and outside links. */
  url: string
  title: string
  group: SearchGroup
  /** The small line above the title, such as "What We're Tackling › The Gateway Fund". */
  location: string
  summary?: string
  /** Hidden search words from Studio. Matched, never shown. */
  keywords?: string[]
  headings?: string[]
  body?: string
  /** Opens in a new tab: mBOLDen Action and other outside addresses. */
  newTab?: boolean
}

export type SearchLink = {title: string; href: string; newTab?: boolean}

/** What /api/search-index serves. */
export type SearchIndex = {
  version: 1
  generated: string
  entries: SearchEntry[]
  /** Suggested words after "Try:". */
  tryWords: string[]
  /** Links under "Popular". */
  popular: SearchLink[]
}
