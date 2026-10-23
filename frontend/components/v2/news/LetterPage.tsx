'use client'

import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import type {CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import {LinkAtom} from '@/components/atoms/Link'
import {getDimensionsFromRef, urlFor} from '@/sanity/lib/image'
import type {InternalOrExternalLink} from '@/sanity/types'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../motion/useScrollReveal'
import {RichText} from './Article'
import ShareRow from './ShareRow'
import {SWATCH, formatDate} from './newsFormat'
import styles from './pages.module.scss'

export type LetterPageData = {
  title?: string | null
  slug?: string | null
  date?: string | null
  issue?: string | null
  summary?: string | null
  position?: string | null
  to?: string | null
  from?: string | null
  bill?: string | null
  letterDate?: string | null
  addresses?: string[] | null
  re?: string | null
  body?: unknown[] | null
  signOff?: string | null
  signatureName?: string | null
  signatureDetails?: string | null
  moreEyebrow?: string | null
  related?: Array<{
    _key: string
    label?: string | null
    title?: string | null
    color?: string | null
    link?: InternalOrExternalLink | null
  }> | null
  moreLabel?: string | null
  logo?: {asset?: {_ref?: string}; alt?: string} | null
}

const NEWS_PATH = '/news'
// The logo image has whitespace around it, so it's sized by width to match the header.
const LOGO_WIDTH = 140
const DELAYS = [styles.d1, styles.d2, styles.d3]

function Logo({logo}: {logo: LetterPageData['logo']}) {
  const ref = logo?.asset?._ref
  if (!ref) return null
  const {imageWidth, imageHeight} = getDimensionsFromRef(ref)
  if (!imageWidth || !imageHeight) return null
  const height = Math.round((imageHeight / imageWidth) * LOGO_WIDTH)
  return (
    <Image
      src={urlFor(logo).width(LOGO_WIDTH * 2).auto('format').url()}
      width={LOGO_WIDTH}
      height={height}
      alt="mBOLDen Change"
      className={styles.logo}
    />
  )
}

/** One of our letters: hero with facts, the full letter on a paper card, and related reading. */
export default function LetterPage(props: LetterPageData) {
  const {title, slug, date, issue, summary, position, to, from, bill} = props
  const hero = useScrollReveal<HTMLElement>(0.1)
  const letter = useScrollReveal<HTMLElement>(0.08)
  const more = useScrollReveal<HTMLElement>(0.2)
  const phase = (p: string) => [p === 'armed' && styles.armed, p === 'in' && styles.in]
  const related = (props.related ?? []).filter((card) => card.title && isRenderableInternalOrExternalLink(card.link ?? undefined))
  const facts = [
    {label: 'Position', value: position, badge: true},
    {label: 'To', value: to},
    {label: 'From', value: from},
    {label: 'Bill', value: bill},
  ].filter((fact) => fact.value)

  return (
    <main className={styles.page}>
      <section ref={hero.ref} className={classNames(styles.hero, ...phase(hero.phase))}>
        <div className={classNames(styles.wrap, styles.heroGrid)}>
          <div className={styles.heroCopy}>
            <Link href={NEWS_PATH} className={classNames(styles.crumb, styles.rv)}>
              <span aria-hidden="true">←</span> News &amp; Statements
            </Link>
            <div className={classNames(styles.meta, styles.rv, styles.d1)}>
              <span className={styles.tag} style={{background: 'var(--brand-fuchsia)', color: 'var(--brand-white)'}}>
                Our letter
              </span>
              {issue && (
                <span className={styles.tag} style={{background: 'var(--brand-black)', color: 'var(--brand-white)'}}>
                  {issue}
                </span>
              )}
              {date && <span>{formatDate(date, 'day')}</span>}
            </div>
            <h1 className={classNames(styles.title, styles.letterTitle, styles.rv, styles.d1)}>{title}</h1>
            {summary && <p className={classNames(styles.summary, styles.rv, styles.d2)}>{summary}</p>}
            <ShareRow title={title ?? ''} path={`/letter/${slug}`} className={classNames(styles.rv, styles.d3)} />
          </div>
          {facts.length > 0 && (
            <dl className={classNames(styles.facts, styles.rv, styles.d2)}>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.badge ? <span className={styles.pos}>{fact.value}</span> : fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section ref={letter.ref} className={classNames(styles.letter, ...phase(letter.phase))} aria-label="The letter">
        <div className={styles.wrap}>
          <article className={styles.paper}>
            <Logo logo={props.logo} />
            {props.letterDate && <p className={styles.addr}>{props.letterDate}</p>}
            {(props.addresses ?? []).map((address, i) => (
              <p key={i} className={styles.addr}>
                {address}
              </p>
            ))}
            {props.re && <p className={styles.re}>{props.re}</p>}
            <RichText value={props.body} />
            {props.signOff && <p className={styles.signOff}>{props.signOff}</p>}
            {props.signatureName && <div className={styles.sig}>{props.signatureName}</div>}
            {props.signatureDetails && <p className={classNames(styles.addr, styles.sigDetails)}>{props.signatureDetails}</p>}
          </article>
        </div>
      </section>

      {(related.length > 0 || props.moreLabel) && (
        <section
          ref={more.ref}
          className={classNames(styles.more, ...phase(more.phase))}
          aria-label={props.moreEyebrow || 'Keep Reading'}
        >
          <div className={classNames(styles.wrap, styles.moreStack)}>
            {props.moreEyebrow && (
              <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-black)'} as CSSProperties}>
                {props.moreEyebrow}
              </p>
            )}
            {related.length > 0 && (
              <div className={styles.relGrid}>
                {related.map((card, i) => (
                  <div
                    key={card._key}
                    className={classNames(styles.relCell, styles.rv, DELAYS[Math.min(i, DELAYS.length - 1)])}
                    style={{'--lane': (SWATCH[card.color ?? 'teal'] ?? SWATCH.teal).bg} as CSSProperties}
                  >
                    <LinkAtom
                      anchor={card.link!.anchor}
                      isExternalLink={card.link!.isExternalLink}
                      reference={getReferenceWithSlug(card.link!)}
                      target={card.link!.target}
                      url={card.link!.url}
                      className={styles.rel}
                    >
                      {card.label && <small>{card.label}</small>}
                      <b>{card.title}</b>
                    </LinkAtom>
                  </div>
                ))}
              </div>
            )}
            {props.moreLabel && (
              <div className={styles.rv}>
                <SkewButton variant="black" href={NEWS_PATH} className={styles.button}>
                  {props.moreLabel}
                </SkewButton>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
