import {tidy} from './text'
import {ACTION_GROUP, type SearchEntry} from './types'

/** www on purpose: the bare domain redirects, and a redirected fetch can fail. */
export const ACTION_INDEX_URL = 'https://www.mboldenaction.org/search-index.json'
export const ACTION_REVALIDATE_SECONDS = 60 * 60
const ACTION_HOSTS = new Set(['www.mboldenaction.org', 'mboldenaction.org'])
const ACTION_SITE = 'mboldenaction.org'

type ActionPage = {
  url?: unknown
  title?: unknown
  description?: unknown
  campaign?: unknown
  headings?: unknown
  text?: unknown
}

/**
 * Entries from mboldenaction.org's search-index.json:
 * { version, site, generated, pages: [{ url, title, description, campaign, headings, text, updated }] }.
 * Throws if the file isn't that shape. Pages that aren't on mboldenaction.org are dropped.
 */
export function parseActionIndex(data: unknown): SearchEntry[] {
  const pages = (data as {pages?: unknown} | null)?.pages
  if (!Array.isArray(pages)) throw new Error('mBOLDen Action index has no pages')

  const entries: SearchEntry[] = []
  for (const page of pages as ActionPage[]) {
    const title = tidy(page?.title)
    let url: URL
    try {
      url = new URL(String(page?.url ?? ''))
    } catch {
      continue
    }
    if (!title || url.protocol !== 'https:' || !ACTION_HOSTS.has(url.hostname)) continue

    const campaign = tidy(page.campaign)
    const isHome = url.pathname === '/' || url.pathname === ''
    const summary = tidy(page.description)
    const headings = Array.isArray(page.headings) ? page.headings.map(tidy).filter(Boolean) : []
    const body = tidy(page.text)
    entries.push({
      id: `action:${url.pathname}`,
      url: url.toString(),
      title,
      group: ACTION_GROUP,
      location: isHome || !(campaign || title) ? ACTION_SITE : `${ACTION_SITE} › ${campaign || title}`,
      ...(summary ? {summary} : {}),
      ...(headings.length ? {headings} : {}),
      ...(body ? {body} : {}),
      newTab: true,
    })
  }
  return entries
}

// The last copy that loaded and parsed, kept while this server instance lives.
let lastGood: SearchEntry[] | null = null

/**
 * mBOLDen Action's entries, refreshed hourly. If the file can't be fetched or
 * read, the last good copy is used, or none. This never throws.
 */
export async function getActionEntries(fetcher: typeof fetch = fetch): Promise<SearchEntry[]> {
  try {
    const response = await fetcher(ACTION_INDEX_URL, {
      headers: {accept: 'application/json'},
      next: {revalidate: ACTION_REVALIDATE_SECONDS, tags: ['mbolden-action']},
      signal: AbortSignal.timeout(8000),
    } as RequestInit)
    if (!response.ok) throw new Error(`mBOLDen Action index answered ${response.status}`)
    lastGood = parseActionIndex(await response.json())
    return lastGood
  } catch {
    return lastGood ?? []
  }
}

/** For tests. */
export function forgetActionEntries() {
  lastGood = null
}
