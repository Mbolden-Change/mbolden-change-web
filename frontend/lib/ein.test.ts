import {keepBillNumbersTogether, protectEinText, protectEins} from './ein'

const NBH = '‑'

test('shows EINs with a non-breaking hyphen', () => {
  expect(protectEinText('EIN: 20-4683289')).toBe(`EIN: 20${NBH}4683289`)
  expect(protectEinText('20-4683289')).toBe(`20${NBH}4683289`)
  expect(protectEinText('nonprofit, EIN 20-4683289. Gifts')).toBe(`nonprofit, EIN 20${NBH}4683289. Gifts`)
})

test('leaves other numbers alone', () => {
  for (const text of ['(650) 241-3911', '650-241-3911', '2022–2024', '120-4683289', '20-46832890', '$1,000']) {
    expect(protectEinText(text)).toBe(text)
  }
})

test('protects text throughout fetched content, but not ids or links', () => {
  const content = {
    _id: 'doc-20-4683289',
    organizationInfo: {nonProfitDisclaimer: 'EIN: 20-4683289'},
    content: [
      {_key: 'a', options: [{detail: '20-4683289', url: 'https://example.org/20-4683289'}]},
      {_key: 'b', body: [{children: [{text: 'EIN 20-4683289'}]}], link: {title: 'EIN 20-4683289', href: '/20-4683289'}},
    ],
    count: 3,
    empty: null,
  }
  expect(protectEins(content)).toEqual({
    _id: 'doc-20-4683289',
    organizationInfo: {nonProfitDisclaimer: `EIN: 20${NBH}4683289`},
    content: [
      {_key: 'a', options: [{detail: `20${NBH}4683289`, url: 'https://example.org/20-4683289'}]},
      {_key: 'b', body: [{children: [{text: `EIN 20${NBH}4683289`}]}], link: {title: `EIN 20${NBH}4683289`, href: '/20-4683289'}},
    ],
    count: 3,
    empty: null,
  })
})

test('keeps bill numbers on one line', () => {
  const NBSP = ' '
  expect(keepBillNumbersTogether('Support for SB 33 (Cortese) and AB 1357')).toBe(`Support for SB${NBSP}33 (Cortese) and AB${NBSP}1357`)
  expect(keepBillNumbersTogether('SB 363 (Wiener); ACA 5; H.R. 1; S. 2')).toBe(`SB${NBSP}363 (Wiener); ACA${NBSP}5; H.R.${NBSP}1; S.${NBSP}2`)
  expect(keepBillNumbersTogether('U.S. 5 million, LSB 33, SB, about 4.4 million')).toBe('U.S. 5 million, LSB 33, SB, about 4.4 million')
  expect(protectEins({title: 'AB 1357', link: '/letter/ab-1357', url: 'https://example.org/?q=AB 1357'})).toEqual({
    title: `AB${NBSP}1357`,
    link: '/letter/ab-1357',
    url: 'https://example.org/?q=AB 1357',
  })
})
