import {
  CONSENT_KEY,
  CONSENT_REGIONS,
  GA_ID,
  INTERNAL_KEY,
  cleanUrl,
  gaEvent,
  isConsentTimezone,
  resetGaForTests,
  scrubAddresses,
  saveConsentChoice,
  startGa,
  stopGa,
  syncInternalFlag,
  trackPageView,
} from './ga'
import {CODE_PAGES} from './search/codePages'

const calls = () => (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>))
const named = (command: string, name?: string) =>
  calls().filter((call) => call[0] === command && (name === undefined || call[1] === name))

const setGpc = (value: boolean | undefined) =>
  Object.defineProperty(window.navigator, 'globalPrivacyControl', {value, configurable: true})

const setTimezone = (timeZone: string) =>
  jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({timeZone} as Intl.ResolvedDateTimeFormatOptions)

const DENIED = {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'}
const GRANTED = {analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied'}

const nativeFetch = window.fetch
const nativeBeacon = window.navigator.sendBeacon

beforeEach(() => {
  window.fetch = nativeFetch ?? (jest.fn() as unknown as typeof fetch)
  window.navigator.sendBeacon = nativeBeacon
  resetGaForTests()
  window.dataLayer = undefined
  window.gtag = undefined
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  setGpc(undefined)
  setTimezone('America/Los_Angeles')
})

afterEach(() => jest.restoreAllMocks())

describe('cleanUrl', () => {
  it('never sends what someone searched for', () => {
    expect(cleanUrl('https://www.mboldenchange.org/search?q=private+words&group=About')).toBe(
      'https://www.mboldenchange.org/search',
    )
  })

  it('sends no query from /legal-providers or its thank-you page', () => {
    expect(cleanUrl('https://www.mboldenchange.org/legal-providers?x=1&utm_source=a#top')).toBe(
      'https://www.mboldenchange.org/legal-providers',
    )
    expect(cleanUrl('https://www.mboldenchange.org/legal-providers/thank-you?email=a%40b.org')).toBe(
      'https://www.mboldenchange.org/legal-providers/thank-you',
    )
  })

  it('keeps only utm_* and gclid elsewhere', () => {
    expect(
      cleanUrl('https://www.mboldenchange.org/donate?utm_source=google&name=Ana&gclid=abc&internal=1&utm_campaign=grants#gateway-fund'),
    ).toBe('https://www.mboldenchange.org/donate?utm_source=google&gclid=abc&utm_campaign=grants#gateway-fund')
  })

  it('handles a missing or broken address', () => {
    expect(cleanUrl('')).toBe('')
    expect(cleanUrl('not a url')).toBe('')
  })
})

describe('scrubAddresses', () => {
  it('cleans the address and referrer of a hit the tag sends by itself', () => {
    const hit =
      'https://www.google-analytics.com/g/collect?v=2&tid=G-X&dt=Search%20%7C%20mBOLDen&dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dsecret%2520words&dr=https%3A%2F%2Fwww.mboldenchange.org%2Fdonate%3Fname%3DAna%26utm_source%3Dx&en=page_view'
    const cleaned = scrubAddresses(hit)
    expect(cleaned).not.toMatch(/secret|Ana/)
    expect(cleaned).toContain('dl=http%3A%2F%2Flocalhost%2Fsearch&')
    expect(cleaned).toContain('dr=https%3A%2F%2Fwww.mboldenchange.org%2Fdonate%3Futm_source%3Dx&')
    // Everything else is left exactly as it was.
    expect(cleaned).toContain('v=2&tid=G-X&dt=Search%20%7C%20mBOLDen&')
    expect(cleaned.endsWith('&en=page_view')).toBe(true)
  })

  it('cleans each line of a batch', () => {
    const body = 'en=scroll&dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Done\r\nen=click&dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dtwo'
    expect(scrubAddresses(body)).toBe('en=scroll&dl=http%3A%2F%2Flocalhost%2Fsearch\r\nen=click&dl=http%3A%2F%2Flocalhost%2Fsearch')
  })
})

describe('consent', () => {
  it('lists the EEA, the UK and Switzerland', () => {
    expect(CONSENT_REGIONS).toHaveLength(32)
    expect(CONSENT_REGIONS).toEqual(expect.arrayContaining(['DE', 'IS', 'LI', 'NO', 'GB', 'CH']))
    expect(CONSENT_REGIONS).not.toContain('US')
  })

  it('asks visitors in European time zones only', () => {
    expect(isConsentTimezone('Europe/Berlin')).toBe(true)
    expect(isConsentTimezone('Atlantic/Reykjavik')).toBe(true)
    expect(isConsentTimezone('America/Los_Angeles')).toBe(false)
    expect(isConsentTimezone(null)).toBe(false)
  })

  it('starts granted without ad personalization, and denied by region', () => {
    startGa()
    const defaults = named('consent', 'default')
    expect(defaults[0][2]).toEqual(GRANTED)
    expect(defaults[1][2]).toEqual({...DENIED, region: CONSENT_REGIONS, wait_for_update: 500})
    expect(named('consent', 'update')).toHaveLength(0)
  })

  it('sets consent before the tag is configured', () => {
    startGa()
    const order = calls().map((call) => call[0])
    expect(order.indexOf('consent')).toBeLessThan(order.indexOf('js'))
    expect(order.lastIndexOf('consent')).toBeLessThan(order.indexOf('config'))
  })

  it('starts denied for a visitor who is about to be asked, then follows the choice', () => {
    setTimezone('Europe/Berlin')
    startGa()
    expect(named('consent', 'default')[0][2]).toEqual({...DENIED, wait_for_update: 500})
    saveConsentChoice('granted')
    expect(named('consent', 'update')[0][2]).toEqual(GRANTED)
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe('granted')
    saveConsentChoice('denied')
    expect(named('consent', 'update')[1][2]).toEqual(DENIED)
  })

  it('applies a stored choice on the next visit', () => {
    window.localStorage.setItem(CONSENT_KEY, 'denied')
    startGa()
    expect(named('consent', 'update')[0][2]).toEqual(DENIED)
  })

  it('keeps everything denied with Global Privacy Control, whatever was chosen', () => {
    setGpc(true)
    window.localStorage.setItem(CONSENT_KEY, 'granted')
    startGa()
    expect(named('consent', 'default')[0][2]).toEqual({...DENIED, wait_for_update: 500})
    expect(named('consent', 'update')).toHaveLength(0)
    saveConsentChoice('granted')
    expect(named('consent', 'update')[0][2]).toEqual(DENIED)
  })
})

describe('the tag', () => {
  const SETTINGS = {allow_google_signals: false, allow_ad_personalization_signals: false}

  it('is set up without Google signals or ad personalization, before the js command', () => {
    startGa()
    const config = named('config')[0]
    expect(config[1]).toBe(GA_ID)
    expect(config[2]).toEqual(SETTINGS)
    expect(named('set', 'ads_data_redaction')[0][2]).toBe(true)
    expect(named('set', 'url_passthrough')[0][2]).toBe(false)
    // The same settings go in with `set`, for a tag that ignores the page's config.
    const order = calls()
    const settings = order.findIndex((call) => call[0] === 'set' && typeof call[1] === 'object')
    expect(order[settings][1]).toEqual({...SETTINGS, page_location: 'http://localhost/', page_referrer: ''})
    expect(settings).toBeLessThan(order.findIndex((call) => call[0] === 'js'))
  })

  it('turns debug mode on only when asked', () => {
    startGa({debug: true})
    gaEvent('simulator_complete')
    expect(named('event', 'simulator_complete')[0][2]).toMatchObject({debug_mode: true})
    resetGaForTests()
    window.dataLayer = undefined
    startGa()
    gaEvent('simulator_complete')
    expect(named('event', 'simulator_complete')[0][2]).not.toHaveProperty('debug_mode')
  })

  it('marks internal traffic from ?internal=1 until ?internal=0', () => {
    window.history.replaceState(null, '', '/about?internal=1')
    syncInternalFlag()
    expect(window.localStorage.getItem(INTERNAL_KEY)).toBe('1')
    startGa()
    expect(named('config')[0][2]).toMatchObject({traffic_type: 'internal'})
    expect(calls().find((call) => call[0] === 'set' && typeof call[1] === 'object')![1]).toMatchObject({traffic_type: 'internal'})
    window.history.replaceState(null, '', '/about?internal=0')
    syncInternalFlag()
    expect(window.localStorage.getItem(INTERNAL_KEY)).toBeNull()
  })

  it('leaves the page load to the tag and sends one page_view per move between pages', () => {
    window.history.replaceState(null, '', '/search?q=secret')
    startGa()
    // The tag's own page view gets the cleaned address through `set`.
    expect(named('event', 'page_view')).toHaveLength(0)
    expect(calls().find((call) => call[0] === 'set' && typeof call[1] === 'object')![1]).toMatchObject({
      page_location: 'http://localhost/search',
    })

    // Nothing for the page that just loaded, or for its query changing.
    trackPageView()
    window.history.replaceState(null, '', '/search?q=other')
    trackPageView()
    expect(named('event', 'page_view')).toHaveLength(0)

    window.history.pushState(null, '', '/legal-providers?x=1')
    trackPageView()
    trackPageView()
    expect(named('event', 'page_view')).toHaveLength(1)
    expect(named('event', 'page_view')[0][2]).toMatchObject({
      page_location: 'http://localhost/legal-providers',
      page_referrer: 'http://localhost/search',
    })
    expect(JSON.stringify(calls())).not.toMatch(/secret|other|x=1/)
  })

  it('holds events until the tag starts, and drops them when it never does', () => {
    gaEvent('donate_click', {placement: 'header'})
    expect(window.dataLayer).toBeUndefined()
    startGa()
    expect(named('event', 'donate_click')[0][2]).toEqual({
      placement: 'header',
      page_location: 'http://localhost/',
      page_referrer: '',
    })
    const order = calls().map((call) => call[0] === 'event' ? call[1] : call[0])
    expect(order.indexOf('config')).toBeLessThan(order.indexOf('donate_click'))

    resetGaForTests()
    window.dataLayer = undefined
    gaEvent('donate_click', {placement: 'header'})
    stopGa()
    gaEvent('simulator_complete')
    expect(window.dataLayer).toBeUndefined()
  })
})

it('scrubs requests to Google on their way out, and leaves other requests alone', () => {
  const beacon = jest.fn(() => true)
  const fetched = jest.fn(() => Promise.resolve())
  window.navigator.sendBeacon = beacon
  window.fetch = fetched as unknown as typeof fetch
  startGa()
  window.navigator.sendBeacon('https://region1.google-analytics.com/g/collect?v=2&dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dsecret', 'en=scroll&dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dsecret')
  window.fetch('https://www.google-analytics.com/g/collect?dl=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dsecret', {method: 'POST', body: 'dr=http%3A%2F%2Flocalhost%2Fsearch%3Fq%3Dsecret'})
  window.fetch('/api/search-index?dl=keep&q=secret')
  expect(beacon).toHaveBeenCalledWith('https://region1.google-analytics.com/g/collect?v=2&dl=http%3A%2F%2Flocalhost%2Fsearch', 'en=scroll&dl=http%3A%2F%2Flocalhost%2Fsearch')
  expect(fetched).toHaveBeenNthCalledWith(1, 'https://www.google-analytics.com/g/collect?dl=http%3A%2F%2Flocalhost%2Fsearch', {method: 'POST', body: 'dr=http%3A%2F%2Flocalhost%2Fsearch'})
  expect(fetched).toHaveBeenNthCalledWith(2, '/api/search-index?dl=keep&q=secret', undefined)
})

it('keeps the thank-you page out of site search', () => {
  expect(CODE_PAGES.map((page) => page.url)).not.toContain('/legal-providers/thank-you')
})
