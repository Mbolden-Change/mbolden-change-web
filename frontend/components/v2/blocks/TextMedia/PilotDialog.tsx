'use client'

import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import {PortableTextBlock} from 'next-sanity'
import type {TextMedia as TextMediaType} from '@/sanity/types'
import PortableTextComponent from '@/components/PortableTextComponent'
import {deriveTextMedia, pilotCtas, type PilotDocumentFile} from './deriveTextMedia'
import TextMediaCtas from './TextMediaCtas'
import {getLogoImage, getPilotImage, getYouTubeId} from './pilotImage'
import FunderLogo, {getFunder} from './FunderLogo'
import PilotVideo from './PilotVideo'
import styles from './PilotDialog.module.scss'

type PilotDialogProps = TextMediaType

// Motion timings (ms). The whole sequence finishes in about two seconds,
// so a long quote reveals its words faster than a short line.
const WORDS_START = 450
const WORD_STEP_MAX = 70
const WORDS_SPAN = 500
const WORD_DURATION = 450
const PARAGRAPH_STEP = 160
const ATTRIBUTION_GAP = 120
const CLOSE_DURATION = 200
// Longer display lines (quotes) are set smaller.
const LONG_LINE_WORDS = 10

const QUOTE_MARKS = {
  teal: '/bold-quote-marks/quote-aqua.png',
  fuchsia: '/bold-quote-marks/quote-fuchsia.png',
  yellow: '/bold-quote-marks/quote-yellow.png',
} as const

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
  displayAttribution,
  sectionId,
  textBody,
  ctas,
  accent = 'teal',
  supportedBy: supportedByText,
  supportedByLogo,
  supportedByLink,
  ...rest
}: PilotDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const [playing, setPlaying] = useState(false)

  const derived = deriveTextMedia({headline, textBody, ctas, ...rest})
  const linkedCtas = pilotCtas(
    ctas,
    (rest as {documentFile?: PilotDocumentFile}).documentFile,
  )
  // A video replaces the image; a logo is shown whole instead of as a photo.
  const videoId = getYouTubeId(rest.video?.url)
  const videoTitle = rest.video?.title?.trim() || headline
  const isLogo = !videoId && rest.imageStyle === 'logo'
  const logo = isLogo ? getLogoImage(derived.showImage ? derived.image : undefined) : null
  const image =
    videoId || isLogo ? null : getPilotImage(derived.showImage ? derived.image : undefined)
  const hasMedia = Boolean(videoId || logo || image)
  const words = displayLine?.trim().split(/\s+/) ?? []
  const wordStep =
    words.length > 1 ? Math.min(WORD_STEP_MAX, WORDS_SPAN / (words.length - 1)) : 0
  const lineEnd = words.length ? WORDS_START + (words.length - 1) * wordStep + 200 : 0
  const attribution = words.length ? displayAttribution?.trim() : undefined
  const attributionDelay = lineEnd
  // With an attribution the line is a quote: the brand mark opens it and a
  // closing quote mark ends it.
  const quoted = Boolean(attribution)
  const paragraphsStart = words.length
    ? lineEnd + (attribution ? ATTRIBUTION_GAP : 0)
    : WORDS_START
  const paragraphCount = (textBody as PortableTextBlock[] | undefined)?.length ?? 0
  const supportedBy = supportedByText?.trim()
  const funder = getFunder(supportedByLogo, supportedByLink)
  const hasSupporter = Boolean(supportedBy || funder)
  // The supporter note follows the paragraphs; the buttons follow it.
  const supporterDelay = paragraphsStart + paragraphCount * PARAGRAPH_STEP
  const displayText = (
    <p className={styles.displayLine}>
      {words.map((word, index) => (
        <span key={index}>
          <span
            className={styles.word}
            style={
              {
                '--word-delay': `${WORDS_START + index * wordStep}ms`,
                '--word-duration': `${WORD_DURATION}ms`,
              } as CSSProperties
            }
          >
            {word}
            {quoted && index === words.length - 1 && '”'}
          </span>
          {index < words.length - 1 && ' '}
        </span>
      ))}
    </p>
  )
  const DisplayTag = attribution ? 'figure' : 'div'
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
      // Unmounting the player stops the video.
      setPlaying(false)
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
          '--supporter-delay': `${supporterDelay}ms`,
          '--cta-delay': `${supporterDelay + (hasSupporter ? PARAGRAPH_STEP : 0)}ms`,
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

      <div
        className={classNames(
          styles.layout,
          !hasMedia && styles.noImage,
          (videoId || image?.orientation === 'landscape') && styles.landscape,
          videoId && styles.hasVideo,
        )}
      >
        {videoId && (
          <div className={styles.media}>
            <PilotVideo
              videoId={videoId}
              title={videoTitle}
              cover={getPilotImage(rest.video?.cover)}
              playing={playing}
              onPlay={() => setPlaying(true)}
            />
          </div>
        )}

        {logo && (
          <div className={styles.media}>
            <div className={styles.logoFrame}>
              <div className={styles.logoPanel}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className={styles.logo}
                />
              </div>
            </div>
          </div>
        )}

        {image && (
          <div className={styles.media}>
            <div
              className={styles.frame}
              style={
                {
                  '--image-ratio': Math.min(1, Math.max(0.75, image.ratio)),
                  '--image-focus': image.focus,
                } as CSSProperties
              }
            >
              <div className={styles.settle}>
                <div className={styles.drift}>
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={
                      image.orientation === 'landscape'
                        ? '(min-width: 768px) 940px, 100vw'
                        : '(min-width: 768px) 400px, 100vw'
                    }
                    alt={image.alt}
                    loading="lazy"
                    className={styles.image}
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
            <DisplayTag
              className={classNames(
                styles.display,
                words.length > LONG_LINE_WORDS && styles.displayLong,
                quoted && styles.hasMark,
              )}
            >
              {attribution ? (
                <>
                  <img
                    src={QUOTE_MARKS[accent]}
                    alt=""
                    aria-hidden="true"
                    className={styles.quoteMark}
                  />
                  <blockquote className={styles.displayQuote}>{displayText}</blockquote>
                  <figcaption
                    className={styles.attribution}
                    style={{'--attribution-delay': `${attributionDelay}ms`} as CSSProperties}
                  >
                    — {attribution}
                  </figcaption>
                </>
              ) : (
                displayText
              )}
            </DisplayTag>
          )}

          <div className={styles.story}>
            <PortableTextComponent value={textBody as PortableTextBlock[]} />
          </div>

          {funder ? (
            <div className={styles.supporter}>
              {supportedBy && <p className={styles.supporterText}>{supportedBy}</p>}
              <FunderLogo
                funder={funder}
                className={styles.funderLink}
                imageClassName={styles.funderLogo}
              />
            </div>
          ) : (
            supportedBy && <p className={styles.supporter}>{supportedBy}</p>
          )}

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
