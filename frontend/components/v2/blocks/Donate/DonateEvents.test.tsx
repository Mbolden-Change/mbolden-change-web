import {act, fireEvent, render, screen} from '@testing-library/react'
import {track} from '@vercel/analytics'
import {resetGaForTests, startGa} from '@/lib/ga'
import {resetZeffyEventsForTests} from '@/lib/zeffyEvents'
import FundCards from './FundCards'
import DonateHero from './DonateHero'

jest.mock('@vercel/analytics', () => ({track: jest.fn()}))
jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn(), getDimensionsFromRef: jest.fn(() => ({}))}))

// jsdom has <dialog> but not showModal() or close().
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

const fund = (key: string, title: string, linkId: string) => ({
  _key: key,
  _type: 'fund' as const,
  title,
  text: 'Text.',
  lane: 'teal' as const,
  form: {_type: 'zeffyForm' as const, id: `${linkId}-form`},
  linkId,
})
const funds = {
  _type: 'fundCards' as const,
  heading: 'Choose Where Your Gift Goes',
  funds: [fund('a', 'The Gateway Fund', 'gateway-fund'), fund('b', 'The Basic Needs Fund', 'basic-needs-fund')],
}
const hero = {
  _type: 'donateHero' as const,
  heading: 'Give Boldly',
  form: {_type: 'zeffyForm' as const, id: 'power-bold-solutions'},
}

/** Google Analytics events from Zeffy's messages, as [name, fund]. */
const zeffyEvents = () =>
  (window.dataLayer ?? [])
    .map((args) => Array.from(args as ArrayLike<unknown>))
    .filter((call) => call[0] === 'event' && (call[1] === 'zeffy_payment_step' || call[1] === 'donation_complete'))
    .map((call) => [call[1], (call[2] as {fund?: string}).fund])

/** A message from the form in this iframe, as Zeffy sends it. A simulation: no payment is made. */
const post = (frame: Element | null, data: unknown) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data,
        origin: 'https://www.zeffy.com',
        source: (frame as HTMLIFrameElement).contentWindow,
      }),
    )
  })

const PAYMENT = {type: 'zeffy-embed:step-changed', embedId: 'zeffy-embed-1', step: 'payment'}
const THANK_YOU = {type: 'zeffy-embed:thank-you-page-shown', embedId: 'zeffy-embed-1'}

beforeEach(() => {
  resetGaForTests()
  resetZeffyEventsForTests()
  window.dataLayer = undefined
  window.localStorage.clear()
  window.fetch = jest.fn() as unknown as typeof fetch
  window.history.replaceState(null, '', '/donate')
  window.matchMedia = jest.fn().mockReturnValue({matches: false}) as unknown as typeof window.matchMedia
  Element.prototype.scrollIntoView = jest.fn()
  startGa()
})

test('the main form reports as where-needed-most and a pop-up as its fund, with one listener', () => {
  const add = jest.spyOn(window, 'addEventListener')
  const {container} = render(
    <>
      <DonateHero {...hero} />
      <FundCards {...funds} />
    </>,
  )
  expect(add.mock.calls.filter(([type]) => type === 'message')).toHaveLength(1)

  fireEvent.click(screen.getByRole('button', {name: /Give to The Gateway Fund/}))
  const popup = container.querySelector('dialog iframe')
  const main = container.querySelector('section[aria-label="Give Boldly"] iframe')
  post(popup, PAYMENT)
  post(main, PAYMENT)
  post(popup, THANK_YOU)
  post(popup, THANK_YOU)

  expect(zeffyEvents()).toEqual([
    ['zeffy_payment_step', 'gateway-fund'],
    ['zeffy_payment_step', 'where-needed-most'],
    ['donation_complete', 'gateway-fund'],
  ])
  // The fund button's own "Donate Click" is the existing event.
  const completed = (track as jest.Mock).mock.calls.filter(([name]) => name === 'Donation Complete')
  expect(completed).toEqual([['Donation Complete', {fund: 'gateway-fund'}]])
})

test('a pop-up reports each step once per opening', () => {
  const {container} = render(<FundCards {...funds} />)
  const open = (name: RegExp) => fireEvent.click(screen.getByRole('button', {name}))
  const frame = () => container.querySelector('dialog iframe')

  open(/Give to The Gateway Fund/)
  post(frame(), PAYMENT)
  post(frame(), PAYMENT)
  fireEvent.click(screen.getByRole('button', {name: 'Close'}))

  open(/Give to The Gateway Fund/)
  post(frame(), PAYMENT)
  fireEvent.click(screen.getByRole('button', {name: 'Close'}))

  open(/Give to The Basic Needs Fund/)
  post(frame(), PAYMENT)

  expect(zeffyEvents()).toEqual([
    ['zeffy_payment_step', 'gateway-fund'],
    ['zeffy_payment_step', 'gateway-fund'],
    ['zeffy_payment_step', 'basic-needs-fund'],
  ])
})
