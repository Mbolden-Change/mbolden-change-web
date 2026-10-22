import {render, screen} from '@testing-library/react'
import FeaturedResources from './FeaturedResources'
import type {ResourceList as ResourceListType} from '@/sanity/types'

jest.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {width: () => builder, auto: () => builder, url: () => 'https://cdn.test/cover.jpg'}
    return builder
  },
  getDimensionsFromRef: () => ({imageWidth: 900, imageHeight: 600}),
}))

const link = (title: string, url: string, target: '_self' | '_blank' = '_self') => ({
  _type: 'internalOrExternalLink' as const,
  title,
  isExternalLink: true,
  url,
  target,
})

const block: ResourceListType = {
  _type: 'resourceList',
  appearance: 'featured',
  eyebrow: 'Resources',
  title: 'Tools and Reports',
  description: 'Intro.',
  groups: [
    {
      _type: 'resourceGroup',
      _key: 'g',
      title: 'Group',
      items: [
        {_key: 'a', _type: 'resourceListItem', title: 'With cover', label: 'Tool', date: '2025', featured: true, color: 'teal',
          cover: {_type: 'image', asset: {_type: 'reference', _ref: 'image-c-900x600-jpg'}, alt: 'Cover alt', credit: 'Photo: Someone'},
          link: link('Try it', '/simulator')},
        {_key: 'b', _type: 'resourceListItem', title: 'Not featured', label: 'Report'},
        {_key: 'c', _type: 'resourceListItem', title: 'No cover', label: 'Scorecard', date: '2026', featured: true, color: 'fuchsia',
          link: link('See it', 'https://example.org/', '_blank')},
      ],
    },
  ],
}

test('shows only featured resources, with links, arrow and credit', () => {
  render(<FeaturedResources {...block} />)
  expect(screen.getAllByRole('heading', {level: 3}).map((h) => h.textContent)).toEqual(['With cover', 'No cover'])
  expect(screen.queryByText('Not featured')).not.toBeInTheDocument()
  expect(screen.getByRole('link', {name: /With cover/})).toHaveAttribute('href', '/simulator')
  expect(screen.getByRole('link', {name: /No cover.*opens in a new tab/})).toHaveAttribute('target', '_blank')
  expect(screen.getByText('Photo: Someone')).toBeInTheDocument()
  expect(screen.getByAltText('Cover alt')).toBeInTheDocument()
})

test('draws an automatic cover with the type word when there is no image', () => {
  const {container} = render(<FeaturedResources {...block} />)
  const cards = container.querySelectorAll('li')
  expect(cards[1].querySelector('img')).toBeNull()
  expect(cards[1].querySelector('svg path')).not.toBeNull()
  expect(cards[1].querySelector('[class*="genWord"]')).toHaveTextContent('Scorecard')
})
