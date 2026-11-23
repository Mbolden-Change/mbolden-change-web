import {track} from '@vercel/analytics'
import {GATEWAY_EMAIL_SELECTOR, gatewayEmailLink, trackGatewayEmailClick} from './analytics'
import {CONSENT_KEY, resetGaForTests, startGa} from './ga'

jest.mock('@vercel/analytics', () => ({track: jest.fn()}))

const events = (name: string) =>
  (window.dataLayer ?? [])
    .map((args) => Array.from(args as ArrayLike<unknown>))
    .filter((call) => call[0] === 'event' && call[1] === name)

const setGpc = (value: boolean | undefined) =>
  Object.defineProperty(window.navigator, 'globalPrivacyControl', {value, configurable: true})

const setTimezone = (timeZone: string) =>
  jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({timeZone} as Intl.ResolvedDateTimeFormatOptions)

const link = (html: string) => {
  document.body.innerHTML = html
  return document.body.querySelector('a, button')!
}

beforeEach(() => {
  resetGaForTests()
  window.dataLayer = undefined
  window.gtag = undefined
  window.localStorage.clear()
  window.history.replaceState(null, '', '/legal-providers')
  setGpc(undefined)
  setTimezone('America/Los_Angeles')
})

afterEach(() => jest.restoreAllMocks())

describe('the Gateway Fund email link selector', () => {
  it('matches a link whose href starts with the address', () => {
    expect(GATEWAY_EMAIL_SELECTOR).toBe('a[href^="mailto:gatewayfund@mboldenchange.org" i]')
    const plain = link('<a href="mailto:gatewayfund@mboldenchange.org">gatewayfund@mboldenchange.org</a>')
    expect(gatewayEmailLink(plain)).toBe(plain)
    const withSubject = link('<a href="mailto:gatewayfund@mboldenchange.org?subject=Access%20code">Email us</a>')
    expect(gatewayEmailLink(withSubject)).toBe(withSubject)
    const mixedCase = link('<a href="mailto:GatewayFund@mBOLDenChange.org">Email us</a>')
    expect(gatewayEmailLink(mixedCase)).toBe(mixedCase)
  })

  it('matches a click on something inside the link', () => {
    const anchor = link('<a href="mailto:gatewayfund@mboldenchange.org"><strong>Email</strong></a>')
    expect(gatewayEmailLink(anchor.querySelector('strong'))).toBe(anchor)
  })

  it('ignores every other link and click', () => {
    expect(gatewayEmailLink(link('<a href="mailto:info@mboldenchange.org">Email</a>'))).toBeNull()
    expect(gatewayEmailLink(link('<a href="/legal-providers">gatewayfund@mboldenchange.org</a>'))).toBeNull()
    expect(gatewayEmailLink(link('<a href="https://example.org/?to=mailto:gatewayfund@mboldenchange.org">x</a>'))).toBeNull()
    expect(gatewayEmailLink(link('<button>gatewayfund@mboldenchange.org</button>'))).toBeNull()
    expect(gatewayEmailLink(document)).toBeNull()
    expect(gatewayEmailLink(null)).toBeNull()
  })
})

describe('trackGatewayEmailClick', () => {
  it('sends the page and nothing about the email', () => {
    startGa()
    trackGatewayEmailClick('/legal-providers')
    expect(events('gateway_provider_email')).toHaveLength(1)
    // page_location and page_referrer are the cleaned addresses every event carries.
    expect(events('gateway_provider_email')[0][2]).toEqual({
      page: '/legal-providers',
      page_location: 'http://localhost/legal-providers',
      page_referrer: '',
    })
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('Gateway Email Click', {page: '/legal-providers'})
    expect(JSON.stringify([events('gateway_provider_email'), (track as jest.Mock).mock.calls])).not.toMatch(
      /gatewayfund|mailto|subject|@/i,
    )
  })

  it('sends nothing to Google after Decline', () => {
    window.localStorage.setItem(CONSENT_KEY, 'denied')
    startGa()
    trackGatewayEmailClick('/legal-providers')
    expect(events('gateway_provider_email')).toHaveLength(0)
    // Vercel Web Analytics is cookieless and gets the click whatever the consent state.
    expect(track).toHaveBeenCalledWith('Gateway Email Click', {page: '/legal-providers'})
  })

  it('sends nothing to Google with Global Privacy Control on, even after Accept', () => {
    setGpc(true)
    window.localStorage.setItem(CONSENT_KEY, 'granted')
    startGa()
    trackGatewayEmailClick('/legal-providers')
    expect(events('gateway_provider_email')).toHaveLength(0)
    // Vercel Web Analytics is cookieless and gets the click whatever the consent state.
    expect(track).toHaveBeenCalledWith('Gateway Email Click', {page: '/legal-providers'})
  })

  it('sends nothing to Google while a visitor is still being asked, and sends after Accept', () => {
    setTimezone('Europe/Berlin')
    startGa()
    trackGatewayEmailClick('/legal-providers')
    expect(events('gateway_provider_email')).toHaveLength(0)
    // Vercel Web Analytics is cookieless and gets the click whatever the consent state.
    expect(track).toHaveBeenCalledWith('Gateway Email Click', {page: '/legal-providers'})
    window.localStorage.setItem(CONSENT_KEY, 'granted')
    trackGatewayEmailClick('/legal-providers')
    expect(events('gateway_provider_email')).toHaveLength(1)
    expect(track).toHaveBeenCalledTimes(2)
  })
})
