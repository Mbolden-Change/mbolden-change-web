import {protectEinText, protectEins} from './ein'

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
