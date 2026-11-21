'use client'

import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import type {SearchGroup} from '@/lib/search/types'
import SearchExperience, {isSearchGroup, searchPageHref} from './SearchExperience'
import styles from './Search.module.scss'

export const PAGE_INPUT_ID = 'site-search-input'

/** The /search page: the same search as the panel, with every group open and the search in the address. */
export default function SearchPage() {
  const params = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const urlGroup = isSearchGroup(params.get('group')) ? (params.get('group') as SearchGroup) : null
  const [query, setQuery] = useState(urlQuery)
  const [group, setGroup] = useState<SearchGroup | null>(urlGroup)
  const inputRef = useRef<HTMLInputElement>(null)

  // Back, forward and links to another search bring their own address.
  useEffect(() => {
    setQuery((current) => (current.trim() === urlQuery.trim() ? current : urlQuery))
    setGroup(urlGroup)
  }, [urlQuery, urlGroup])

  // The address always says what's on screen, so it can be shared.
  const show = (nextQuery: string, nextGroup: SearchGroup | null) => {
    setQuery(nextQuery)
    setGroup(nextGroup)
    window.history.replaceState(window.history.state, '', searchPageHref(nextQuery, nextGroup))
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <SearchExperience
          variant="page"
          labelAs="h1"
          query={query}
          onQueryChange={(value) => show(value, null)}
          group={group}
          onGroupChange={(value) => show(query, value)}
          inputRef={inputRef}
          inputId={PAGE_INPUT_ID}
        />
      </div>
    </div>
  )
}
