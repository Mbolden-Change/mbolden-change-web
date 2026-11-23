'use client'

import {useEffect, useRef, useState} from 'react'
import {usePathname} from 'next/navigation'
import Script from 'next/script'
import {
  GA_ID,
  GA_START_EVENT,
  debugRequested,
  startGa,
  stopGa,
  syncInternalFlag,
  trackPageView,
  type GaEnvironment,
} from '@/lib/ga'

/**
 * The Google tag (Google Analytics 4). Loads on production only. A preview
 * opened with ?ga_debug=1 loads it in debug mode, for DebugView checks; other
 * previews and local development never contact Google.
 *
 * gtag.js is requested only once the tag has started, which takes consent:
 * never with Global Privacy Control on, and not after Decline or before a
 * visitor who is asked has chosen. Accept starts it on the spot.
 */
export default function GoogleAnalytics({environment}: {environment: GaEnvironment}) {
  const pathname = usePathname()
  const decided = useRef(false)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    syncInternalFlag()
    if (decided.current) {
      // Wait a moment so the new page's title is in place.
      const timer = window.setTimeout(trackPageView, 0)
      return () => window.clearTimeout(timer)
    }
    decided.current = true
    const debug = environment === 'preview' && debugRequested()
    if (environment === 'production' || debug) {
      // Consent defaults and settings are queued before gtag.js is requested.
      // Without consent startGa does nothing, and this fires later if the visitor accepts.
      window.addEventListener(GA_START_EVENT, () => setLoad(true), {once: true})
      startGa({debug})
    } else {
      stopGa()
    }
  }, [pathname, environment])

  if (!load) return null
  return <Script id="google-tag" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
}
