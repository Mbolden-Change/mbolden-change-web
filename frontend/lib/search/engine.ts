import MiniSearch from 'minisearch'
import {ACTION_GROUP, GROUPS, PAGE_LOCATION, type SearchEntry, type SearchGroup} from './types'

/** What a result shows. Hidden keywords, headings and body text stay in the index. */
export type SearchResult = Pick<SearchEntry, 'id' | 'url' | 'title' | 'group' | 'location' | 'summary' | 'newTab'> & {
  score: number
}

export type ResultGroup = {group: SearchGroup; results: SearchResult[]}
export type SearchResults = {
  total: number
  groups: ResultGroup[]
  /** The one result that clearly wins, when there is one. It is also in its group. */
  top?: SearchResult
}

const FIELDS = ['title', 'keywords', 'summary', 'headings', 'body'] as const
const BOOST = {title: 4, keywords: 3, summary: 2, headings: 1.5, body: 1}

export const EMPTY_RESULTS: SearchResults = {total: 0, groups: []}

/** A title counts as a near-exact match when the words typed are at least this share of it. */
const NEAR_TITLE = 1 / 3
/** Without a title match, the best score must beat the next by this much. */
const CLEAR_LEAD = 2
const SMALL_WORDS = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'for', 'in', 'on', 'with', 'our'])

const wordsOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/**
 * How much of a title the words typed make up: 1 for the title itself
 * ("donate" → Donate), 1/3 for "simulator" → Safety Net Simulator, 0 when a
 * word typed isn't in the title.
 */
export function titleMatch(query: string, title: string): number {
  const typed = wordsOf(query).filter((word) => !SMALL_WORDS.has(word))
  const inTitle = wordsOf(title).filter((word) => !SMALL_WORDS.has(word))
  if (!typed.length || !inTitle.length) return 0
  if (!typed.every((word) => inTitle.includes(word))) return 0
  return new Set(typed).size / inTitle.length
}

/**
 * The result that clearly wins, if any: the closest title match when it is
 * at least a third of the title and closer than any other, or else a score
 * well above the next result's.
 */
function pickTopMatch(query: string, everything: SearchResult[]): SearchResult | undefined {
  // A news row that leads to another organization's site is never our top answer.
  const results = everything.filter((result) => !result.newTab || result.group === ACTION_GROUP)
  if (!results.length) return undefined
  const byTitle = results
    .map((result) => ({result, match: titleMatch(query, result.title)}))
    .filter((entry) => entry.match >= NEAR_TITLE)
    .sort((a, b) => b.match - a.match || b.result.score - a.result.score)
  if (byTitle.length && (byTitle.length === 1 || byTitle[0].match > byTitle[1].match)) return byTitle[0].result

  const byScore = [...results].sort((a, b) => b.score - a.score)
  if (byTitle.length) {
    // Several titles match equally well ("gateway": the pop-up and the fund). The best of them wins only on a clear lead.
    const tied = byTitle.filter((entry) => entry.match === byTitle[0].match).map((entry) => entry.result)
    return tied[0].score >= CLEAR_LEAD * tied[1].score ? tied[0] : undefined
  }
  if (byScore.length === 1) return undefined
  return byScore[0].score >= CLEAR_LEAD * byScore[1].score ? byScore[0] : undefined
}


export function createSearchEngine(entries: SearchEntry[]) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const mini = new MiniSearch<SearchEntry>({
    idField: 'id',
    fields: [...FIELDS],
    extractField: (entry, field) => {
      const value = entry[field as keyof SearchEntry]
      return Array.isArray(value) ? value.join(' \n ') : (value as string | undefined) ?? ''
    },
    searchOptions: {
      boost: BOOST,
      // Results appear while typing. Words of 1–2 letters match whole words
      // only, so "AI" doesn't match "aid".
      prefix: (term) => term.length >= 3,
      // Small typos are forgiven in words of 5 letters or more.
      fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
    },
  })
  mini.addAll(entries)

  function search(query: string): SearchResults {
    const text = query.trim()
    if (!text) return EMPTY_RESULTS

    // Every word must match. If nothing does, any word may.
    let hits = mini.search(text, {combineWith: 'AND'})
    if (!hits.length) hits = mini.search(text, {combineWith: 'OR'})

    const groups = new Map<SearchGroup, SearchResult[]>()
    for (const hit of hits) {
      const entry = byId.get(hit.id)
      if (!entry) continue
      const result: SearchResult = {
        id: entry.id,
        url: entry.url,
        title: entry.title,
        group: entry.group,
        location: entry.location,
        ...(entry.summary ? {summary: entry.summary} : {}),
        ...(entry.newTab ? {newTab: true} : {}),
        score: hit.score,
      }
      groups.set(entry.group, [...(groups.get(entry.group) ?? []), result])
    }

    // Section beats page: a whole-page result is listed below everything
    // else that matches in its group (its own sections and pop-ups, and the
    // case studies, statements or posts filed under it), since those are the
    // closer answer. A page asked for by name ("about", "donate") keeps its place.
    const all = [...groups.values()].flat()
    for (const members of groups.values()) {
      const others = members.filter((result) => result.location !== PAGE_LOCATION)
      if (!others.length) continue
      const lowest = Math.min(...others.map((result) => result.score))
      for (const result of members) {
        if (result.location !== PAGE_LOCATION || result.score < lowest) continue
        if (titleMatch(text, result.title) >= NEAR_TITLE) continue
        result.score = lowest * 0.999
      }
    }

    // Best match first inside a group. The group order never changes.
    const ordered = GROUPS.filter((group) => groups.has(group)).map((group) => ({
      group,
      results: groups.get(group)!.sort((a, b) => b.score - a.score),
    }))
    const top = pickTopMatch(text, all)
    return {total: hits.length, groups: ordered, ...(top ? {top} : {})}
  }

  return {search}
}

export type SearchEngine = ReturnType<typeof createSearchEngine>
