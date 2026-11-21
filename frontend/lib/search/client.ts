import {createSearchEngine, type SearchEngine} from './engine'
import type {SearchIndex} from './types'

export type LoadedSearch = {index: SearchIndex; engine: SearchEngine}

let loading: Promise<LoadedSearch> | null = null

/**
 * Fetches the index the first time it's needed and keeps it in memory for
 * the rest of the visit. A failed fetch can be tried again.
 */
export function loadSearch(): Promise<LoadedSearch> {
  if (!loading) {
    loading = fetch('/api/search-index', {headers: {accept: 'application/json'}})
      .then((response) => {
        if (!response.ok) throw new Error(`Search index answered ${response.status}`)
        return response.json() as Promise<SearchIndex>
      })
      .then((index) => ({index, engine: createSearchEngine(index.entries)}))
      .catch((error) => {
        loading = null
        throw error
      })
  }
  return loading
}

/** Starts loading early, on hover or focus of the search button. Never throws. */
export function preloadSearch() {
  loadSearch().catch(() => undefined)
}
