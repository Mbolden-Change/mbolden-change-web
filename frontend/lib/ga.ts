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
/** Fired on window when the tag starts, so GoogleAnalytics can request gtag.js. */
export const GA_START_EVENT = 'mbolden:ga-start'
/** Google's own switch: while true, gtag.js sends nothing for this property. */
const GA_DISABLE_KEY = `ga-disable-${GA_ID}`

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
 * is still being asked. While false nothing goes to Google: the tag isn't
 * loaded, events are dropped and requests to Google are stopped.
 */
export function consentAllowsEvents(): boolean {
  return !hasGpc() && readConsentChoice() !== 'denied' && !needsConsentBanner()
}

/**
 * Stores Accept or Decline. Accept starts the tag if it was waiting for a
 * choice. Decline switches a running tag off and removes its cookies. Global
 * Privacy Control keeps Google Analytics off whatever is chosen.
 */
export function saveConsentChoice(choice: ConsentChoice) {
  writeStored(CONSENT_KEY, choice)
  if (choice === 'denied' || hasGpc()) clearGaCookies()
  if (state === 'waiting') {
    if (consentAllowsEvents()) startGa({debug: debugMode})
    return
  }
  if (state !== 'on') return
  const allowed = consentAllowsEvents()
  setGaDisabled(!allowed)
  window.gtag?.('consent', 'update', allowed ? GRANTED : ALL_DENIED)
}

/** The cookies the Google tag sets: _ga and _ga_<property>. */
export const GA_COOKIES = ['_ga', `_ga_${GA_ID.replace(/^G-/, '')}`]

/**
 * Removes the Google Analytics cookies an earlier visit left behind. A cookie
 * can only be removed with the domain and path it was set with, so every
 * domain from this host up (with and without the leading dot) and every path
 * down to this page is tried.
 */
export function clearGaCookies(hostname?: string, pathname?: string) {
  if (typeof document === 'undefined') return
  try {
    const present = document.cookie.split(';').map((part) => part.split('=')[0].trim())
    if (!GA_COOKIES.some((name) => present.includes(name))) return
    const labels = (hostname ?? window.location.hostname).split('.')
    const domains = ['']
    // Stops before the last label: a cookie can't sit on "org" alone.
    for (let i = 0; i < Math.max(labels.length - 1, 1); i++) {
      const domain = labels.slice(i).join('.')
      domains.push(`; domain=${domain}`, `; domain=.${domain}`)
    }
    const paths = ['/']
    ;(pathname ?? window.location.pathname).split('/').filter(Boolean).reduce((path, segment) => {
      const next = `${path}/${segment}`
      paths.push(next, `${next}/`)
      return next
    }, '')
    for (const name of GA_COOKIES)
      for (const domain of domains)
        for (const path of paths)
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=${path}${domain}`
  } catch {
    // Cookies blocked: there is nothing to remove.
  }
}

const setGaDisabled = (disabled: boolean) => {
  ;(window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = disabled
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
// 'waiting' when it would load, but the visitor hasn't accepted (yet).
let state: 'pending' | 'waiting' | 'on' | 'off' = 'pending'
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
 *
 * Without consent nothing is set up and gtag.js is never requested: with
 * Global Privacy Control on the tag stays off for good, and after Decline or
 * before a choice it waits for Accept.
 */
export function startGa({debug = false}: {debug?: boolean} = {}) {
  if (state === 'on') return
  debugMode = debug
  if (!consentAllowsEvents()) {
    state = hasGpc() ? 'off' : 'waiting'
    queued = []
    // Cookies from before a Decline, or from before the browser's signal was on.
    if (hasGpc() || readConsentChoice() === 'denied') clearGaCookies()
    return
  }
  window.dataLayer = window.dataLayer || []
  // gtag.js reads the `arguments` object itself, so this can't be an arrow function.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  const gtag = window.gtag
  setGaDisabled(false)

  // The tag only starts with consent, so the default is granted, without ad personalization.
  gtag('consent', 'default', GRANTED)
  // Google applies this one by the visitor's location.
  gtag('consent', 'default', {...ALL_DENIED, region: CONSENT_REGIONS, wait_for_update: 500})
  if (readConsentChoice() === 'granted') gtag('consent', 'update', GRANTED)

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
  // GoogleAnalytics requests gtag.js now.
  window.dispatchEvent(new Event(GA_START_EVENT))
}

const GOOGLE_REQUEST =
  /^https:\/\/(?:[a-z0-9-]+\.)*(?:google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|google\.com)\//i

/** The addresses the tag reports to. Stopped outright once consent is withdrawn. */
const GOOGLE_COLLECT =
  /^https:\/\/(?:[a-z0-9-]+\.)*(?:google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|google\.com\/(?:g\/collect|ccm\/|pagead\/|ads\/))/i

/** A request the tag makes after Decline: it is not sent. */
const isStopped = (url: string) => GOOGLE_COLLECT.test(url) && !consentAllowsEvents()

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
 * out whatever is switched on in the admin. After Decline on a page where the
 * tag is already running, its requests are stopped here instead of sent.
 */
function guardAddresses() {
  const nativeBeacon = navigator.sendBeacon?.bind(navigator)
  if (nativeBeacon) {
    navigator.sendBeacon = (url, data) => {
      let target = url
      let body = data
      try {
        // Reported as sent, so the tag doesn't retry another way.
        if (isStopped(String(url))) return true
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
      if (typeof input === 'string' && isStopped(input)) {
        // Answered as if sent, so the tag doesn't retry another way.
        return Promise.resolve(typeof Response === 'function' ? new Response(null, {status: 204}) : (undefined as never))
      }
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
  if (state === 'on' || state === 'waiting') return
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
  if (state !== 'on' || !consentAllowsEvents() || window.location.pathname === lastPath) return
  window.gtag?.('set', readPageAddress())
  send('page_view', {page_title: document.title})
}

/**
 * A Google Analytics event. Parameters never carry personal data. Without
 * consent the event is dropped: never sent, and never kept for later.
 */
export function gaEvent(name: string, params?: GaParams) {
  if (typeof window === 'undefined' || state === 'off' || state === 'waiting') return
  if (!consentAllowsEvents()) return
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
