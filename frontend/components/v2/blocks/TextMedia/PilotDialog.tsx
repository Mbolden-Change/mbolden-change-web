'use client'

import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import {PortableTextBlock} from 'next-sanity'
import type {TextMedia as TextMediaType} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import PortableTextComponent from '@/components/PortableTextComponent'
import {deriveTextMedia} from './deriveTextMedia'
import TextMediaCtas from './TextMediaCtas'
import styles from './PilotDialog.module.scss'

type PilotDialogProps = TextMediaType

// Motion timings (ms). The whole sequence finishes in about two seconds.
const WORDS_START = 450
const WORD_STEP = 70
const WORD_DURATION = 450
const PARAGRAPH_STEP = 220
const CLOSE_DURATION = 200

/**
 * Text & Media "Featured pilot (pop-up)" appearance. Renders a native modal
 * dialog instead of a page section. Its id is the Section ID, so any link to
 * #section-id opens it and the address with that hash opens it on load. The
 * content stays in the page HTML for search engines.
 */
export default function PilotDialog({
  headline,
  eyebrow,
  subtitle,
  displayLine,
  sectionId,
  textBody,
  ctas,
  accent = 'teal',
  ...rest
}: PilotDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed')

  const derived = deriveTextMedia({headline, textBody, ctas, ...rest})
  const linkedCtas = ctas?.filter((cta) => cta.link?.trim()) ?? []
  const words = displayLine?.trim().split(/\s+/) ?? []
  const paragraphsStart = words.length
    ? WORDS_START + words.length * WORD_STEP + 150
    : WORDS_START
  const paragraphCount = (textBody as PortableTextBlock[] | undefined)?.length ?? 0
  const titleId = sectionId ? `${sectionId}-title` : undefined
  const hash = sectionId ? `#${sectionId}` : ''

  const open = useCallback(
    (opener?: HTMLElement | null) => {
      const dialog = dialogRef.current
      if (!dialog || dialog.open) return
      openerRef.current =
        opener ?? document.querySelector<HTMLElement>(`a[href="${hash}"]`)
      window.clearTimeout(closeTimer.current)
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
      setPhase('open')
    },
    [hash],
  )

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      dialog.close()
      return
    }
    setPhase('closing')
    closeTimer.current = window.setTimeout(() => dialog.close(), CLOSE_DURATION)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !sectionId) return

    // Links that open this dialog announce it.
    const links = document.querySelectorAll<HTMLAnchorElement>(`a[href="${hash}"]`)
    links.forEach((link) => {
      link.setAttribute('aria-haspopup', 'dialog')
      link.setAttribute('aria-controls', sectionId)
    })

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest?.(`a[href="${hash}"]`)
      if (!link) return
      event.preventDefault()
      if (window.location.hash !== hash) {
        window.history.pushState(window.history.state, '', hash)
      }
      open(link as HTMLElement)
    }

    // Back and forward buttons open and close it with the address.
    const onHashChange = () => {
      if (window.location.hash === hash) open()
      else requestClose()
    }

    const onClose = () => {
      window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
      setPhase('closed')
      if (window.location.hash === hash) {
        window.history.replaceState(
          window.history.state,
          '',
          window.location.pathname + window.location.search,
        )
      }
      openerRef.current?.focus()
    }

    // Escape: play the close motion instead of closing at once.
    const onCancel = (event: Event) => {
      event.preventDefault()
      requestClose()
    }

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('hashchange', onHashChange)
    dialog.addEventListener('close', onClose)
    dialog.addEventListener('cancel', onCancel)

    if (window.location.hash === hash) open()

    return () => {
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('hashchange', onHashChange)
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('cancel', onCancel)
      window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
    }
  }, [hash, sectionId, open, requestClose])

  if (!sectionId) return null

  return (
    <dialog
      ref={dialogRef}
      id={sectionId}
      aria-labelledby={titleId}
      className={classNames(
        styles.dialog,
        styles[accent],
        phase === 'open' && styles.isOpen,
        phase === 'closing' && styles.isClosing,
      )}
      // A click on the dialog box itself, not its content, is a click outside.
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      style={
        {
          '--paragraphs-start': `${paragraphsStart}ms`,
          '--paragraph-step': `${PARAGRAPH_STEP}ms`,
          '--cta-delay': `${paragraphsStart + paragraphCount * PARAGRAPH_STEP}ms`,
        } as CSSProperties
      }
    >
      <div className={styles.closeBar}>
        <button
          type="button"
          className={styles.close}
          onClick={requestClose}
          aria-label="Close"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className={classNames(styles.layout, !derived.showImage && styles.noImage)}>
        {derived.showImage && derived.image && (
          <div className={styles.media}>
            <div className={styles.frame}>
              <div className={styles.settle}>
                <div className={styles.drift}>
                  <SanityNextImage
                    image={derived.image}
                    fit="cover"
                    className={styles.image}
                    sizes="(min-width: 768px) 400px, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.copy}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={titleId} className={styles.headline}>
            {headline}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

          {words.length > 0 && (
            <p className={styles.displayLine}>
              {words.map((word, index) => (
                <span key={index}>
                  <span
                    className={styles.word}
                    style={
                      {
                        '--word-delay': `${WORDS_START + index * WORD_STEP}ms`,
                        '--word-duration': `${WORD_DURATION}ms`,
                      } as CSSProperties
                    }
                  >
                    {word}
                  </span>
                  {index < words.length - 1 && ' '}
                </span>
              ))}
            </p>
          )}

          <div className={styles.story}>
            <PortableTextComponent value={textBody as PortableTextBlock[]} />
          </div>

          {linkedCtas.length > 0 && (
            <div className={styles.ctas}>
              <TextMediaCtas ctas={linkedCtas} variant="featured" />
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
