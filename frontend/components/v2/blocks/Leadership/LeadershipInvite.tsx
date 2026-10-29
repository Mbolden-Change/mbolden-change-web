'use client'

import {useEffect, useId, useRef, useState} from 'react'
import classNames from 'classnames'
import type {PortableTextBlock} from 'next-sanity'
import type {Leadership as LeadershipType} from '@/sanity/types'
import PortableTextComponent from '@/components/PortableTextComponent'
import SkewButton from '@/components/atoms/SkewButton'
import {mailtoHref} from '../../readyToGrow/lanes'
import {useHashDialog} from '../TextMedia/useHashDialog'
import styles from './LeadershipInvite.module.scss'

type Invite = NonNullable<LeadershipType['invite']>

const COPIED_MESSAGE = 'Email address copied'
const COPIED_FOR = 4000

/** Copies with the Clipboard API, or a selected textarea where that's missing. */
async function copyText(text: string, container: HTMLElement | null) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // The page behind a modal dialog is inert, so the textarea goes inside it.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    ;(container ?? document.body).appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    area.remove()
    return copied
  }
}

/**
 * Featured Leadership: a button after the groups that opens a pop-up, such as
 * an invitation to serve on the board, ending with an email address to copy
 * or write to. With a Section ID, #section-id opens it like a Text & Media
 * pop-up. The content stays in the page HTML.
 */
export default function LeadershipInvite({
  buttonLabel,
  heading,
  body,
  closingLine,
  email,
  emailSubject,
  sectionId,
}: Invite) {
  const fallbackId = useId()
  const dialogId = sectionId || `invite${fallbackId.replace(/:/g, '')}`
  const titleId = `${dialogId}-title`
  const openerId = `${dialogId}-opener`
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | undefined>(undefined)
  const {dialogRef, phase, open, requestClose, hash} = useHashDialog(sectionId, () => setCopied(false))
  const address = email?.trim()
  const label = buttonLabel?.trim()

  useEffect(() => () => window.clearTimeout(copiedTimer.current), [])

  if (!label) return null

  const onCopy = async () => {
    if (!address) return
    const ok = await copyText(address, dialogRef.current)
    if (!ok) return
    // Clear first so a second copy is announced again.
    setCopied(false)
    window.requestAnimationFrame(() => setCopied(true))
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_FOR)
  }

  return (
    <div className={styles.invite}>
      <SkewButton
        variant="black"
        className={styles.button}
        id={openerId}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => {
          if (hash && window.location.hash !== hash) {
            window.history.pushState(window.history.state, '', hash)
          }
          open(document.getElementById(openerId))
        }}
      >
        {label}
      </SkewButton>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={heading ? titleId : undefined}
        aria-label={heading ? undefined : label}
        className={classNames(
          styles.dialog,
          phase === 'open' && styles.isOpen,
          phase === 'closing' && styles.isClosing,
        )}
        // Tab from the last control goes back to the first, and Shift+Tab the
        // other way, so focus never leaves for the browser's own controls.
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]')
          if (!focusable?.length) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          }
        }}
        // A click on the dialog box itself, not its content, is a click outside.
        onClick={(event) => {
          if (event.target === event.currentTarget) requestClose()
        }}
      >
        <div className={styles.closeBar}>
          <button type="button" className={styles.close} onClick={requestClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className={styles.content}>
          {heading && (
            <h2 id={titleId} className={styles.heading}>
              {heading}
            </h2>
          )}

          {body?.length ? (
            <PortableTextComponent value={body as PortableTextBlock[]} className={styles.body} />
          ) : null}

          {(closingLine?.length || address) && (
            <div className={styles.closing}>
              {closingLine?.length ? (
                <PortableTextComponent value={closingLine as PortableTextBlock[]} className={styles.closingLine} />
              ) : null}
              {address && (
                <div className={styles.emailRow}>
                  <a className={styles.email} href={mailtoHref(address, emailSubject?.trim())}>
                    {address}
                  </a>
                  <button
                    type="button"
                    className={styles.copy}
                    onClick={onCopy}
                    aria-label={`Copy email address ${address}`}
                  >
                    Copy
                  </button>
                  <span className={styles.status} role="status" aria-live="polite">
                    {copied ? COPIED_MESSAGE : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}
