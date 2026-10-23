'use client'

import classNames from 'classnames'
import {useEffect, useRef, useState} from 'react'
import {SITE_ORIGIN} from '@/lib/organizationJsonLd'
import styles from './pages.module.scss'

const COPIED_MS = 1800

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

type ShareRowProps = {
  title: string
  /** The page's path on the site, such as /letter/ab-1357. */
  path: string
  pdfUrl?: string | null
  className?: string
}

/** Copy link, Share on LinkedIn, Email and, when a PDF is attached, PDF. */
export default function ShareRow({title, path, pdfUrl, className}: ShareRowProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const url = `${SITE_ORIGIN}${path}`
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const email = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`

  return (
    <div className={classNames(styles.share, className)}>
      <button
        type="button"
        className={classNames(copied && styles.done)}
        onClick={async () => {
          await copyText(url)
          setCopied(true)
          window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
        }}
      >
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
      </button>
      <a href={linkedIn} target="_blank" rel="noopener noreferrer">
        Share on LinkedIn <span aria-hidden="true">↗</span>
        <span className={styles.srOnly}> (opens in a new tab)</span>
      </a>
      <a href={email}>Email</a>
      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          PDF<span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      )}
    </div>
  )
}
