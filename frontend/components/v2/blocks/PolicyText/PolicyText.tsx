import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import type {PolicyTable, PolicyText as PolicyTextType} from '@/sanity/types'
import styles from './PolicyText.module.scss'

export type PolicyTextProps = PolicyTextType

/** "2026-10-23" → "October 23, 2026", read as a calendar date in any time zone. */
function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})
}

// Web addresses open in a new tab with ↗; email and phone links don't.
const marks: PortableTextComponents['marks'] = {
  link: ({children, value}) => {
    const href: string | undefined = value?.href
    const newTab = Boolean(href?.startsWith('http'))
    return (
      <a href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
        {children}
        {newTab && (
          <>
            <span aria-hidden="true">{'\u00a0'}↗</span>
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </>
        )}
      </a>
    )
  },
}

const cellComponents: PortableTextComponents = {
  block: {normal: ({children}) => <>{children}</>},
  marks,
}

function Table({headers, rows}: PolicyTable) {
  if (!headers?.length) return null
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row) => (
            <tr key={row._key}>
              {headers.map((header, index) => {
                const text = row.cells?.[index]?.text as PortableTextBlock[] | undefined
                const content = text?.length ? <PortableText value={text} components={cellComponents} /> : null
                // The first column names the row; on phones each cell shows its heading.
                return index === 0 ? (
                  <th key={index} scope="row" data-label={header}>
                    {content}
                  </th>
                ) : (
                  <td key={index} data-label={header}>
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const bodyComponents: PortableTextComponents = {
  types: {
    policyTable: ({value}) => <Table {...(value as PolicyTable)} />,
  },
  block: {
    normal: ({children}) => <p>{children}</p>,
    h2: ({children}) => <h2>{children}</h2>,
    h3: ({children}) => <h3>{children}</h3>,
  },
  list: {
    bullet: ({children}) => <ul>{children}</ul>,
    number: ({children}) => <ol>{children}</ol>,
  },
  marks,
}

/** A long-form policy on cream: title, effective date, then the text in a ~760px column. */
export default function PolicyText({title, effectiveDate, body}: PolicyTextProps) {
  return (
    <section className={styles.wrapper} aria-labelledby="policy-title">
      <article className={styles.inner}>
        <header className={styles.header}>
          <h1 id="policy-title" className={styles.title}>
            {title}
          </h1>
          {effectiveDate && <p className={styles.date}>Effective date: {formatDate(effectiveDate)}</p>}
        </header>
        {body?.length ? (
          <div className={styles.body}>
            <PortableText value={body as PortableTextBlock[]} components={bodyComponents} />
          </div>
        ) : null}
      </article>
    </section>
  )
}
