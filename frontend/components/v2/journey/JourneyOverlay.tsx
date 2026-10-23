'use client'

import {createContext, useCallback, useContext, useEffect, useRef, useState, type RefObject} from 'react'
import {createPortal} from 'react-dom'
import Journey from './Journey'
import {JOURNEY} from './journeyData'
import {JOURNEY_HOME, JOURNEY_PATH} from './journeyPaths'
import styles from './JourneyOverlay.module.scss'


/** True on /building-the-road, which renders About with the journey already open. */
export const JourneyRouteContext = createContext(false)

const COVER_ID = 'journey-cover'
type JourneyHistoryState = {journeyOverlay?: boolean} | null

/**
 * Opens and closes the journey, keeping the address in step: opening adds
 * /building-the-road to the history, so Back closes it. Closing returns
 * focus to the element that opened it.
 */
export function useJourney(returnFocusRef: RefObject<HTMLElement | null>) {
  const openedFromRoute = useContext(JourneyRouteContext)
  const [open, setOpen] = useState(openedFromRoute)
  // Where About was scrolled to when the journey opened, put back when it closes.
  const restoreY = useRef(0)

  // Arriving at /building-the-road: put About underneath in the history, so Back closes the journey.
  useEffect(() => {
    if (!openedFromRoute || window.location.pathname !== JOURNEY_PATH) return
    if ((window.history.state as JourneyHistoryState)?.journeyOverlay) return
    window.history.replaceState(window.history.state, '', JOURNEY_HOME)
    window.history.pushState({...window.history.state, journeyOverlay: true}, '', JOURNEY_PATH)
  }, [openedFromRoute])

  useEffect(() => {
    const onPop = () => {
      const inJourney = Boolean((window.history.state as JourneyHistoryState)?.journeyOverlay)
      setOpen(inJourney)
      if (!inJourney) {
        hideCover()
        returnFocusRef.current?.focus({preventScroll: true})
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [returnFocusRef])

  const openJourney = useCallback(() => {
    restoreY.current = window.scrollY
    setOpen(true)
    window.history.pushState({...window.history.state, journeyOverlay: true}, '', JOURNEY_PATH)
  }, [])

  const closeJourney = useCallback(() => {
    if ((window.history.state as JourneyHistoryState)?.journeyOverlay) {
      // popstate closes it and returns focus.
      window.history.back()
      return
    }
    setOpen(false)
    hideCover()
    window.history.replaceState(window.history.state, '', JOURNEY_HOME)
    returnFocusRef.current?.focus({preventScroll: true})
  }, [returnFocusRef])

  return {open, openJourney, closeJourney, restoreY}
}

/** The dark cover /building-the-road shows until the overlay is up; hidden for good once it closes. */
function hideCover() {
  const cover = document.getElementById(COVER_ID)
  if (cover) cover.hidden = true
}

/** Covers the About page on /building-the-road until the journey overlay mounts over it. */
export function JourneyCover() {
  return (
    <div id={COVER_ID} className={styles.cover} aria-hidden="true" />
  )
}

/** The journey in a full-screen layer above the whole site, including the header. */
export function JourneyOverlay({
  open,
  onClose,
  restoreY,
}: {
  open: boolean
  onClose: () => void
  restoreY: RefObject<number>
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !open) return null
  return createPortal(<OverlayBody onClose={onClose} restoreY={restoreY} />, document.body)
}

function OverlayBody({onClose, restoreY}: {onClose: () => void; restoreY: RefObject<number>}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const root = rootRef.current
    const scroller = scrollerRef.current
    if (!root || !scroller) return

    // Lock the page behind; it keeps its scroll position for when the journey closes.
    const html = document.documentElement
    const gutter = window.innerWidth - html.clientWidth
    const saved = {htmlOverflow: html.style.overflow, bodyOverflow: document.body.style.overflow, bodyPadding: document.body.style.paddingRight}
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`

    // Everything else on the page is out of reach while the journey is open.
    const others = Array.from(document.body.children).filter((el) => el !== root && !el.hasAttribute('inert'))
    others.forEach((el) => el.setAttribute('inert', ''))

    const title = document.title
    document.title = `${JOURNEY.title} | mBOLDen Change`
    scroller.scrollTop = 0
    scroller.focus({preventScroll: true})

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      others.forEach((el) => el.removeAttribute('inert'))
      html.style.overflow = saved.htmlOverflow
      document.body.style.overflow = saved.bodyOverflow
      document.body.style.paddingRight = saved.bodyPadding
      // Locking the page can shift it a little; return exactly to where the reader was.
      window.scrollTo({top: restoreY.current ?? 0, behavior: 'instant'})
      document.title = title
    }
  }, [])

  return (
    <div ref={rootRef} className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="journey-title">
      <div ref={scrollerRef} className={styles.scroller} tabIndex={-1}>
        <Journey scrollerRef={scrollerRef} onFinish={() => onCloseRef.current()} />
      </div>
      <button type="button" className={styles.close} aria-label="Close the journey" onClick={() => onCloseRef.current()}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
