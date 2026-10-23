'use client'

import classNames from 'classnames'
import Link from 'next/link'
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import ActionNetworkModal from '@/components/blocks/ActionNetworkModal/ActionNetworkModal'
import {useScrollReveal} from '../motion/useScrollReveal'
import {StatementText, sectionsOf} from './Article'
import ShareRow from './ShareRow'
import {formatDate, hostLabel} from './newsFormat'
import styles from './pages.module.scss'

export type StatementPageData = {
  title?: string | null
  slug?: string | null
  date?: string | null
  datePrecision?: string | null
  issue?: string | null
  lead?: string | null
  text?: unknown[] | null
  sources?: Array<{_key: string; text?: string | null; url?: string | null}> | null
  closing?: {
    eyebrow?: string | null
    text?: string | null
    line?: string | null
    lineAccent?: string | null
    cta?: string | null
    newsletterLabel?: string | null
    moreLabel?: string | null
  } | null
  pdfDownload?: {url?: string | null} | null
}

const NEWS_PATH = '/news'
// Titles longer than this use a smaller size, so they don't run to four lines.
const LONG_TITLE = 60

/** Paragraphs separated by a blank line. */
const paragraphs = (text?: string | null) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

/** Tracks how far the reader is through the article, and which section is on screen. */
function useReading(sectionCount: number) {
  const articleRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const node = articleRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const h = window.innerHeight
      const p = Math.max(0, Math.min(1, (h * 0.3 - rect.top) / Math.max(1, rect.height - h * 0.4)))
      setProgress(Math.round(p * 100))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const node = articleRef.current
    if (!node || sectionCount === 0 || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.sec))
        })
      },
      {rootMargin: '-20% 0px -70% 0px'},
    )
    node.querySelectorAll('[data-sec]').forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [sectionCount])

  return {articleRef, progress, active, setActive}
}

/** A statement: hero with share links, the article with its "On this page" menu, sources and a closing block. */
export default function StatementPage({
  title,
  slug,
  date,
  datePrecision,
  issue,
  lead,
  text,
  sources,
  closing,
  pdfDownload,
}: StatementPageData) {
  const hero = useScrollReveal<HTMLElement>(0.1)
  const body = useScrollReveal<HTMLElement>(0.05)
  const close = useScrollReveal<HTMLElement>(0.2)
  const sections = sectionsOf(text)
  const {articleRef, progress, active, setActive} = useReading(sections.length)
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  const phase = (p: string) => [p === 'armed' && styles.armed, p === 'in' && styles.in]

  const dateLabel = formatDate(date, datePrecision === 'day' ? 'day' : 'monthLong')
  const shownSources = (sources ?? []).filter((source) => source.text)
  const ctaParagraphs = paragraphs(closing?.cta)
  const hasClosing = Boolean(closing?.eyebrow || closing?.text || closing?.line || ctaParagraphs.length)

  return (
    <main className={styles.page}>
      <div className={styles.progress} aria-hidden="true">
        <b style={{width: `${progress}%`}} />
      </div>

      <section ref={hero.ref} className={classNames(styles.hero, ...phase(hero.phase))}>
        <div className={classNames(styles.wrap, styles.heroNarrow)}>
          <Link href={NEWS_PATH} className={classNames(styles.crumb, styles.rv)}>
            <span aria-hidden="true">←</span> News &amp; Statements
          </Link>
          <div className={classNames(styles.meta, styles.rv, styles.d1)}>
            <span className={styles.tag} style={{background: 'var(--brand-warm-yellow)', color: 'var(--brand-black)'}}>
              Statement
            </span>
            {issue && (
              <span className={styles.tag} style={{background: 'var(--brand-black)', color: 'var(--brand-white)'}}>
                {issue}
              </span>
            )}
            {dateLabel && <span>{dateLabel} · mBOLDen Change</span>}
          </div>
          <h1 className={classNames(styles.title, (title?.length ?? 0) > LONG_TITLE && styles.titleLong, styles.rv, styles.d1)}>{title}</h1>
          {lead && <p className={classNames(styles.leadLine, styles.rv, styles.d2)}>{lead}</p>}
          <ShareRow
            title={title ?? ''}
            path={`/statement/${slug}`}
            pdfUrl={pdfDownload?.url}
            className={classNames(styles.rv, styles.d3)}
          />
        </div>
      </section>

      <section ref={body.ref} className={classNames(styles.body, ...phase(body.phase))}>
        <div className={classNames(styles.wrap, styles.layout)}>
          {sections.length > 0 ? (
            <nav className={styles.toc} aria-label="On this page">
              <span>On this page</span>
              {sections.map((section, i) => (
                <a
                  key={section.key}
                  href={`#${section.id}`}
                  className={classNames(active === i && styles.tocOn)}
                  aria-current={active === i ? 'location' : undefined}
                  onClick={() => setActive(i)}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          ) : (
            <div aria-hidden="true" />
          )}
          <article ref={articleRef} className={styles.art}>
            <StatementText value={text} />
            {shownSources.length > 0 && (
              <div className={styles.src} id="sources">
                <h2>Sources</h2>
                <ol>
                  {shownSources.map((source, i) => (
                    <li key={source._key} id={`fn${i + 1}`}>
                      {source.text}{' '}
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {hostLabel(source.url)} <span aria-hidden="true">↗</span>
                          <span className={styles.srOnly}> (opens in a new tab)</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        </div>
      </section>

      {hasClosing && (
        <section ref={close.ref} className={classNames(styles.close, ...phase(close.phase))}>
          <div className={classNames(styles.wrap, styles.closeGrid)}>
            <div className={styles.closeCopy}>
              {closing?.eyebrow && (
                <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-warm-yellow)', color: 'var(--brand-white)'} as CSSProperties}>
                  {closing.eyebrow}
                </p>
              )}
              {closing?.text && <p className={classNames(styles.closeText, styles.rv, styles.d1)}>{closing.text}</p>}
              {(closing?.line || closing?.lineAccent) && (
                <p className={classNames(styles.closeLine, styles.rv, styles.d2)}>
                  {closing.line}
                  {closing.line && closing.lineAccent && !/[—–-]$/.test(closing.line) && ' '}
                  {closing.lineAccent && <span>{closing.lineAccent}</span>}
                </p>
              )}
            </div>
            <div className={classNames(styles.closeAct, styles.rv, styles.d3)}>
              {ctaParagraphs.map((p, i) => (
                <p key={i} style={{whiteSpace: 'pre-line'}}>
                  {p}
                </p>
              ))}
              {(closing?.newsletterLabel || closing?.moreLabel) && (
                <div className={styles.buttons}>
                  {closing?.newsletterLabel && (
                    <SkewButton variant="yellow" className={styles.button} onClick={() => setNewsletterOpen(true)}>
                      {closing.newsletterLabel}
                    </SkewButton>
                  )}
                  {closing?.moreLabel && (
                    <Link href={NEWS_PATH} className={styles.lineButton}>
                      {closing.moreLabel}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <ActionNetworkModal isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} location="statement" />
    </main>
  )
}
