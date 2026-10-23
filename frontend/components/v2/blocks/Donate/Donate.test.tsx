import {fireEvent, render, screen} from '@testing-library/react'
import type {FundCards as FundCardsType} from '@/sanity/types'
import FundCards from './FundCards'
import CampaignBanner from './CampaignBanner'
import {withEmailLinks} from './GivingOptions'
import DonorQuote from './DonorQuote'
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

test('builds donation-form addresses from the form ID', () => {
  expect(zeffyPageUrl({id: 'mbolden-change-rapid-response-campaign'})).toBe(
    'https://www.zeffy.com/en-US/donation-form/mbolden-change-rapid-response-campaign',
  )
  expect(zeffyEmbedSrc({id: 'mbolden-change-rapid-response-campaign'})).toBe(
    'https://www.zeffy.com/embed/donation-form/mbolden-change-rapid-response-campaign',
  )
  expect(zeffyPageUrl({id: '../bad'})).toBeNull()
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
      form: {_type: 'zeffyForm', id: 'the-gateway-fund-legal-access-for-immigrant-youth'},
    },
  ],
}

test('a fund button opens the form in a pop-up only when clicked', () => {
  const {container} = render(<FundCards {...block} />)
  const button = screen.getByRole('button', {name: /Give to the Gateway Fund/})
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

test('the first click after closing opens the pop-up, even if the close event comes late', () => {
  const {container} = render(<FundCards {...block} />)
  const dialog = container.querySelector('dialog')!
  const button = screen.getByRole('button', {name: /Give to the Gateway Fund/})

  fireEvent.click(button)
  // Close without the close event yet, as a browser may deliver it later.
  dialog.removeAttribute('open')
  fireEvent.click(button)
  expect(dialog).toHaveAttribute('open')
  dialog.dispatchEvent(new Event('close'))
  expect(dialog).toHaveAttribute('open')
  expect(container.querySelector('iframe')).not.toBeNull()
})

test('the campaign banner shows nothing while switched off', () => {
  const {container} = render(
    <CampaignBanner _type="campaignBanner" enabled={false} heading="This season, Give Boldly." />,
  )
  expect(container).toBeEmptyDOMElement()
})

test('a banner link to a site path opens in the same tab, its arrow hidden from screen readers', () => {
  render(
    <CampaignBanner
      _type="campaignBanner"
      enabled
      heading="Thank you, San Francisco Foundation."
      text="As lead funder of the Gateway Fund, they’re helping immigrant youth pay the fee to apply for legal protection."
      link={{
        _type: 'internalOrExternalLink',
        title: 'Learn about the Gateway Fund →',
        isExternalLink: true,
        url: '/what-were-tackling#gateway-fund',
        target: '_self',
      }}
    />,
  )
  const link = screen.getByRole('link', {name: 'Learn about the Gateway Fund'})
  expect(link).toHaveAttribute('href', '/what-were-tackling#gateway-fund')
  expect(link).not.toHaveAttribute('target', '_blank')
  expect(screen.getByText('Thank you, San Francisco Foundation.').tagName).toBe('STRONG')
})

test('email addresses in card text become email links with the card subject', () => {
  render(<p>{withEmailLinks('Then email giveboldly@mboldenchange.org with your name.', 'Gift of stock')}</p>)
  expect(screen.getByRole('link', {name: 'giveboldly@mboldenchange.org'})).toHaveAttribute(
    'href',
    'mailto:giveboldly@mboldenchange.org?subject=Gift%20of%20stock',
  )
})

test('the quote is split into timed words, with the whole quote for screen readers', () => {
  const {container} = render(
    <DonorQuote _type="donorQuote" quote="Equity should be the norm" attribution="Jeanne & Roland Chan, donors" />,
  )
  const words = container.querySelectorAll<HTMLElement>('[aria-hidden="true"] > span > span')
  expect([...words].map((word) => word.textContent)).toEqual(['“Equity', 'should', 'be', 'the', 'norm”'])
  expect(words[1].style.getPropertyValue('--word-delay')).toBe('0.14s')
  expect(screen.getByText('“Equity should be the norm”')).toBeInTheDocument()
  expect(screen.getByText('Jeanne & Roland Chan, donors')).toHaveStyle({animationDelay: '0.61s'})
})
