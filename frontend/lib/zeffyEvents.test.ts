import {track} from '@vercel/analytics'
import {CONSENT_KEY, resetGaForTests, startGa} from './ga'
import {
  MAIN_FORM_FUND,
  ZEFFY_FUND_ATTR,
  ZEFFY_OPEN_ATTR,
  listenForZeffy,
  resetZeffyEventsForTests,
} from './zeffyEvents'

jest.mock('@vercel/analytics', () => ({track: jest.fn()}))

const ZEFFY = 'https://www.zeffy.com'
const PAYMENT = {type: 'zeffy-embed:step-changed', embedId: 'zeffy-embed-1', step: 'payment'}
const THANK_YOU = {type: 'zeffy-embed:thank-you-page-shown', embedId: 'zeffy-embed-1'}

/** Every event handed to the Google tag, as [name, params]. */
const gaEvents = () =>
  (window.dataLayer ?? [])
    .map((args) => Array.from(args as ArrayLike<unknown>))
    .filter((call) => call[0] === 'event')
    .map((call) => [call[1], call[2]] as [string, Record<string, unknown>])

const setGpc = (value: boolean | undefined) =>
  Object.defineProperty(window.navigator, 'globalPrivacyControl', {value, configurable: true})

const setTimezone = (timeZone: string) =>
  jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({timeZone} as Intl.ResolvedDateTimeFormatOptions)

/** A Zeffy form on the page: an iframe inside the element that names its fund. */
function addForm(fund: string, opening?: number) {
  const holder = document.createElement('div')
  holder.setAttribute(ZEFFY_FUND_ATTR, fund)
  if (opening !== undefined) holder.setAttribute(ZEFFY_OPEN_ATTR, String(opening))
  const frame = document.createElement('iframe')
  holder.appendChild(frame)
  document.body.appendChild(holder)
  return {holder, frame}
}

const post = (frame: HTMLIFrameElement | null, data: unknown, origin = ZEFFY) =>
  window.dispatchEvent(new MessageEvent('message', {data, origin, source: frame?.contentWindow ?? null}))

let stop: () => void

beforeEach(() => {
  resetGaForTests()
  resetZeffyEventsForTests()
  window.dataLayer = undefined
  window.gtag = undefined
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.fetch = jest.fn() as unknown as typeof fetch
  document.body.innerHTML = ''
  setGpc(undefined)
  setTimezone('America/Los_Angeles')
  startGa()
  stop = listenForZeffy()
})

afterEach(() => {
  stop()
  jest.restoreAllMocks()
})

describe('which messages count', () => {
  it('counts the payment step for the main form', () => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    expect(gaEvents().map(([name, params]) => [name, params.fund])).toEqual([['zeffy_payment_step', 'where-needed-most']])
    expect(track).not.toHaveBeenCalled()
  })

  it('counts a completed donation in Google Analytics and Vercel', () => {
    const {frame} = addForm('gateway-fund', 1)
    post(frame, THANK_YOU)
    expect(gaEvents().map(([name, params]) => [name, params.fund])).toEqual([['donation_complete', 'gateway-fund']])
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('Donation Complete', {fund: 'gateway-fund'})
  })

  it('reads a message sent as JSON text', () => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, JSON.stringify(PAYMENT))
    expect(gaEvents().map(([name]) => name)).toEqual(['zeffy_payment_step'])
  })

  it('ignores other steps, other message types and unreadable data', () => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, {type: 'zeffy-embed:step-changed', step: 'amount'})
    post(frame, {type: 'zeffy-embed:connected', embedId: 'zeffy-embed-1'})
    post(frame, {type: 'zeffy-embed:resized', height: 900})
    post(frame, {type: 'zeffy-embed:thank-you-animation-shown'})
    post(frame, 'not json')
    post(frame, null)
    post(frame, 42)
    expect(gaEvents()).toEqual([])
    expect(track).not.toHaveBeenCalled()
  })
})

describe('where a message comes from', () => {
  it.each([
    'https://zeffy.com',
    'https://www.zeffy.com',
    'https://app.zeffy.com',
  ])('accepts %s', (origin) => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT, origin)
    expect(gaEvents()).toHaveLength(1)
  })

  it.each([
    'https://www.mboldenchange.org',
    'https://notzeffy.com',
    'https://zeffy.com.example.org',
    'https://example.org/?zeffy.com',
    'http://www.zeffy.com',
    'null',
    '',
  ])('ignores %s', (origin) => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT, origin)
    post(frame, THANK_YOU, origin)
    expect(gaEvents()).toEqual([])
    expect(track).not.toHaveBeenCalled()
  })

  it('ignores a message from a window that is not one of the Zeffy forms', () => {
    addForm(MAIN_FORM_FUND)
    const stray = document.createElement('iframe')
    document.body.appendChild(stray)
    post(stray, THANK_YOU)
    post(null, THANK_YOU)
    expect(gaEvents()).toEqual([])
    expect(track).not.toHaveBeenCalled()
  })

  it('names the fund of the form that sent the message', () => {
    const main = addForm(MAIN_FORM_FUND)
    const popup = addForm('basic-needs-fund', 1)
    post(popup.frame, PAYMENT)
    post(main.frame, PAYMENT)
    expect(gaEvents().map(([, params]) => params.fund)).toEqual(['basic-needs-fund', 'where-needed-most'])
  })
})

describe('what is sent', () => {
  it('sends the fund and nothing else from the message', () => {
    const {frame} = addForm('gateway-fund', 1)
    const extras = {
      embedId: 'zeffy-embed-1',
      amount: 25000,
      currency: 'usd',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.org',
      fund: 'someone-elses-fund',
      donor: {name: 'Ada Lovelace', address: '1 Main St'},
    }
    post(frame, {...PAYMENT, ...extras})
    post(frame, {...THANK_YOU, ...extras})

    const events = gaEvents()
    expect(events.map(([name]) => name)).toEqual(['zeffy_payment_step', 'donation_complete'])
    for (const [, params] of events) {
      // The page address fields are added to every Google Analytics event.
      expect(Object.keys(params).sort()).toEqual(['fund', 'page_location', 'page_referrer'])
      expect(params.fund).toBe('gateway-fund')
    }
    expect(track).toHaveBeenCalledWith('Donation Complete', {fund: 'gateway-fund'})
    const sent = JSON.stringify([events, (track as jest.Mock).mock.calls])
    for (const secret of ['25000', 'usd', 'Ada', 'Lovelace', 'example.org', 'Main St', 'zeffy-embed-1', 'someone-elses-fund']) {
      expect(sent).not.toContain(secret)
    }
  })
})

describe('once per form open', () => {
  it('counts each step once however often Zeffy repeats it', () => {
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    post(frame, PAYMENT)
    post(frame, THANK_YOU)
    post(frame, THANK_YOU)
    post(frame, PAYMENT)
    expect(gaEvents().map(([name]) => name)).toEqual(['zeffy_payment_step', 'donation_complete'])
    expect(track).toHaveBeenCalledTimes(1)
  })

  it('counts again when the pop-up is opened again', () => {
    const {holder, frame} = addForm('gateway-fund', 1)
    post(frame, PAYMENT)
    post(frame, PAYMENT)
    holder.setAttribute(ZEFFY_OPEN_ATTR, '2')
    post(frame, PAYMENT)
    post(frame, PAYMENT)
    expect(gaEvents().map(([name]) => name)).toEqual(['zeffy_payment_step', 'zeffy_payment_step'])
  })

  it('counts again when the pop-up moves to another fund', () => {
    const {holder, frame} = addForm('gateway-fund', 1)
    post(frame, PAYMENT)
    holder.setAttribute(ZEFFY_FUND_ATTR, 'basic-needs-fund')
    holder.setAttribute(ZEFFY_OPEN_ATTR, '2')
    post(frame, PAYMENT)
    expect(gaEvents().map(([, params]) => params.fund)).toEqual(['gateway-fund', 'basic-needs-fund'])
  })

  it('keeps one listener on the page for several forms', () => {
    const add = jest.spyOn(window, 'addEventListener')
    const stopSecond = listenForZeffy()
    expect(add.mock.calls.filter(([type]) => type === 'message')).toHaveLength(0)
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    expect(gaEvents()).toHaveLength(1)

    // Still listening while one form remains, and not after the last one goes.
    stopSecond()
    stopSecond()
    const other = addForm('gateway-fund', 1)
    post(other.frame, PAYMENT)
    expect(gaEvents()).toHaveLength(2)
    stop()
    const third = addForm('basic-needs-fund', 1)
    post(third.frame, PAYMENT)
    expect(gaEvents()).toHaveLength(2)
  })
})

describe('consent', () => {
  it('sends nothing to Google Analytics with Global Privacy Control on', () => {
    setGpc(true)
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    post(frame, THANK_YOU)
    expect(gaEvents()).toEqual([])
  })

  it('sends nothing to Google Analytics after Decline', () => {
    window.localStorage.setItem(CONSENT_KEY, 'denied')
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    post(frame, THANK_YOU)
    expect(gaEvents()).toEqual([])
  })

  it('sends nothing to Google Analytics while someone who is asked has not answered', () => {
    setTimezone('Europe/Paris')
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    expect(gaEvents()).toEqual([])
  })

  it('sends after Accept', () => {
    setTimezone('Europe/Paris')
    window.localStorage.setItem(CONSENT_KEY, 'granted')
    const {frame} = addForm(MAIN_FORM_FUND)
    post(frame, PAYMENT)
    expect(gaEvents().map(([name]) => name)).toEqual(['zeffy_payment_step'])
  })
})
