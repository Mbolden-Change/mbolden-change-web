'use client'

import {useEffect, useRef, type CSSProperties} from 'react'
import {laneColor, type Lane} from './lanes'
import {ZEFFY_IFRAME_ATTRS, zeffyEmbedSrc, zeffyPageUrl, type ZeffyFormRef} from './zeffy'
import styles from './Donate.module.scss'

export type DialogFund = {
  title: string
  lane?: Lane | string | null
  form?: ZeffyFormRef | null
}

type FundDialogProps = {
  /** The fund to show; null keeps the pop-up closed. */
  fund: DialogFund | null
  /** The button that opened it, focused again on close. */
  opener: HTMLElement | null
  onClose: () => void
}

/**
 * Pop-up with one fund's Zeffy form. A native modal dialog, so focus stays
 * inside and Escape closes it. The form's iframe is only added while it's
 * open, so nothing loads from Zeffy until someone asks for it.
 */
export default function FundDialog({fund, opener, onClose}: FundDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef(opener)
  openerRef.current = opener
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isOpen = Boolean(fund)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // Escape, the X and a click outside all end here.
    const handleClose = () => {
      document.documentElement.style.overflow = ''
      onCloseRef.current()
      openerRef.current?.focus()
    }
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
      document.documentElement.style.overflow = ''
    }
  }, [])

  const src = zeffyEmbedSrc(fund?.form)
  const pageUrl = zeffyPageUrl(fund?.form)
  const titleId = 'fund-dialog-title'

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      style={{'--lane': laneColor(fund?.lane)} as CSSProperties}
      // Tab from the last control goes back to the first, and Shift+Tab the
      // other way, so focus never leaves for the browser's own controls.
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], iframe')
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
      // A click on the backdrop lands on the dialog itself, not its content.
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
    >
      {fund && (
        <div className={styles.dialogBody}>
          <button
            type="button"
            className={styles.close}
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            <span aria-hidden="true">×</span>
          </button>
          <p className={styles.dialogEyebrow}>Donate</p>
          <h2 id={titleId} className={styles.dialogTitle}>
            {fund.title}
          </h2>
          {src && (
            <div className={styles.dialogForm}>
              <iframe
                title={`Donation form for ${fund.title}, powered by Zeffy`}
                src={src}
                {...ZEFFY_IFRAME_ATTRS}
              />
            </div>
          )}
          {pageUrl && (
            <p className={styles.formNote}>
              Form not loading?{' '}
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                Give on Zeffy
              </a>
              .
            </p>
          )}
        </div>
      )}
    </dialog>
  )
}
