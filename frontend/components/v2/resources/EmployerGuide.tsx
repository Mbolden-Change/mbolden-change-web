'use client'

import classNames from 'classnames'
import Link from 'next/link'
import {useEffect, useId, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {EmployerGuide as EmployerGuideType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './EmployerGuide.module.scss'

/** The query adds the PDF's address. */
export type EmployerGuideData = Omit<EmployerGuideType, 'howToUse'> & {
  howToUse?: NonNullable<EmployerGuideType['howToUse']> & {pdfSlug?: string | null}
}

const COLOR: Record<string, string> = {
  teal: 'var(--brand-aqua-teal)',
  fuchsia: 'var(--brand-fuchsia)',
  yellow: 'var(--brand-warm-yellow)',
}
const COPIED_MS = 1800

function Section({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: ReactNode
}) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  return (
    <section
      ref={ref}
      aria-label={label}
      className={classNames(styles.section, className, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
    >
      {children}
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

/** Copies text, falling back to a hidden text area where the clipboard API isn't available. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** Ticked practices are kept in this browser only, if storage is available. */
function useStoredChecks(storageKey: string) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const loaded = useRef(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved) setDone(JSON.parse(saved))
    } catch {
      // Private mode or blocked storage: start empty.
    }
    loaded.current = true
  }, [storageKey])

  useEffect(() => {
    if (!loaded.current) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(done))
    } catch {
      // Not saved; the checklist still works for this visit.
    }
  }, [done, storageKey])

  return [done, setDone] as const
}

/** Interactive employer guide at /resources/<slug>, such as Beyond Compliance. */
export default function EmployerGuide(guide: EmployerGuideData) {
  const {title, eyebrow, subtitle, intro, howToUse, areasEyebrow, areasHeading, areas = [], warrant, ice, materials} = guide
  const id = useId()
  const [open, setOpen] = useState<Record<number, boolean>>({0: true})
  const [done, setDone] = useStoredChecks(`employer-guide:${guide.slug?.current ?? 'guide'}:practices`)
  const [copied, setCopied] = useState<string | null>(null)
  const copiedTimer = useRef<number | undefined>(undefined)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [showAll, setShowAll] = useState(false)

  useEffect(() => () => window.clearTimeout(copiedTimer.current), [])

  const steps = areas.flatMap((area) => (area.steps ?? []).map((step) => `${area._key}:${step._key}`))
  const total = steps.length
  const doneCount = steps.filter((key) => done[key]).length

  // Warrant checker: any "No" points to an immigration warrant; all "Yes" to a judicial one.
  const questions = warrant?.questions ?? []
  const answered = questions.filter((_, index) => answers[index] !== undefined).length
  const anyNo = questions.some((_, index) => answers[index] === false)
  const allYes = questions.length > 0 && answered === questions.length && !anyNo
  const verdict = anyNo ? warrant?.noVerdict : allYes ? warrant?.yesVerdict : null

  // Red cards: featured languages first (in their set order), all of them on request.
  const languages = materials?.redCards?.languages ?? []
  const featured = languages
    .filter((language) => language.featured)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  const [language, setLanguage] = useState(() => (featured[0] ?? languages[0])?.name ?? '')
  const current = languages.find((item) => item.name === language) ?? featured[0] ?? languages[0]
  const shownLanguages = showAll || !featured.length ? languages : featured
  const redCardsTitle = materials?.redCards?.title?.replace('{count}', String(languages.length))

  // Prints only the ICE card: a copy goes in a print-only container and
  // everything else is hidden while printing (see globals.css).
  const iceCardRef = useRef<HTMLDivElement>(null)
  const printCard = () => {
    const card = iceCardRef.current
    if (!card) return
    const root = document.createElement('div')
    root.id = 'print-root'
    root.appendChild(card.cloneNode(true))
    document.body.appendChild(root)
    document.body.classList.add('print-ice-card')
    const cleanup = () => {
      document.body.classList.remove('print-ice-card')
      root.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
  }

  return (
    <main id="as-main" className={styles.page}>
      <Section label={title ?? 'Guide'} className={styles.hero}>
        <div className={classNames(styles.wrap, styles.heroGrid)}>
          <div className={styles.heroCopy}>
            <Link href="/resources" className={classNames(styles.crumb, styles.rv)}>
              <span aria-hidden="true">←</span> Resources
            </Link>
            <Eyebrow text={eyebrow} bar="var(--brand-aqua-teal)" className={classNames(styles.heroEyebrow, styles.rv, styles.d1)} />
            <h1 className={classNames(styles.title, styles.rv, styles.d1)}>{title}</h1>
            {subtitle && <p className={classNames(styles.subtitle, styles.rv, styles.d1)}>{subtitle}</p>}
            {intro && <p className={classNames(styles.intro, styles.rv, styles.d2)}>{intro}</p>}
          </div>
          {howToUse?.heading && (
            <div className={classNames(styles.howTo, styles.rv, styles.d2)}>
              <h2 className={styles.howToHeading}>{howToUse.heading}</h2>
              {howToUse.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {howToUse.pdfSlug && (
                <a className={styles.lineButton} href={`/reports/${howToUse.pdfSlug}.pdf`} target="_blank" rel="noopener noreferrer">
                  {howToUse.pdfLabel || 'Download the full guide (PDF)'}
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </Section>

      {total > 0 && (
        <div className={styles.progress} role="status" aria-live="polite">
          <div className={classNames(styles.wrap, styles.progressInner)}>
            <span className={styles.progressLabel}>Your progress</span>
            <span className={styles.meter} aria-hidden="true">
              <b style={{width: `${Math.round((doneCount / total) * 100)}%`}} />
            </span>
            <span className={styles.progressCount}>
              {doneCount} of {total} practices in place
            </span>
          </div>
        </div>
      )}

      {areas.length > 0 && (
        <Section label={areasHeading ?? 'Areas'} className={styles.areas}>
          <div className={classNames(styles.wrap, styles.areaList)}>
            <div className={styles.head}>
              <Eyebrow text={areasEyebrow} bar="var(--brand-fuchsia)" className={styles.rv} />
              {areasHeading && <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{areasHeading}</h2>}
            </div>
            {areas.map((area, index) => {
              const isOpen = Boolean(open[index])
              const lane = COLOR[area.color ?? 'teal'] ?? COLOR.teal
              const areaSteps = area.steps ?? []
              const areaDone = areaSteps.filter((step) => done[`${area._key}:${step._key}`]).length
              const bodyId = `${id}-area-${index}`
              return (
                <div
                  key={area._key}
                  className={classNames(styles.area, isOpen && styles.areaOpen)}
                  style={{'--lane': lane, '--ink': area.color === 'yellow' ? 'var(--brand-black)' : lane} as CSSProperties}
                >
                  <h3 className={styles.areaHeading}>
                    <button
                      type="button"
                      className={styles.areaButton}
                      aria-expanded={isOpen}
                      aria-controls={bodyId}
                      onClick={() => setOpen((state) => ({...state, [index]: !state[index]}))}
                    >
                      <span className={styles.areaNum}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.areaTitle}>{area.title}</span>
                      <span className={styles.areaCount}>
                        {areaDone} of {areaSteps.length} in place
                      </span>
                      <span className={styles.chev} aria-hidden="true">
                        +
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={bodyId} className={styles.areaBody}>
                      {areaSteps.map((step) => {
                        const key = `${area._key}:${step._key}`
                        const inputId = `${id}-${key}`
                        return (
                          <div key={step._key} className={styles.stepGroup}>
                            <div className={styles.step}>
                              <input
                                type="checkbox"
                                id={inputId}
                                checked={Boolean(done[key])}
                                onChange={() => setDone((state) => ({...state, [key]: !state[key]}))}
                              />
                              <label htmlFor={inputId}>
                                <b>{step.title}</b>
                                {step.text && <span>{step.text}</span>}
                              </label>
                            </div>
                            {step.sample && (
                              <div className={styles.sample}>
                                {step.sampleLabel && <span className={styles.sampleLabel}>{step.sampleLabel}</span>}
                                <p className={styles.sampleText}>{step.sample}</p>
                                <button
                                  type="button"
                                  className={classNames(styles.copy, copied === key && styles.copyDone)}
                                  onClick={async () => {
                                    const ok = await copyText(step.sample ?? '')
                                    if (!ok) return
                                    setCopied(key)
                                    window.clearTimeout(copiedTimer.current)
                                    copiedTimer.current = window.setTimeout(() => setCopied(null), COPIED_MS)
                                  }}
                                >
                                  {copied === key ? 'Copied' : 'Copy text'}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {warrant?.heading && (
        <Section label={warrant.heading} className={styles.warrant}>
          <div className={classNames(styles.wrap, styles.warrantGrid)}>
            <div className={styles.head}>
              <Eyebrow text={warrant.eyebrow} bar="var(--brand-warm-yellow)" className={styles.rv} />
              <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{warrant.heading}</h2>
              {warrant.intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{warrant.intro}</p>}
              {warrant.note && <p className={classNames(styles.warrantNote, styles.rv, styles.d2)}>{warrant.note}</p>}
            </div>
            <div className={classNames(styles.questions, styles.rv, styles.d2)}>
              {questions.map((question, index) => (
                <div key={index} className={styles.question} role="group" aria-label={question}>
                  <span>{question}</span>
                  <span className={styles.yesNo}>
                    {[true, false].map((value) => (
                      <button
                        key={String(value)}
                        type="button"
                        aria-pressed={answers[index] === value}
                        className={classNames(answers[index] === value && styles.answerOn)}
                        onClick={() => setAnswers((state) => ({...state, [index]: value}))}
                      >
                        {value ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </span>
                </div>
              ))}
              <div aria-live="polite">
                {verdict?.heading && (
                  <p className={classNames(styles.verdict, anyNo ? styles.verdictNo : styles.verdictYes)}>
                    <strong>{verdict.heading}</strong> {verdict.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      {ice?.steps?.length ? (
        <Section label={ice.heading ?? 'ICE card'} className={styles.ice}>
          <div className={classNames(styles.wrap, styles.iceGrid)}>
            <div className={styles.head}>
              <Eyebrow text={ice.eyebrow} bar="var(--brand-black)" className={styles.rv} />
              {ice.heading && <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{ice.heading}</h2>}
              {ice.intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{ice.intro}</p>}
              <div className={classNames(styles.rv, styles.d3)}>
                <SkewButton variant="black" onClick={printCard} className={styles.button}>
                  {ice.buttonLabel || 'Print the card'}
                </SkewButton>
              </div>
            </div>
            <div ref={iceCardRef} className={classNames(styles.iceCard, styles.rv, styles.d2)}>
              {ice.heading && (
                <p className={styles.printTitle} aria-hidden="true">
                  {ice.heading}
                </p>
              )}
              <ol>
                {ice.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </Section>
      ) : null}

      {materials?.heading && (
        <Section label={materials.heading} className={styles.materials}>
          <div className={classNames(styles.wrap, styles.stack)}>
            <div className={classNames(styles.head, styles.materialsHead)}>
              <Eyebrow text={materials.eyebrow} bar="var(--brand-black)" className={styles.rv} />
              <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{materials.heading}</h2>
              {materials.intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{materials.intro}</p>}
            </div>
            {materials.resources?.length ? (
              <div className={styles.materialGrid}>
                {materials.resources.map((resource, index) => (
                  <div key={resource._key} className={classNames(styles.material, styles.rv, index ? styles.d2 : styles.d1)}>
                    <h3 className={styles.materialTitle}>{resource.title}</h3>
                    {resource.text && <p>{resource.text}</p>}
                    {resource.links?.length ? (
                      <span className={styles.downloads}>
                        {resource.links.map((item) => (
                          <a key={item._key} href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.label} <span aria-hidden="true">↓</span>
                            <span className={styles.srOnly}> (opens in a new tab)</span>
                          </a>
                        ))}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {current && (
              <div className={classNames(styles.material, styles.redCards, styles.rv, styles.d3)}>
                <div className={styles.redCardsCopy}>
                  {redCardsTitle && <h3 className={styles.redCardsTitle}>{redCardsTitle}</h3>}
                  {materials.redCards?.text && <p>{materials.redCards.text}</p>}
                  <SkewButton
                    variant="black"
                    href={current.url}
                    target="_blank"
                    className={styles.button}
                    ariaLabel={`Download the red card in ${current.name} (opens in a new tab)`}
                  >
                    Download in {current.name} <span aria-hidden="true">↓</span>
                  </SkewButton>
                </div>
                <div className={styles.languages}>
                  {materials.redCards?.chooseLabel && <span className={styles.chooseLabel}>{materials.redCards.chooseLabel}</span>}
                  <div className={styles.langChips} role="group" aria-label={materials.redCards?.chooseLabel || 'Choose a language'}>
                    {shownLanguages.map((item) => (
                      <button
                        key={item._key}
                        type="button"
                        className={classNames(styles.lang, item.name === current.name && styles.langOn)}
                        aria-pressed={item.name === current.name}
                        onClick={() => setLanguage(item.name)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  {featured.length > 0 && featured.length < languages.length && (
                    <button type="button" className={styles.more} aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>
                      {showAll ? 'Show fewer languages' : `Show all ${languages.length} languages`}
                    </button>
                  )}
                </div>
              </div>
            )}
            {(materials.sourceNote || materials.moreLink?.length) && (
              <p className={classNames(styles.sourceNote, styles.rv)}>
                {materials.sourceNote}{' '}
                {materials.moreLink?.map((item) => (
                  <a key={item._key} href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.label} <span aria-hidden="true">↗</span>
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                ))}
              </p>
            )}
            {materials.disclaimer && (
              <p className={styles.disclaimer}>
                <strong>Disclaimer:</strong> {materials.disclaimer}
              </p>
            )}
          </div>
        </Section>
      )}
    </main>
  )
}
