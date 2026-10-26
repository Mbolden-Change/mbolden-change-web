import {isDonatePath, isSitePath, opensInNewTab} from './internalOrExternalLink'

test('recognizes the Donate page, with or without a fund’s link ID', () => {
  expect(isDonatePath('/donate')).toBe(true)
  expect(isDonatePath('/donate#gateway-fund')).toBe(true)
  expect(isDonatePath('/donate?ref=home')).toBe(true)
  expect(isDonatePath('/donations')).toBe(false)
  expect(isDonatePath('https://www.zeffy.com/en-US/donation-form/x')).toBe(false)
})

test('a site path starts with one slash', () => {
  expect(isSitePath('/what-were-tackling#gateway-fund')).toBe(true)
  expect(isSitePath('//example.com')).toBe(false)
  expect(isSitePath('https://www.zeffy.com')).toBe(false)
  expect(isSitePath(undefined)).toBe(false)
})

test('only external links set to a new tab open one, never the Donate page', () => {
  const zeffy = 'https://www.zeffy.com/en-US/organizations/mbolden-change'
  expect(opensInNewTab({isExternalLink: true, target: '_blank', url: zeffy})).toBe(true)
  expect(opensInNewTab({isExternalLink: true, target: '_blank', url: '/donate#gateway-fund'})).toBe(false)
  expect(opensInNewTab({isExternalLink: true, target: '_self', url: zeffy})).toBe(false)
})
