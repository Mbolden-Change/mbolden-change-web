'use client'

import {useEffect, useId, useState, type CSSProperties, type FormEvent, type ReactNode, type RefObject} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import classNames from 'classnames'
import {trackSearchNoResults, trackSearchResultClick} from '@/lib/analytics'
import type {SearchResult} from '@/lib/search/engine'
import {GROUPS, type SearchGroup, type SearchLink} from '@/lib/search/types'
import SearchIcon from './SearchIcon'
import {useSearch} from './useSearch'
import styles from './Search.module.scss'

export const SEARCH_LABEL = 'Search mBOLDen Change and mBOLDen Action'
const PLACEHOLDER = 'Try a program, a fund, a post or a campaign'
const GET_IN_TOUCH_HREF = '/about#get-in-touch'
/** Results shown per group in the panel before "Show all". */
const PREVIEW_COUNT = 3
/** A pause in typing this long counts as a finished search. */
const NO_RESULTS_PAUSE = 1500

export const searchPageHref = (query: string, group?: SearchGroup | null) => {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (group) params.set('group', group)
  const text = params.toString()
  return text ? `/search?${text}` : '/search'
}

export const isSearchGroup = (value: string | null | undefined): value is SearchGroup =>
  GROUPS.includes(value as SearchGroup)

type SearchExperienceProps = {
  /** The panel shows three results per group; the page shows them all. */
  variant: 'panel' | 'page'
  query: string
  onQueryChange: (query: string) => void
  group: SearchGroup | null
  onGroupChange: (group: SearchGroup | null) => void
  inputRef: RefObject<HTMLInputElement | null>
  inputId: string
  /** False until search is first opened, so the index isn't loaded with the page. */
  active?: boolean
  /** Beside the label: the panel's Close button. */
  labelAside?: ReactNode
  /** The label is the page's heading on /search. */
  labelAs?: 'label' | 'h1'
  /** A result or link was chosen. */
  onNavigate?: () => void
  onSubmit?: (query: string) => void
}

type AnyLinkProps = {
  href: string
  newTab?: boolean
  className?: string
  onClick?: () => void
  children: ReactNode
}

/**
 * Outside addresses open in a new tab. A link to a section of the page we're
 * already on is a plain link, so the browser reports the new #section and a
 * pop-up tied to it opens. Everything else is a client-side page change.
 */
function AnyLink({href, newTab, className, onClick, children}: AnyLinkProps) {
  const pathname = usePathname()
  if (newTab || /^[a-z]+:/i.test(href)) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        {...(newTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      >
        {children}
      </a>
    )
  }
  const [path, hash] = href.split('#')
  if (hash && path === pathname) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

/** Points right, or up and out for a link that opens in a new tab. */
const Arrow = ({out = false}: {out?: boolean}) => (
  <span className={styles.arrow} aria-hidden="true">
    {out ? '↗' : '→'}
  </span>
)

function ResultRow({result, onNavigate}: {result: SearchResult; onNavigate?: () => void}) {
  const isAction = result.group === 'From mBOLDen Action'
  return (
    <li className={styles.result}>
      <AnyLink
        href={result.url}
        newTab={result.newTab}
        className={styles.resultLink}
        onClick={() => {
          trackSearchResultClick(result.group)
          onNavigate?.()
        }}
      >
        <span className={styles.resultText}>
          {result.location && <span className={styles.location}>{result.location}</span>}
          <span className={styles.resultTitle}>
            {result.title}
            {result.newTab && !isAction && <span className={styles.srOnly}> (opens in a new tab)</span>}
          </span>
          {result.summary && <span className={styles.summary}>{result.summary}</span>}
          {isAction && (
            <span className={styles.actionTag}>
              Opens mboldenaction.org <span aria-hidden="true">↗</span>
              <span className={styles.srOnly}> in a new tab</span>
            </span>
          )}
        </span>
        <Arrow out={result.newTab} />
      </AnyLink>
    </li>
  )
}

function PopularLinks({links, onNavigate}: {links: SearchLink[]; onNavigate?: () => void}) {
  const headingId = useId()
  if (!links.length) return null
  return (
    <section className={styles.popular} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.groupHeading}>
        Popular
      </h2>
      <ul className={styles.results}>
        {links.map((link) => (
          <li key={`${link.href}${link.title}`} className={styles.result}>
            <AnyLink href={link.href} newTab={link.newTab} className={styles.resultLink} onClick={onNavigate}>
              <span className={styles.resultText}>
                <span className={styles.resultTitle}>
                  {link.title}
                  {link.newTab && <span className={styles.srOnly}> (opens in a new tab)</span>}
                </span>
              </span>
              <Arrow out={link.newTab} />
            </AnyLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * The search box and everything under it: suggested words, the status line,
 * group filters, grouped results and the Popular list. Shared by the header
 * panel and the /search page.
 */
export default function SearchExperience({
  variant,
  query,
  onQueryChange,
  group,
  onGroupChange,
  inputRef,
  inputId,
  active = true,
  labelAside,
  labelAs = 'label',
  onNavigate,
  onSubmit,
}: SearchExperienceProps) {
  const {status, results, index} = useSearch(query, active)
  const [expanded, setExpanded] = useState<SearchGroup[]>([])
  const term = query.trim()
  const hasQuery = term.length > 0
  const ready = status === 'ready'
  const noResults = ready && hasQuery && results.total === 0
  // A filter for a group with no matches (a shared link, or a changed query) shows everything.
  const activeGroup = group && results.groups.some((entry) => entry.group === group) ? group : null
  const shownGroups = activeGroup ? results.groups.filter((entry) => entry.group === activeGroup) : results.groups

  // "Show all" is per search: a new query folds the groups back.
  useEffect(() => setExpanded([]), [term])

  // One "no results" event per query, once typing has paused.
  useEffect(() => {
    if (!noResults) return
    const timer = window.setTimeout(() => trackSearchNoResults(term), NO_RESULTS_PAUSE)
    return () => window.clearTimeout(timer)
  }, [noResults, term])

  const statusText = !hasQuery
    ? ''
    : status === 'error'
      ? 'Search isn’t available right now. Please try again in a moment.'
      : !ready
        ? 'Searching…'
        : results.total === 0
          ? `No results for “${term}”.`
          : results.total === 1
            ? `1 result for “${term}”`
            : `${results.total} results for “${term}”, best matches first`

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit?.(term)
  }

  const setQuery = (value: string) => {
    onQueryChange(value)
    inputRef.current?.focus()
  }

  return (
    <div className={classNames(styles.experience, variant === 'page' && styles.onPage)}>
      <div className={styles.labelRow}>
        {labelAs === 'h1' ? (
          <h1 className={styles.label}>
            <label htmlFor={inputId}>{SEARCH_LABEL}</label>
          </h1>
        ) : (
          <label htmlFor={inputId} className={styles.label}>
            {SEARCH_LABEL}
          </label>
        )}
        {labelAside}
      </div>

      <form role="search" action="/search" className={styles.field} onSubmit={submit}>
        <SearchIcon className={styles.fieldIcon} />
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          // Not type="search": there, Esc empties the box instead of closing the panel.
          type="text"
          inputMode="search"
          className={styles.input}
          value={query}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => setQuery('')}>
            Clear
          </button>
        )}
      </form>

      {index && index.tryWords.length > 0 && (
        <div className={styles.tryRow} role="group" aria-label="Suggested searches">
          <span className={styles.tryLabel} aria-hidden="true">
            Try:
          </span>
          {index.tryWords.map((word) => (
            <button key={word} type="button" className={styles.chip} onClick={() => setQuery(word)}>
              <span className={styles.srOnly}>Search for </span>
              {word}
            </button>
          ))}
        </div>
      )}

      <p className={styles.status} role="status" aria-live="polite">
        {statusText}
      </p>

      {results.groups.length >= 2 && (
        <div className={styles.filters} role="group" aria-label="Show results from">
          <button
            type="button"
            className={styles.filter}
            aria-pressed={!activeGroup}
            onClick={() => onGroupChange(null)}
          >
            All <span className={styles.count}>{results.total}</span>
          </button>
          {results.groups.map((entry) => (
            <button
              key={entry.group}
              type="button"
              className={styles.filter}
              aria-pressed={activeGroup === entry.group}
              onClick={() => onGroupChange(activeGroup === entry.group ? null : entry.group)}
            >
              {entry.group} <span className={styles.count}>{entry.results.length}</span>
            </button>
          ))}
        </div>
      )}

      {shownGroups.length > 0 && (
        <div className={styles.groups}>
          {shownGroups.map((entry, position) => {
            const total = entry.results.length
            const showAll = variant === 'page' || Boolean(activeGroup) || expanded.includes(entry.group)
            const canFold = variant === 'panel' && !activeGroup && total > PREVIEW_COUNT
            const visible = showAll ? entry.results : entry.results.slice(0, PREVIEW_COUNT)
            return (
              <section
                key={entry.group}
                className={styles.group}
                style={{'--rise-delay': `${Math.min(position, 6) * 60}ms`} as CSSProperties}
                aria-label={`${entry.group}, ${total} ${total === 1 ? 'result' : 'results'}`}
              >
                <h2 className={styles.groupHeading}>
                  {entry.group} <span className={styles.groupCount}>{total}</span>
                </h2>
                <ul className={styles.results}>
                  {visible.map((result) => (
                    <ResultRow key={result.id} result={result} onNavigate={onNavigate} />
                  ))}
                </ul>
                {canFold && (
                  <button
                    type="button"
                    className={styles.more}
                    aria-expanded={showAll}
                    onClick={() =>
                      setExpanded((current) =>
                        showAll ? current.filter((name) => name !== entry.group) : [...current, entry.group],
                      )
                    }
                  >
                    {showAll ? 'Show fewer' : `Show all ${total} in ${entry.group}`}
                  </button>
                )}
              </section>
            )
          })}
        </div>
      )}

      {variant === 'panel' && ready && results.total > PREVIEW_COUNT && (
        <Link href={searchPageHref(term)} className={styles.seeAll} onClick={onNavigate}>
          <span>See all {results.total} results</span>
          <Arrow />
        </Link>
      )}

      {noResults && (
        <p className={styles.noResults}>
          We don’t have anything on that yet. These are the places people go most, or{' '}
          <AnyLink href={GET_IN_TOUCH_HREF} className={styles.inlineLink} onClick={onNavigate}>
            get in touch
          </AnyLink>{' '}
          and we’ll point you in the right direction.
        </p>
      )}

      {index && (!hasQuery || noResults) && <PopularLinks links={index.popular} onNavigate={onNavigate} />}
    </div>
  )
}
