'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import SkewButton from '@/components/atoms/SkewButton'
import {OPEN_CONSENT_EVENT, hasGpc, needsConsentBanner, saveConsentChoice, type ConsentChoice} from '@/lib/ga'
import styles from './ConsentBanner.module.scss'

/**
 * The Google Analytics consent bar. Shown on arrival only to visitors in EEA,
 * UK and Swiss time zones who haven't chosen yet; the footer's "Cookie
 * choices" link reopens it for anyone. The choice is kept in this browser's
 * storage, not in a cookie. With Global Privacy Control on, analytics stay
 * off and there is nothing to choose.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const [gpc, setGpc] = useState(false)
  const bannerRef = useRef<HTMLElement>(null)
  // What had focus when the footer link reopened the bar.
  const openerRef = useRef<HTMLElement | null>(null)
  const focusOnOpen = useRef(false)

  const close = useCallback(() => {
    const inside = bannerRef.current?.contains(document.activeElement)
    setOpen(false)
    if (!inside) return
    const target = openerRef.current ?? document.getElementById('main-content')
    target?.focus({preventScroll: true})
    openerRef.current = null
  }, [])

  useEffect(() => {
    if (needsConsentBanner()) setOpen(true)
    const reopen = () => {
      openerRef.current = document.activeElement as HTMLElement | null
      focusOnOpen.current = true
      setGpc(hasGpc())
      setOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [])

  // Reopened from the footer: focus moves to the first button.
  useEffect(() => {
    if (!open || !focusOnOpen.current) return
    focusOnOpen.current = false
    bannerRef.current?.querySelector<HTMLElement>('button')?.focus()
  }, [open])

  const choose = (choice: ConsentChoice) => {
    saveConsentChoice(choice)
    close()
  }

  return (
    // The live region is always in the page, so the bar is announced when it appears.
    <div aria-live="polite" className={styles.live}>
      {open && (
        <section
          ref={bannerRef}
          className={styles.banner}
          aria-label="Cookie choices"
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        >
          <div className={styles.inner}>
            <p className={styles.text}>
              {gpc
                ? 'Your browser sends a Global Privacy Control signal, so Google Analytics stays off on this site.'
                : 'We use Google Analytics to understand how people use this site and whether our ads work. Accept or decline.'}{' '}
              <Link href="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
            </p>
            <div className={styles.actions}>
              {gpc ? (
                <SkewButton variant="black" className={styles.button} onClick={close}>
                  Close
                </SkewButton>
              ) : (
                <>
                  <SkewButton variant="black" className={styles.button} onClick={() => choose('granted')}>
                    Accept
                  </SkewButton>
                  <SkewButton variant="black" className={styles.button} onClick={() => choose('denied')}>
                    Decline
                  </SkewButton>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
