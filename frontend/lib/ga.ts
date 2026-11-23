/**
 * Google Analytics 4 (Google tag) for Google Ad Grants conversion tracking.
 * Loaded by components/GoogleAnalytics.tsx: on production only, or on a
 * preview opened with ?ga_debug=1. Everywhere else nothing here reaches Google.
 * Vercel Web Analytics (lib/analytics.ts, SiteAnalytics) is separate and unchanged.
 */

export const GA_ID = 'G-TRDG8HZE56'

/** The visitor's Accept or Decline, kept in this browser. No cookie. */
export const CONSENT_KEY = 'mbolden_consent'
/** Set by ?internal=1 and cleared by ?internal=0, to mark staff visits. No cookie. */
export const INTERNAL_KEY = 'mbolden_internal'
/** Kept for the tab on a preview, so ?ga_debug=1 lasts across page loads. */
const DEBUG_KEY = 'mbolden_ga_debug'
/** Fired on window by the footer's "Cookie choices" link to reopen the banner. */
export const OPEN_CONSENT_EVENT = 'mbolden:cookie-choices'

export type ConsentChoice = 'granted' | 'denied'
export type GaEnvironment = 'production' | 'preview' | 'other'
type GaParams = Record<string, string | number | boolean>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  interface Navigator {
    globalPrivacyControl?: boolean
  }
}

/** EEA (EU 27 plus Iceland, Liechtenstein and Norway), the UK and Switzerland. */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
]

/** EEA, UK and Swiss time zones whose names don't start with "Europe/". */
const OTHER_CONSENT_TIMEZONES = new Set([
  'Atlantic/Reykjavik',
  'Atlantic/Canary',
  'Atlantic/Madeira',
  'Atlantic/Azores',
  'Arctic/Longyearbyen',
  'Asia/Nicosia',
  'Asia/Famagusta',
  'Africa/Ceuta',
  'America/Cayenne',
  'America/Guadeloupe',
  'America/Martinique',
  'America/Marigot',
  'America/St_Barthelemy',
  'Indian/Reunion',
  'Indian/Mayotte',
  // Older names browsers still report.
  'GB',
  'Eire',
  'Iceland',
  'Portugal',
  'Poland',
])

const ALL_DENIED = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const

/** Ad personalization stays off for everyone, whatever they choose. */
const GRANTED = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'denied',
} as const

// ---- Page addresses -------------------------------------------------------

/** Pages whose whole query string stays out of Google Analytics. */
const NO_QUERY_PATHS = ['/search', '/legal-providers']

const isNoQueryPath = (pathname: string) =>
  NO_QUERY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

/**
 * The address as Google Analytics gets it. /search and /legal-providers lose
 * their whole query string (what someone searched for is never sent). Every
 * other address keeps only utm_* and gclid.
 */
export function cleanUrl(raw: string | null | undefined): string {
  if (!raw) return ''
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return ''
  }
  if (isNoQueryPath(url.pathname)) {
    url.search = ''
    url.hash = ''
    return url.toString()
  }
  const kept = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    const name = key.toLowerCase()
    if (name === 'gclid' || name.startsWith('utm_')) kept.append(key, value)
  })
  url.search = kept.toString()
  return url.toString()
}

// ---- Browser storage ------------------------------------------------------

function readStored(key: string, session = false): string | null {
  try {
    return (session ? window.sessionStorage : window.localStorage).getItem(key)
  } catch {
    // Private mode or blocked storage.
    return null
  }
}

function writeStored(key: string, value: string | null, session = false) {
  try {
    const storage = session ? window.sessionStorage : window.localStorage
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // Not saved; the choice still holds for this page.
  }
}

// ---- Consent --------------------------------------------------------------

/** The browser's Global Privacy Control signal. */
export const hasGpc = () => typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true

export function isConsentTimezone(timezone?: string | null): boolean {
  if (!timezone) return false
  return timezone.startsWith('Europe/') || OTHER_CONSENT_TIMEZONES.has(timezone)
}

function browserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export function readConsentChoice(): ConsentChoice | null {
  const stored = readStored(CONSENT_KEY)
  return stored === 'granted' || stored === 'denied' ? stored : null
}

/** Visitors in EEA, UK and Swiss time zones are asked once. Never with Global Privacy Control on. */
export function needsConsentBanner(): boolean {
  return !hasGpc() && readConsentChoice() === null && isConsentTimezone(browserTimezone())
}

/**
 * False with Global Privacy Control on, after Decline, and for a visitor who
 * is still being asked. For events that must not be sent at all without consent.
 */
export function consentAllowsEvents(): boolean {
  return !hasGpc() && readConsentChoice() !== 'denied' && !needsConsentBanner()
}

/** Stores Accept or Decline and tells the Google tag. Global Privacy Control keeps everything denied. */
export function saveConsentChoice(choice: ConsentChoice) {
  writeStored(CONSENT_KEY, choice)
  if (state !== 'on') return
  window.gtag?.('consent', 'update', choice === 'granted' && !hasGpc() ? GRANTED : ALL_DENIED)
}

// ---- Internal traffic and debug ------------------------------------------

/** ?internal=1 marks this browser as staff; ?internal=0 clears it. */
export function syncInternalFlag() {
  const value = new URLSearchParams(window.location.search).get('internal')
  if (value === '1') writeStored(INTERNAL_KEY, '1')
  else if (value === '0') writeStored(INTERNAL_KEY, null)
  else return
  if (state === 'on') window.gtag?.('set', {traffic_type: isInternal() ? 'internal' : undefined})
}

const isInternal = () => readStored(INTERNAL_KEY) === '1'

/** ?ga_debug=1 on a preview, remembered for the tab. */
export function debugRequested(): boolean {
  if (new URLSearchParams(window.location.search).get('ga_debug') === '1') {
    writeStored(DEBUG_KEY, '1', true)
    return true
  }
  return readStored(DEBUG_KEY, true) === '1'
}

// ---- The tag --------------------------------------------------------------

// 'pending' until GoogleAnalytics decides whether this visit loads the tag.
let state: 'pending' | 'on' | 'off' = 'pending'
let queued: Array<[string, GaParams | undefined]> = []
let debugMode = false
let lastPath: string | null = null
let lastLocation = ''
let lastReferrer = ''

/** Google signals and ad personalization stay off. */
const tagSettings = () => ({
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  ...(isInternal() ? {traffic_type: 'internal'} : {}),
})

/**
 * Sets consent defaults and the tag's settings. Runs before gtag.js is
 * requested, so everything is in place when it loads.
 */
export function startGa({debug = false}: {debug?: boolean} = {}) {
  if (state === 'on') return
  debugMode = debug
  window.dataLayer = window.dataLayer || []
  // gtag.js reads the `arguments` object itself, so this can't be an arrow function.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  const gtag = window.gtag
  const gpc = hasGpc()
  const choice = readConsentChoice()

  // Denied from the start with Global Privacy Control, and for anyone who is
  // about to be asked. Everyone else starts granted, without ad personalization.
  gtag('consent', 'default', gpc || needsConsentBanner() ? {...ALL_DENIED, wait_for_update: 500} : GRANTED)
  // Google applies this one by the visitor's location.
  gtag('consent', 'default', {...ALL_DENIED, region: CONSENT_REGIONS, wait_for_update: 500})
  if (choice && !gpc) gtag('consent', 'update', choice === 'granted' ? GRANTED : ALL_DENIED)

  guardAddresses()
  gtag('set', 'ads_data_redaction', true)
  gtag('set', 'url_passthrough', false)
  state = 'on'
  // The settings and the cleaned address go in with `set`, ahead of the `js`
  // command: the Google tag ignores the `config` on the page (a setting in
  // Google's admin), and only what is set this way reaches the page view it
  // sends when it loads. That page view is the one for this page load, so
  // none is sent from here; trackPageView covers moves between pages.
  gtag('set', {...tagSettings(), ...readPageAddress()})
  gtag('js', new Date())
  gtag('config', GA_ID, tagSettings())

  if (debug) {
    // Zeffy check: shows whether its forms post anything back to the page.
    window.addEventListener('message', (event) => {
      if (!event.origin.includes('zeffy.com')) return
      console.info('[ga_debug] message from', event.origin, JSON.stringify(event.data))
    })
  }

  const waiting = queued
  queued = []
  waiting.forEach(([name, params]) => send(name, params))
}

const GOOGLE_REQUEST =
  /^https:\/\/(?:[a-z0-9-]+\.)*(?:google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|google\.com)\//i

/** Runs the page address (dl) and referrer (dr) of a request to Google through cleanUrl. */
export function scrubAddresses(text: string): string {
  return text.replace(/(^|[?&\r\n])(d[lr])=([^&\r\n]*)/g, (_match, lead: string, key: string, value: string) => {
    let cleaned = ''
    try {
      cleaned = cleanUrl(decodeURIComponent(value))
    } catch {
      // An address that can't be read is sent empty.
    }
    return `${lead}${key}=${encodeURIComponent(cleaned)}`
  })
}

/**
 * The last check before anything leaves for Google. The tag can send hits of
 * its own, with the full address: Enhanced Measurement in Google's admin
 * sends a page view whenever the address changes, such as on a new search.
 * Every request to Google passes through here, so a search query can't go
 * out whatever is switched on in the admin.
 */
function guardAddresses() {
  const nativeBeacon = navigator.sendBeacon?.bind(navigator)
  if (nativeBeacon) {
    navigator.sendBeacon = (url, data) => {
      let target = url
      let body = data
      try {
        if (GOOGLE_REQUEST.test(String(url))) {
          target = scrubAddresses(String(url))
          if (typeof data === 'string') body = scrubAddresses(data)
        }
      } catch {
        target = url
        body = data
      }
      return nativeBeacon(target, body)
    }
  }
  if (typeof window.fetch !== 'function') return
  const nativeFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    let target = input
    let options = init
    try {
      if (typeof input === 'string' && GOOGLE_REQUEST.test(input)) {
        target = scrubAddresses(input)
        if (typeof init?.body === 'string') options = {...init, body: scrubAddresses(init.body)}
      }
    } catch {
      target = input
      options = init
    }
    return nativeFetch(target, options)
  }
}

/** This visit doesn't load the tag: events are dropped. */
export function stopGa() {
  if (state === 'on') return
  state = 'off'
  queued = []
}

/** The cleaned address of this page, with the page before it as the referrer. */
function readPageAddress() {
  lastReferrer = lastLocation || cleanUrl(document.referrer)
  lastLocation = cleanUrl(window.location.href)
  lastPath = window.location.pathname
  return {page_location: lastLocation, page_referrer: lastReferrer}
}

/** Every event carries the cleaned address itself, so the tag never falls back to the full one. */
function send(name: string, params?: GaParams) {
  window.gtag?.('event', name, {
    ...params,
    page_location: lastLocation,
    page_referrer: lastReferrer,
    // Present only in debug: any value, even false, turns DebugView on.
    ...(debugMode ? {debug_mode: true} : {}),
  })
}

/**
 * One page_view per move between pages. The tag sends the page view for a
 * page load itself. A change to the query string alone isn't a new page.
 */
export function trackPageView() {
  if (state !== 'on' || window.location.pathname === lastPath) return
  window.gtag?.('set', readPageAddress())
  send('page_view', {page_title: document.title})
}

/** A Google Analytics event. Parameters never carry personal data. */
export function gaEvent(name: string, params?: GaParams) {
  if (typeof window === 'undefined' || state === 'off') return
  if (state === 'pending') {
    // Sent once the tag starts; dropped if it never does.
    if (queued.length < 20) queued.push([name, params])
    return
  }
  send(name, params)
}

/** For tests. */
export function resetGaForTests() {
  state = 'pending'
  queued = []
  debugMode = false
  lastPath = null
  lastLocation = ''
  lastReferrer = ''
}
