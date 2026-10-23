'use client'

import classNames from 'classnames'
import Link from 'next/link'
import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {ProgramCaseStudyData} from '@/lib/getProgramCaseStudy'
import {getPilotImage, getYouTubeId, youTubeEmbedUrl} from '../blocks/TextMedia/pilotImage'
import {useScrollReveal} from '../motion/useScrollReveal'
import ContactLine from './ContactLine'
import CountUp from './CountUp'
import {laneVar, mailtoHref, onLaneIsWhite, partnerVar} from './lanes'
import shared from './shared.module.scss'
import styles from './ProgramCaseStudy.module.scss'

/** One section that rises in when scrolled into view. */
function Section({
  className,
  label,
  style,
  children,
}: {
  className?: string
  label: string
  style?: CSSProperties
  children: (phase: ReturnType<typeof useScrollReveal>['phase']) => ReactNode
}) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  return (
    <section
      ref={ref}
      aria-label={label}
      style={style}
      className={classNames(styles.section, className, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
    >
      {children(phase)}
    </section>
  )
}

function Eyebrow({text, bar, className}: {text?: string | null; bar: string; className?: string}) {
  if (!text) return null
  return (
    <p className={classNames(styles.eyebrow, className)} style={{'--bar': bar} as CSSProperties}>
      {text}
    </p>
  )
}

const DELAY = [styles.d1, styles.d2, styles.d3, styles.d4, styles.d5]
const delay = (index: number) => DELAY[Math.min(index, DELAY.length - 1)]

/** Click-to-load video: only our cover shows until someone presses play. */
function CaseVideo({videoId, title, cover}: {videoId: string; title: string; cover: ReturnType<typeof getPilotImage>}) {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  if (playing) {
    return (
      <div ref={frameRef} className={styles.player} role="group" aria-label={title} tabIndex={-1}>
        <iframe
          src={youTubeEmbedUrl(videoId)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={styles.cover}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.src}
          srcSet={cover.srcSet}
          sizes="(min-width: 900px) 640px, 100vw"
          alt={cover.alt}
          style={{objectPosition: cover.focus}}
        />
      ) : (
        <span className={styles.coverPanel} aria-hidden="true" />
      )}
      <button type="button" className={styles.play} onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
        <svg width="24" height="26" viewBox="0 0 22 24" aria-hidden="true">
          <path d="M2 2 L20 12 L2 22 Z" />
        </svg>
      </button>
    </div>
  )
}

/** The case study template at /ready-to-grow/<slug>. */
export default function ProgramCaseStudy(data: ProgramCaseStudyData) {
  const {name, color, lane, pilotYears, summary, glance, results, model, learned, video, quotes, nextPhase, contact} = data
  const accent = laneVar(color)
  const partner = partnerVar(color)
  const white = onLaneIsWhite(color)
  const meta = [lane, pilotYears && `Piloted ${pilotYears}`].filter(Boolean).join(' · ')
  const videoId = getYouTubeId(video?.youtube) ?? (video?.youtube && /^[\w-]{11}$/.test(video.youtube.trim()) ? video.youtube.trim() : null)
  const mainWords = quotes?.main?.quote?.trim().split(/\s+/) ?? []
  const email = contact?.email
  const lanes = {'--lane': accent} as CSSProperties

  return (
    <main id="as-main" className={styles.page} style={lanes}>
      <Section label={name ?? 'Case study'} className={styles.hero}>
        {() => (
          <div className={classNames(styles.wrap, styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <Link href="/ready-to-grow" className={classNames(styles.crumb, styles.rv)}>
                <span aria-hidden="true">←</span> Ready to Grow
              </Link>
              <Eyebrow text={meta} bar={accent} className={classNames(styles.heroEyebrow, styles.rv, styles.d1)} />
              <h1 className={classNames(styles.title, styles.rv, styles.d1)}>{name}</h1>
              {summary && <p className={classNames(styles.summary, styles.rv, styles.d2)}>{summary}</p>}
            </div>
            {glance?.length ? (
              <dl className={classNames(styles.glance, styles.rv, styles.d3)}>
                {glance.map((row) => (
                  <div key={row._key}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        )}
      </Section>

      {results?.heading && (
        <Section label={results.heading} className={classNames(styles.results, white && styles.onDark)}>
          {(phase) => (
            <div className={classNames(styles.wrap, styles.stack)}>
              <div className={styles.head}>
                <Eyebrow text={results.eyebrow} bar={white ? 'var(--brand-white)' : 'var(--brand-black)'} className={styles.rv} />
                <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{results.heading}</h2>
              </div>
              {results.stats?.length ? (
                <div className={classNames(styles.stats, styles.rv, styles.d2)}>
                  {results.stats.map((stat) => (
                    <div key={stat._key} className={styles.stat}>
                      <CountUp value={stat.value} phase={phase} className={styles.statNum} />
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {results.source && <p className={classNames(styles.source, styles.rv, styles.d3)}>{results.source}</p>}
            </div>
          )}
        </Section>
      )}

      {model?.cards?.length ? (
        <Section label={model.heading ?? 'How It Worked'} className={styles.model}>
          {() => (
            <div className={classNames(styles.wrap, styles.stack)}>
              <div className={styles.split}>
                <div className={styles.head}>
                  <Eyebrow text={model.eyebrow} bar="var(--brand-fuchsia)" className={styles.rv} />
                  <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{model.heading}</h2>
                </div>
                {model.intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{model.intro}</p>}
              </div>
              <div className={styles.cards3}>
                {model.cards?.map((card, index) => (
                  <div
                    key={card._key}
                    className={classNames(styles.modelCard, styles.rv, delay(index))}
                    style={{'--card': [accent, partner, 'var(--brand-warm-yellow)'][index % 3]} as CSSProperties}
                  >
                    <h3>{card.heading}</h3>
                    <p>{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      ) : null}

      {learned?.items?.length ? (
        <Section label={learned.heading ?? 'What We Learned'} className={styles.learned}>
          {() => (
            <div className={classNames(styles.wrap, styles.stack)}>
              <div className={styles.head}>
                <Eyebrow text={learned.eyebrow} bar={accent} className={styles.rv} />
                <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{learned.heading}</h2>
              </div>
              <div>
                {learned.items?.map((item, index) => (
                  <div key={item._key} className={classNames(styles.lesson, styles.rv, delay(index))}>
                    <h3>{index === 0 ? <span className={styles.mark}>{item.heading}</span> : item.heading}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      ) : null}

      {videoId && (
        <Section label={video?.heading ?? 'Video'} className={styles.video}>
          {() => (
            <div className={classNames(styles.wrap, styles.videoGrid)}>
              <div className={classNames(styles.rv, styles.d1)}>
                <CaseVideo
                  videoId={videoId}
                  title={video?.heading || name || 'Video'}
                  cover={getPilotImage(video?.cover)}
                />
              </div>
              <div className={styles.videoCopy}>
                <Eyebrow text={video?.eyebrow} bar="var(--brand-warm-yellow)" className={styles.rv} />
                {video?.heading && <h2 className={classNames(styles.h2, styles.videoTitle, styles.rv, styles.d1)}>{video.heading}</h2>}
                {video?.description && <p className={classNames(styles.rv, styles.d2)}>{video.description}</p>}
                {video?.chapters?.length ? (
                  <ul className={classNames(styles.chapters, styles.rv, styles.d3)} aria-label="Chapters">
                    {video.chapters.map((chapter) => (
                      <li key={chapter._key}>
                        <b>{chapter.time}</b>
                        {chapter.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          )}
        </Section>
      )}

      {mainWords.length > 0 && (
        <Section label={quotes?.eyebrow ?? 'Quotes'} className={styles.quotes}>
          {() => (
            <div className={classNames(styles.wrap, styles.quoteWrap)}>
              <Eyebrow text={quotes?.eyebrow} bar="var(--brand-fuchsia)" className={styles.rv} />
              <figure className={styles.mainQuote}>
                <blockquote>
                  <p>
                    <span className={shared.srOnly}>{quotes?.main?.quote}</span>
                    <span aria-hidden="true">
                      {mainWords.map((word, index) => (
                        <span key={index} className={styles.word} style={{animationDelay: `${(0.3 + index * 0.07).toFixed(2)}s`}}>
                          {word}
                        </span>
                      ))}
                    </span>
                  </p>
                </blockquote>
                {quotes?.main?.attribution && (
                  <figcaption className={classNames(styles.attribution, styles.rv, styles.d4)}>{quotes.main.attribution}</figcaption>
                )}
              </figure>
              {quotes?.short?.length ? (
                <div className={classNames(styles.shortQuotes, styles.rv, styles.d5)}>
                  {quotes.short.map((item) => (
                    <figure key={item._key}>
                      <blockquote>{item.quote}</blockquote>
                      {item.attribution && <figcaption>{item.attribution}</figcaption>}
                    </figure>
                  ))}
                </div>
              ) : null}
              {quotes?.secondary?.quote && (
                <figure className={classNames(styles.secondary, styles.rv, styles.d5)}>
                  <blockquote>{quotes.secondary.quote}</blockquote>
                  {quotes.secondary.attribution && <figcaption>{quotes.secondary.attribution}</figcaption>}
                </figure>
              )}
            </div>
          )}
        </Section>
      )}

      {nextPhase?.heading && (
        <Section label={nextPhase.heading} className={styles.next}>
          {() => (
            <div className={classNames(styles.wrap, styles.stack)}>
              <div className={styles.split}>
                <div className={styles.head}>
                  <Eyebrow text={nextPhase.eyebrow} bar="var(--brand-black)" className={styles.rv} />
                  <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{nextPhase.heading}</h2>
                </div>
                {nextPhase.intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{nextPhase.intro}</p>}
              </div>
              {nextPhase.items?.length ? (
                <div className={styles.cards3}>
                  {nextPhase.items.map((item, index) => (
                    <div key={item._key} className={classNames(styles.needCard, styles.rv, delay(index))}>
                      <span
                        className={styles.needBar}
                        aria-hidden="true"
                        style={{background: [accent, partner, 'var(--brand-black)'][index % 3]}}
                      />
                      <h3>{item.heading}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className={classNames(styles.actions, styles.rv, styles.d4)}>
                {email && nextPhase.buttonLabel && (
                  <SkewButton variant="black" href={mailtoHref(email, nextPhase.emailSubject)} className={styles.button}>
                    {nextPhase.buttonLabel}
                  </SkewButton>
                )}
                {nextPhase.pdfSlug && nextPhase.pdfLabel && (
                  <a
                    className={styles.lineButton}
                    href={`/reports/${nextPhase.pdfSlug}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {nextPhase.pdfLabel}
                    <span className={shared.srOnly}> (opens in a new tab)</span>
                  </a>
                )}
                <ContactLine contact={contact} subject={nextPhase.emailSubject} className={styles.contact} />
              </div>
            </div>
          )}
        </Section>
      )}
    </main>
  )
}
