'use client'

import {useEffect, useMemo, useState} from 'react'
import {loadSearch, type LoadedSearch} from '@/lib/search/client'
import {EMPTY_RESULTS, type SearchResults} from '@/lib/search/engine'

export type SearchStatus = 'loading' | 'ready' | 'error'

/** Loads the index when `active` first turns true, then searches it as the query changes. */
export function useSearch(query: string, active: boolean) {
  const [loaded, setLoaded] = useState<LoadedSearch | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!active || loaded) return
    let cancelled = false
    setFailed(false)
    loadSearch().then(
      (value) => {
        if (!cancelled) setLoaded(value)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [active, loaded])

  const results: SearchResults = useMemo(
    () => (loaded ? loaded.engine.search(query) : EMPTY_RESULTS),
    [loaded, query],
  )
  const status: SearchStatus = loaded ? 'ready' : failed ? 'error' : 'loading'

  return {status, results, index: loaded?.index ?? null}
}
