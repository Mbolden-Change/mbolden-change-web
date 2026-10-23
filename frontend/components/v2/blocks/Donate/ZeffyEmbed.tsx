'use client'

import {memo, useState} from 'react'
import Script from 'next/script'
import {ZEFFY_IFRAME_ATTRS, ZEFFY_SCRIPT_SRC, zeffyEmbedPath, zeffyEmbedSrc, type ZeffyFormRef} from './zeffy'
import styles from './Donate.module.scss'

// Zeffy's script fills in the embed when it runs. Next.js runs a script only
// once per visit, so after a move between pages it won't run again for a new
// embed: from then on the form goes straight into an iframe.
let scriptHasRun = false

/** The embed placeholder, left alone by React once Zeffy's script fills it in. */
const Placeholder = memo(function Placeholder({path}: {path: string}) {
  return <div data-zeffy-embed data-form-url={path} suppressHydrationWarning />
})

type ZeffyEmbedProps = {
  form?: ZeffyFormRef | null
}

/**
 * Zeffy's own embed, loaded with the page. If the script can't load, the form
 * shows in a plain iframe instead.
 */
export default function ZeffyEmbed({form}: ZeffyEmbedProps) {
  const [useIframe, setUseIframe] = useState(() => scriptHasRun)
  const path = zeffyEmbedPath(form)
  const src = zeffyEmbedSrc(form)
  if (!path || !src) return null

  return (
    <>
      {!useIframe && <Placeholder path={path} />}
      <div data-zeffy-embed-fallback style={{display: useIframe ? 'block' : 'none'}}>
        <div className={styles.fallbackFrame}>
          <iframe
            title="Donation form powered by Zeffy"
            src={useIframe ? src : undefined}
            data-zeffy-embed-src={src}
            {...ZEFFY_IFRAME_ATTRS}
          />
        </div>
      </div>
      {!useIframe && (
        <Script
          src={ZEFFY_SCRIPT_SRC}
          strategy="afterInteractive"
          onReady={() => {
            scriptHasRun = true
          }}
          onError={() => setUseIframe(true)}
        />
      )}
    </>
  )
}
