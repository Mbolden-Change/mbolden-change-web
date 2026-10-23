'use client'

import classNames from 'classnames'
import {useId, useState, type CSSProperties} from 'react'
import type {NewsRecord as NewsRecordType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import {
  ALL_ISSUES,
  KIND_CHIPS,
  KIND_COLOR,
  KIND_LABEL,
  formatRecordDate,
  groupRecord,
  isExternalHref,
  issuesOf,
  type NewsKind,
  type RecordItem,
} from './newsFormat'
import styles from './news.module.scss'

export type NewsRecordProps = NewsRecordType & {items?: RecordItem[] | null}

/** The Full Record: a compact list by year, with type chips and an issue filter. Rows open for details. */
export default function NewsRecord({eyebrow, heading, intro, emptyText, items}: NewsRecordProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const id = useId()
  const [kind, setKind] = useState<string>('all')
  const [issue, setIssue] = useState(ALL_ISSUES)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const all = items ?? []
  if (!heading) return null

  const issues = issuesOf(all)
  const years = groupRecord(all, kind, issue)
  let n = 0

  return (
    <section
      ref={ref}
      className={classNames(styles.record, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.recordStack)}>
        <div className={styles.split}>
          <div className={styles.head}>
            {eyebrow && (
              <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-fuchsia)'} as CSSProperties}>
                {eyebrow}
              </p>
            )}
            <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
          </div>
          {intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{intro}</p>}
        </div>

        <div className={classNames(styles.filters, styles.rv, styles.d2)}>
          <div className={styles.chips} role="group" aria-label="Show by type">
            {KIND_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                className={classNames(styles.chip, kind === chip.value && styles.chipOn, chip.value === 'announcement' && styles.chipDark)}
                style={{'--dot': chip.value === 'all' ? 'transparent' : KIND_COLOR[chip.value]} as CSSProperties}
                aria-pressed={kind === chip.value}
                onClick={() => {
                  setKind(chip.value)
                  setOpen({})
                }}
              >
                <i aria-hidden="true" />
                {chip.label}
              </button>
            ))}
          </div>
          <div className={styles.issues} role="group" aria-labelledby={`${id}-issue`}>
            <span id={`${id}-issue`}>Issue:</span>
            {issues.map((value) => (
              <button
                key={value}
                type="button"
                className={classNames(issue === value && styles.issueOn)}
                aria-pressed={issue === value}
                onClick={() => {
                  setIssue(value)
                  setOpen({})
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className={classNames(styles.ledger, styles.rv, styles.d3)} aria-live="polite">
          {years.map((group) => (
            <div key={group.year}>
              <h3 className={styles.year}>{group.year}</h3>
              <ul className={styles.rows}>
                {group.items.map((item) => {
                  const isOpen = Boolean(open[item._id])
                  const color = KIND_COLOR[item.kind as NewsKind] ?? 'var(--brand-black)'
                  const external = isExternalHref(item.link)
                  const bodyId = `${id}-${item._id}`
                  return (
                    <li
                      key={item._id}
                      className={classNames(styles.row, isOpen && styles.rowOpen)}
                      style={{'--dot': color, animationDelay: `${(n++ * 0.04).toFixed(2)}s`} as CSSProperties}
                    >
                      <button
                        type="button"
                        className={styles.rhead}
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? bodyId : undefined}
                        onClick={() => setOpen((prev) => ({...prev, [item._id]: !prev[item._id]}))}
                      >
                        <span className={styles.rdate}>{formatRecordDate(item.date, item.datePrecision)}</span>
                        <span className={styles.rtype}>
                          <i aria-hidden="true" />
                          {KIND_LABEL[item.kind as NewsKind] ?? ''}
                        </span>
                        <span className={styles.rtitle}>{item.title}</span>
                        <span className={styles.plus} aria-hidden="true">
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div id={bodyId} className={styles.rbody}>
                          {item.summary && <p>{item.summary}</p>}
                          {item.details && <small>{item.details}</small>}
                          {item.link && item.linkLabel && (
                            <a
                              className={styles.ilink}
                              href={item.link}
                              target={external ? '_blank' : undefined}
                              rel={external ? 'noopener noreferrer' : undefined}
                            >
                              {item.linkLabel}
                              {external && <span className={styles.srOnly}> (opens in a new tab)</span>}
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          {years.length === 0 && <p className={styles.empty}>{emptyText || 'Nothing matches that combination yet.'}</p>}
        </div>
      </div>
    </section>
  )
}
