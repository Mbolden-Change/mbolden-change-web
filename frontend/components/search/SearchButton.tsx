'use client'

import {forwardRef} from 'react'
import classNames from 'classnames'
import SearchIcon from './SearchIcon'
import styles from './Search.module.scss'

type SearchButtonProps = {
  expanded: boolean
  className?: string
  onOpen: () => void
  /** Hover or focus: a good moment to start loading the index. */
  onIntent: () => void
}

/** The header's search button. Opens the search panel. */
const SearchButton = forwardRef<HTMLButtonElement, SearchButtonProps>(function SearchButton(
  {expanded, className, onOpen, onIntent},
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={classNames(styles.searchButton, className)}
      aria-label="Search"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onOpen}
      onPointerEnter={onIntent}
      onFocus={onIntent}
    >
      <SearchIcon className={styles.searchButtonIcon} />
    </button>
  )
})

export default SearchButton
