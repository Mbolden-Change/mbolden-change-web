'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import classNames from 'classnames'
import type {SearchGroup} from '@/lib/search/types'
import SearchExperience, {searchPageHref} from './SearchExperience'
import styles from './Search.module.scss'

const CLOSE_DURATION = 200
export const PANEL_INPUT_ID = 'site-search-panel-input'

type SearchPanelProps = {
  open: boolean
  onClose: () => void
  /** Called once the panel has closed, to put focus back on the search button. */
  onClosed: () => void
}

/**
 * The search panel: a modal dialog that drops down under the header. Focus
 * moves to the input when it opens and back to the search button when it
 * closes. Esc, the Close button and a click on the dimmed page close it.
 */
export default function SearchPanel({open, onClose, onClosed}: SearchPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<SearchGroup | null>(null)
  const router = useRouter()
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  // A chosen result closes the panel at once, with no motion, so the page
  // (or a pop-up on it) it leads to isn't opened behind a closing panel.
  const closeNow = () => {
    window.clearTimeout(closeTimer.current)
    setClosing(false)
    if (dialogRef.current?.open) dialogRef.current.close()
    document.documentElement.style.overflow = ''
    onClose()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      window.clearTimeout(closeTimer.current)
      setClosing(false)
      if (!dialog.open) dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
      inputRef.current?.focus()
      inputRef.current?.select()
      return
    }

    if (!dialog.open) return
    const finish = () => {
      setClosing(false)
      dialog.close()
      document.documentElement.style.overflow = ''
      onClosedRef.current()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    setClosing(true)
    closeTimer.current = window.setTimeout(finish, CLOSE_DURATION)
  }, [open])

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
    },
    [],
  )

  return (
    <dialog
      ref={dialogRef}
      className={classNames(styles.panel, open && styles.panelOpen, closing && styles.panelClosing)}
      aria-labelledby="site-search-panel-label"
      // Esc: play the close motion rather than closing at once.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // A click on the dialog itself, not its content, is a click on the dimmed page.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.panelInner}>
        <span id="site-search-panel-label" className={styles.srOnly}>
          Search
        </span>
        <SearchExperience
          variant="panel"
          query={query}
          onQueryChange={(value) => {
            setQuery(value)
            setGroup(null)
          }}
          group={group}
          onGroupChange={setGroup}
          inputRef={inputRef}
          inputId={PANEL_INPUT_ID}
          onNavigate={closeNow}
          onSubmit={(term) => {
            if (!term) return
            closeNow()
            router.push(searchPageHref(term))
          }}
          labelAside={
            <button type="button" className={styles.close} onClick={onClose}>
              Close{' '}
              <kbd className={styles.esc} aria-hidden="true">
                Esc
              </kbd>
            </button>
          }
        />
      </div>
    </dialog>
  )
}
