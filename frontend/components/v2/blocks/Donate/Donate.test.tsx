import {act, fireEvent, render, screen} from '@testing-library/react'
import type {FundCards as FundCardsType} from '@/sanity/types'
import FundCards from './FundCards'
import CampaignBanner from './CampaignBanner'
import GivingOptions, {withEmailLinks} from './GivingOptions'
import DonorQuote from './DonorQuote'
import DonateHero from './DonateHero'
import {zeffyEmbedSrc, zeffyPageUrl} from './zeffy'

jest.mock('@/lib/analytics', () => ({trackDonateClick: jest.fn()}))
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

describe('a fund link ID in the address', () => {
  const funds: FundCardsType = {
    _type: 'fundCards',
    heading: 'Choose Where Your Gift Goes',
    funds: [
      {...block.funds[0], linkId: 'gateway-fund'},
      {
        _type: 'fund',
        _key: 'b',
        title: 'The Basic Needs Fund',
        buttonLabel: 'Give to the Basic Needs Fund',
        lane: 'teal',
        form: {_type: 'zeffyForm', id: 'basic-needs-fund-form'},
        linkId: 'basic-needs-fund',
      },
    ],
  }
  const scrollIntoView = jest.fn()

  beforeEach(() => {
    window.history.replaceState(null, '', '/donate')
    window.matchMedia = jest.fn().mockReturnValue({matches: false}) as unknown as typeof window.matchMedia
    Element.prototype.scrollIntoView = scrollIntoView
    scrollIntoView.mockClear()
  })

  const formSrc = (container: HTMLElement) => container.querySelector('iframe')?.getAttribute('src')

  test('opens that fund’s pop-up on arrival, scrolled to the cards', () => {
    window.history.replaceState(null, '', '/donate#basic-needs-fund')
    const {container} = render(<FundCards {...funds} />)
    expect(container.querySelector('dialog')).toHaveAttribute('open')
    expect(screen.getByRole('heading', {level: 2, name: 'The Basic Needs Fund'})).toBeInTheDocument()
    expect(formSrc(container)).toBe('https://www.zeffy.com/embed/donation-form/basic-needs-fund-form')
    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'start'})
    expect(container.querySelector('#basic-needs-fund')).toHaveClass('fund')
  })

  test('scrolls without motion when reduced motion is on', () => {
    window.matchMedia = jest.fn().mockReturnValue({matches: true}) as unknown as typeof window.matchMedia
    window.history.replaceState(null, '', '/donate#gateway-fund')
    render(<FundCards {...funds} />)
    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'auto', block: 'start'})
  })

  test('opens the pop-up when a link on the page changes the address', () => {
    const {container} = render(<FundCards {...funds} />)
    expect(container.querySelector('dialog')).not.toHaveAttribute('open')

    act(() => {
      window.history.pushState(null, '', '/donate#gateway-fund')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(container.querySelector('dialog')).toHaveAttribute('open')
    expect(formSrc(container)).toBe(
      'https://www.zeffy.com/embed/donation-form/the-gateway-fund-legal-access-for-immigrant-youth',
    )
  })

  test('closing drops the link ID without a new history entry and returns focus to the fund’s button', () => {
    window.history.replaceState(null, '', '/donate?ref=home#gateway-fund')
    const {container} = render(<FundCards {...funds} />)
    const entries = window.history.length

    fireEvent.click(screen.getByRole('button', {name: 'Close'}))
    expect(container.querySelector('dialog')).not.toHaveAttribute('open')
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/donate?ref=home')
    expect(window.history.length).toBe(entries)
    expect(screen.getByRole('button', {name: /Give to the Gateway Fund/})).toHaveFocus()
  })

  test.each(['', '#nonsense'])('the address %p opens nothing', (hash) => {
    window.history.replaceState(null, '', `/donate${hash}`)
    const {container} = render(<FundCards {...funds} />)
    expect(container.querySelector('dialog')).not.toHaveAttribute('open')
    expect(container.querySelector('iframe')).toBeNull()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  test('closing a pop-up opened by its button leaves an unrelated address alone', () => {
    window.history.replaceState(null, '', '/donate#top')
    render(<FundCards {...funds} />)
    fireEvent.click(screen.getByRole('button', {name: /Give to the Basic Needs Fund/}))
    fireEvent.click(screen.getByRole('button', {name: 'Close'}))
    expect(window.location.hash).toBe('#top')
  })
})

describe('funds hidden from the Donate page', () => {
  const card = (key: string, title: string, linkId: string, extra: Partial<FundCardsType['funds'][number]> = {}) => ({
    _type: 'fund' as const,
    _key: key,
    title,
    buttonLabel: `Give to ${title}`,
    lane: 'teal' as const,
    form: {_type: 'zeffyForm' as const, id: `${linkId}-form`},
    linkId,
    ...extra,
  })
  const funds: FundCardsType = {
    _type: 'fundCards',
    heading: 'Choose Where Your Gift Goes',
    funds: [
      card('a', 'Where It’s Needed Most', 'where-needed-most'),
      card('b', 'The Gateway Fund', 'gateway-fund', {showOnDonatePage: true}),
      card('c', 'The Basic Needs Fund', 'basic-needs-fund'),
      card('d', 'The Care Access Fund', 'care-access-fund', {showOnDonatePage: false}),
      card('e', 'Stories, Systems, Change', 'stories-systems-change', {showOnDonatePage: false}),
    ],
  }

  beforeEach(() => {
    window.history.replaceState(null, '', '/donate')
    window.matchMedia = jest.fn().mockReturnValue({matches: false}) as unknown as typeof window.matchMedia
    Element.prototype.scrollIntoView = jest.fn()
  })

  test('render no card, and a fund with no value for the switch shows', () => {
    const {container} = render(<FundCards {...funds} />)
    const titles = [...container.querySelectorAll('li h3')].map((title) => title.textContent)
    expect(titles).toEqual(['Where It’s Needed Most', 'The Gateway Fund', 'The Basic Needs Fund'])
    expect(screen.queryByText(/Care Access/)).toBeNull()
    expect(screen.queryByText(/Stories, Systems, Change/)).toBeNull()
    expect(container.querySelector('#care-access-fund')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
  })

  test.each([
    ['care-access-fund', 'The Care Access Fund'],
    ['stories-systems-change', 'Stories, Systems, Change'],
  ])('open from #%s on arrival, scrolled to the cards', (linkId, title) => {
    window.history.replaceState(null, '', `/donate#${linkId}`)
    const {container} = render(<FundCards {...funds} />)
    expect(container.querySelector('dialog')).toHaveAttribute('open')
    expect(screen.getByRole('heading', {level: 2, name: title})).toBeInTheDocument()
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      `https://www.zeffy.com/embed/donation-form/${linkId}-form`,
    )
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'start'})
  })

  test('open when the address changes, and closing drops the link ID and focuses the heading', () => {
    const {container} = render(<FundCards {...funds} />)
    act(() => {
      window.history.pushState(null, '', '/donate#care-access-fund')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(container.querySelector('dialog')).toHaveAttribute('open')
    const entries = window.history.length

    fireEvent.click(screen.getByRole('button', {name: 'Close'}))
    expect(container.querySelector('dialog')).not.toHaveAttribute('open')
    expect(container.querySelector('iframe')).toBeNull()
    expect(window.location.hash).toBe('')
    expect(window.history.length).toBe(entries)
    expect(screen.getByRole('heading', {level: 2, name: 'Choose Where Your Gift Goes'})).toHaveFocus()
  })
})

describe('the Candid seal in the Donate hero', () => {
  const hero = {
    _type: 'donateHero' as const,
    heading: 'Give Boldly',
    form: {_type: 'zeffyForm' as const, id: 'power-bold-solutions'},
    badgeText: 'A Four-Star Charity on Charity Navigator. Gifts are tax-deductible.',
  }
  const candidSeal = {
    enabled: true,
    url: 'https://app.candid.org/profile/7036208/mbolden-change-20-4683289/?pkId=339d01ce-5387-423e-bf06-4dafa481b05d',
    sealSrc: 'https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/7036208/svg',
    alt: 'Candid Platinum Seal of Transparency',
  }
  const sealName = 'Candid Platinum Seal of Transparency (opens in a new tab)'

  test('shows with no value for the switch, linked to the Site Settings address in a new tab', () => {
    render(<DonateHero {...hero} candidSeal={candidSeal} />)
    const link = screen.getByRole('link', {name: sealName})
    expect(link).toHaveAttribute('href', candidSeal.url)
    expect(link).toHaveAttribute('target', '_blank')
    const img = screen.getByAltText('Candid Platinum Seal of Transparency')
    expect(img).toHaveAttribute('src', candidSeal.sealSrc)
    expect(img).toHaveAttribute('width')
    expect(img).toHaveAttribute('height')
  })

  test('shows without the Charity Navigator badge, and hides when its own switch is off', () => {
    const {rerender} = render(<DonateHero {...hero} showCharityBadge={false} candidSeal={candidSeal} />)
    expect(screen.getByRole('link', {name: sealName})).toBeInTheDocument()

    rerender(<DonateHero {...hero} showCandidSeal={false} candidSeal={candidSeal} />)
    expect(screen.queryByRole('link', {name: sealName})).toBeNull()
    expect(screen.getByText(hero.badgeText)).toBeInTheDocument()
  })

  test('hides when switched off in Site Settings', () => {
    render(<DonateHero {...hero} candidSeal={{...candidSeal, enabled: false}} />)
    expect(screen.queryByRole('link', {name: sealName})).toBeNull()
  })

  test('disappears, leaving the badge text, when Candid’s image fails to load', () => {
    render(<DonateHero {...hero} candidSeal={candidSeal} />)
    fireEvent.error(screen.getByAltText('Candid Platinum Seal of Transparency'))
    expect(screen.queryByRole('link', {name: sealName})).toBeNull()
    expect(screen.queryByAltText('Candid Platinum Seal of Transparency')).toBeNull()
    expect(screen.getByText(hero.badgeText)).toBeInTheDocument()
  })
})

describe('the Other ways to give link in the Donate hero', () => {
  const hero = {
    _type: 'donateHero' as const,
    heading: 'Give Boldly',
    form: {_type: 'zeffyForm' as const, id: 'power-bold-solutions'},
    badgeText: 'Gifts are tax-deductible.',
  }
  const ways = {_type: 'givingOptions' as const, heading: 'Other Ways to Give', options: []}
  const scrollIntoView = jest.fn()
  const original = Element.prototype.scrollIntoView
  const matchMedia = window.matchMedia
  const reducedMotion = (matches: boolean) => {
    window.matchMedia = jest.fn().mockReturnValue({matches}) as unknown as typeof window.matchMedia
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView
    scrollIntoView.mockClear()
    reducedMotion(false)
  })
  afterEach(() => {
    Element.prototype.scrollIntoView = original
    window.matchMedia = matchMedia
    window.history.replaceState(null, '', '/')
  })

  test('is absent with no link text, or only spaces', () => {
    const {rerender} = render(<DonateHero {...hero} />)
    expect(screen.queryByRole('link', {name: /other ways/i})).toBeNull()
    rerender(<DonateHero {...hero} otherWaysLinkText="   " />)
    expect(screen.getByText(hero.badgeText).nextElementSibling).toBeNull()
  })

  test('follows the badge text and points at the section’s anchor in the same tab', () => {
    render(
      <>
        <DonateHero {...hero} otherWaysLinkText="Other ways to give" />
        <GivingOptions {...ways} />
      </>,
    )
    const link = screen.getByRole('link', {name: 'Other ways to give'})
    expect(link).toHaveAttribute('href', '#other-ways-to-give')
    expect(link).not.toHaveAttribute('target')
    expect(screen.getByText(hero.badgeText).nextElementSibling).toContainElement(link)
    expect(document.getElementById('other-ways-to-give')).toBe(screen.getByRole('region', {name: 'Other Ways to Give'}))
  })

  test('scrolls smoothly to the section, focuses its heading and updates the address', () => {
    render(
      <>
        <DonateHero {...hero} otherWaysLinkText="Other ways to give" />
        <GivingOptions {...ways} />
      </>,
    )
    fireEvent.click(screen.getByRole('link', {name: 'Other ways to give'}))
    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'start'})
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('other-ways-to-give'))
    expect(screen.getByRole('heading', {level: 2, name: 'Other Ways to Give'})).toHaveFocus()
    expect(window.location.hash).toBe('#other-ways-to-give')
  })

  test('jumps without motion when reduced motion is on', () => {
    reducedMotion(true)
    render(
      <>
        <DonateHero {...hero} otherWaysLinkText="Other ways to give" />
        <GivingOptions {...ways} />
      </>,
    )
    fireEvent.click(screen.getByRole('link', {name: 'Other ways to give'}))
    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'auto', block: 'start'})
  })

  test('arriving with the anchor in the address scrolls to the section without motion', () => {
    window.history.replaceState(null, '', '/#other-ways-to-give')
    render(<GivingOptions {...ways} />)
    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'auto', block: 'start'})
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('other-ways-to-give'))
  })

  test('arriving with any other address leaves the page where it is', () => {
    window.history.replaceState(null, '', '/#gateway-fund')
    render(<GivingOptions {...ways} />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
