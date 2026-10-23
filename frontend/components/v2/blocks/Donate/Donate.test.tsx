import {fireEvent, render, screen} from '@testing-library/react'
import type {FundCards as FundCardsType} from '@/sanity/types'
import FundCards from './FundCards'
import CampaignBanner from './CampaignBanner'
import {withEmailLinks} from './GivingOptions'
import {zeffyEmbedSrc, zeffyPageUrl} from './zeffy'

jest.mock('@/lib/analytics', () => ({trackDonateClick: jest.fn()}))

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

test('builds Zeffy addresses from the kind and ID', () => {
  expect(zeffyPageUrl({kind: 'donation-form', id: 'power-bold-solutions'})).toBe(
    'https://www.zeffy.com/en-US/donation-form/power-bold-solutions',
  )
  expect(zeffyEmbedSrc({kind: 'peer-to-peer', id: 'rapid-response'})).toBe(
    'https://www.zeffy.com/embed/peer-to-peer/rapid-response',
  )
  expect(zeffyEmbedSrc({id: 'no-kind'})).toBe('https://www.zeffy.com/embed/donation-form/no-kind')
  expect(zeffyPageUrl({kind: 'donation-form', id: '../bad'})).toBeNull()
})

const block: FundCardsType = {
  _type: 'fundCards',
  heading: 'Choose Where Your Gift Goes',
  funds: [
    {
      _type: 'fund',
      _key: 'a',
      title: 'The Gateway Fund',
      buttonLabel: 'Give to the Gateway Fund',
      lane: 'yellow',
      form: {_type: 'zeffyForm', kind: 'donation-form', id: 'the-gateway-fund-legal-access-for-immigrant-youth'},
    },
  ],
}

test('a fund button links to Zeffy and opens the form in a pop-up only when clicked', () => {
  const {container} = render(<FundCards {...block} />)
  const button = screen.getByRole('link', {name: /Give to the Gateway Fund/})
  expect(button).toHaveAttribute(
    'href',
    'https://www.zeffy.com/en-US/donation-form/the-gateway-fund-legal-access-for-immigrant-youth',
  )
  expect(container.querySelector('iframe')).toBeNull()

  fireEvent.click(button)
  const dialog = container.querySelector('dialog')
  expect(dialog).toHaveAttribute('open')
  expect(screen.getByRole('heading', {level: 2, name: 'The Gateway Fund'})).toBeInTheDocument()
  expect(container.querySelector('iframe')).toHaveAttribute(
    'src',
    'https://www.zeffy.com/embed/donation-form/the-gateway-fund-legal-access-for-immigrant-youth',
  )
  expect(screen.getByRole('link', {name: 'Give on Zeffy'})).toBeInTheDocument()
  expect(document.documentElement.style.overflow).toBe('hidden')

  fireEvent.click(screen.getByRole('button', {name: 'Close'}))
  expect(dialog).not.toHaveAttribute('open')
  expect(container.querySelector('iframe')).toBeNull()
  expect(document.documentElement.style.overflow).toBe('')
  expect(button).toHaveFocus()
})

test('the campaign banner shows nothing while switched off', () => {
  const {container} = render(
    <CampaignBanner _type="campaignBanner" enabled={false} heading="This season, Give Boldly." />,
  )
  expect(container).toBeEmptyDOMElement()
})

test('email addresses in card text become email links with the card subject', () => {
  render(<p>{withEmailLinks('Then email giveboldly@mboldenchange.org with your name.', 'Gift of stock')}</p>)
  expect(screen.getByRole('link', {name: 'giveboldly@mboldenchange.org'})).toHaveAttribute(
    'href',
    'mailto:giveboldly@mboldenchange.org?subject=Gift%20of%20stock',
  )
})
