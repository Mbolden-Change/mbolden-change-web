import {render, screen} from '@testing-library/react'
import {LinkAtom} from './Link'
import SkewButton from './SkewButton'
import TextMediaCtas from '@/components/v2/blocks/TextMedia/TextMediaCtas'

jest.mock('@/lib/analytics', () => ({isDonateCta: () => true, trackDonateClick: jest.fn()}))

const ZEFFY = 'https://www.zeffy.com/en-US/donation-form/the-gateway-fund-legal-access-for-immigrant-youth'

test('a link to the Donate page stays in the same tab even when set to a new tab', () => {
  render(
    <LinkAtom isExternalLink url="/donate#gateway-fund" target="_blank">
      donate
    </LinkAtom>,
  )
  expect(screen.getByRole('link', {name: 'donate'})).not.toHaveAttribute('target')
})

test('an external Zeffy link set to a new tab still opens one', () => {
  render(
    <LinkAtom isExternalLink url={ZEFFY} target="_blank">
      donate
    </LinkAtom>,
  )
  expect(screen.getByRole('link', {name: 'donate'})).toHaveAttribute('target', '_blank')
})

test('a button with a Donate page address stays in the same tab', () => {
  render(
    <SkewButton href="/donate#basic-needs-fund" target="_blank">
      Give to the Basic Needs Fund
    </SkewButton>,
  )
  const link = screen.getByRole('link', {name: 'Give to the Basic Needs Fund'})
  expect(link).not.toHaveAttribute('target')
  expect(link).not.toHaveAttribute('rel')
})

test('pilot giving buttons open site paths in the same tab and Zeffy in a new tab', () => {
  render(
    <TextMediaCtas
      variant="featured"
      ctas={[
        {_key: 'a', label: 'Give to the Gateway Fund', link: '/donate#gateway-fund'},
        {_key: 'b', label: 'Give on Zeffy', link: ZEFFY},
      ]}
    />,
  )
  expect(screen.getByRole('link', {name: 'Give to the Gateway Fund'})).not.toHaveAttribute('target')
  expect(screen.getByRole('link', {name: 'Give on Zeffy'})).toHaveAttribute('target', '_blank')
})
