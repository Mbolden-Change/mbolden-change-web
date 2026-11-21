import MiniSearch from 'minisearch'
import {GROUPS, type SearchEntry, type SearchGroup} from './types'

/** What a result shows. Hidden keywords, headings and body text stay in the index. */
export type SearchResult = Pick<SearchEntry, 'id' | 'url' | 'title' | 'group' | 'location' | 'summary' | 'newTab'> & {
  score: number
}

export type ResultGroup = {group: SearchGroup; results: SearchResult[]}
export type SearchResults = {total: number; groups: ResultGroup[]}

const FIELDS = ['title', 'keywords', 'summary', 'headings', 'body'] as const
const BOOST = {title: 4, keywords: 3, summary: 2, headings: 1.5, body: 1}

export const EMPTY_RESULTS: SearchResults = {total: 0, groups: []}

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

    // Best match first inside a group. The group order never changes.
    const ordered = GROUPS.filter((group) => groups.has(group)).map((group) => ({
      group,
      results: groups.get(group)!.sort((a, b) => b.score - a.score),
    }))
    return {total: hits.length, groups: ordered}
  }

  return {search}
}

export type SearchEngine = ReturnType<typeof createSearchEngine>
