'use client'

import {useState} from 'react'
import Script from 'next/script'
import styles from './LegalProviders.module.scss'

declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, base: string) => void
  }
}

const HANDLER_SRC = 'https://form.jotform.com/s/umd/latest/for-form-embed-handler.js'

/**
 * Jotform's standard iframe embed. Their embed handler sizes the iframe to the
 * form's height, so the form never scrolls inside the page. If the handler
 * can't load, the iframe gets a fixed height and scrolls instead.
 */
export default function JotformEmbed({formId, title}: {formId: string; title: string}) {
  const [fallback, setFallback] = useState(false)
  const id = `JotFormIFrame-${formId}`

  return (
    <>
      <iframe
        id={id}
        title={title}
        className={fallback ? styles.frameFallback : styles.frame}
        src={`https://form.jotform.com/${formId}`}
        allow="geolocation; microphone; camera; fullscreen; payment"
        scrolling={fallback ? 'auto' : 'no'}
      />
      <Script
        src={HANDLER_SRC}
        strategy="afterInteractive"
        // onReady runs on every visit to the page, including after moving
        // between pages, when the script itself has already loaded.
        onReady={() => window.jotformEmbedHandler?.(`iframe[id='${id}']`, 'https://form.jotform.com/')}
        onError={() => setFallback(true)}
      />
    </>
  )
}
