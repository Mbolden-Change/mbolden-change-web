import {CODE_PAGES} from './codePages'
import {isExcludedEntry, isExcludedUrl, scrubEntry} from './exclusions'
import {entriesFromPosts, type IndexablePost} from './postsSource'
import {entriesFromSanity, popularFromSettings, type SanitySearchData} from './sanitySource'
import {capWords, tidy} from './text'
import type {SearchEntry, SearchIndex, SearchLink} from './types'

/**
 * Used until Search settings is published in Studio (these are the seed
 * values in the search spec). Once the document has "Try" words or Popular
 * links, those replace these.
 */
export const DEFAULT_TRY_WORDS = ['cash', 'immigrant', 'AI', 'DAF', 'therapy']
export const DEFAULT_POPULAR: SearchLink[] = [
  {title: 'Safety Net Simulator', href: '/simulator'},
  {title: 'Donate', href: '/donate'},
  {title: 'Our Point of View', href: '/point-of-view'},
  {title: 'mBOLDen Action', href: 'https://www.mboldenaction.org/', newTab: true},
]

/**
 * Longest body kept per entry, in words. The whole index is about 130 KB
 * gzipped uncapped, under the 250 KB budget, so nothing is cut today. Lower
 * this (for example to 3000) if the index outgrows the budget.
 */
export const BODY_WORD_CAP = Number.POSITIVE_INFINITY

export type IndexSources = {
  sanity?: SanitySearchData | null
  posts?: IndexablePost[]
  action?: SearchEntry[]
  now?: Date
  bodyWordCap?: number
}

/** Puts the sources together and applies every exclusion. */
export function assembleIndex({sanity, posts = [], action = [], now = new Date(), bodyWordCap = BODY_WORD_CAP}: IndexSources): SearchIndex {
  const fromSanity = entriesFromSanity(sanity)
  const hidden = fromSanity.hiddenFundIds

  const codeKeywords = new Map(
    (sanity?.settings?.codePageKeywords ?? []).map((item) => [item?.path ?? '', (item?.searchKeywords ?? []).map(tidy).filter(Boolean)]),
  )
  const sanityUrls = new Set(fromSanity.entries.map((entry) => entry.url))
  const codePages = CODE_PAGES.filter((page) => !sanityUrls.has(page.url)).map((page) => {
    const keywords = codeKeywords.get(page.url) ?? []
    return keywords.length ? {...page, keywords} : page
  })

  const seen = new Set<string>()
  const entries: SearchEntry[] = []
  for (const candidate of [...fromSanity.entries, ...codePages, ...entriesFromPosts(posts), ...action]) {
    if (!candidate.title || !candidate.url || seen.has(candidate.id)) continue
    if (isExcludedEntry(candidate, hidden)) continue
    const entry = scrubEntry(candidate)
    if (entry.body) entry.body = capWords(entry.body, bodyWordCap)
    if (entry.headings && !entry.headings.length) delete entry.headings
    if (entry.keywords && !entry.keywords.length) delete entry.keywords
    seen.add(entry.id)
    entries.push(entry)
  }

  const tryWords = (sanity?.settings?.tryWords ?? []).map(tidy).filter(Boolean).slice(0, 6)
  const popular = popularFromSettings(sanity?.settings?.popularLinks).filter((link) => !isExcludedUrl(link.href, hidden))

  return {
    version: 1,
    generated: now.toISOString(),
    entries,
    tryWords: tryWords.length ? tryWords : DEFAULT_TRY_WORDS,
    popular: popular.length ? popular : DEFAULT_POPULAR,
  }
}
