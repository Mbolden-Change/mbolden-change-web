import {render, screen} from '@testing-library/react'
import PointOfView from './PointOfView'

const cards = [
  {key: '1', url: 'https://mboldenchange.substack.com/p/one', title: 'One', summary: 'First', image: {src: 'https://substack-post-media.s3.amazonaws.com/public/images/1.jpeg', alt: 'A photo'}},
  {key: '2', url: 'https://mboldenchange.substack.com/p/two', title: 'Two'},
]

test('renders the cards and button, all opening Substack in a new tab', () => {
  render(<PointOfView _type="pointOfView" eyebrow="Our Point of View" heading="We Said What We Said" intro="Our take." cards={cards} />)
  expect(screen.getByRole('heading', {level: 2, name: 'We Said What We Said'})).toBeInTheDocument()
  expect(screen.getAllByRole('heading', {level: 3}).map((h) => h.textContent)).toEqual(['One', 'Two'])
  expect(screen.getByRole('img', {name: 'A photo'})).toBeInTheDocument()
  // The second card has no cover: a plain color block, no image.
  expect(screen.getAllByRole('img')).toHaveLength(1)
  const links = screen.getAllByRole('link')
  expect(links).toHaveLength(3)
  for (const link of links) {
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  expect(screen.getByRole('link', {name: 'Read more on Substack (opens in a new tab)'})).toHaveAttribute('href', 'https://mboldenchange.substack.com/')
})

test('a post that is on this site opens there in the same tab; any other card still opens in a new tab', () => {
  const mixed = [
    {key: '1', url: 'https://mboldenchange.substack.com/p/one', href: '/point-of-view/one', title: 'One'},
    {key: '2', url: 'https://example.org/elsewhere', title: 'Two'},
  ]
  render(<PointOfView _type="pointOfView" heading="We Said What We Said" cards={mixed} />)
  const onSite = screen.getByRole('link', {name: /One/})
  expect(onSite).toHaveAttribute('href', '/point-of-view/one')
  expect(onSite).not.toHaveAttribute('target')
  expect(onSite).toHaveTextContent('Read the post')
  const external = screen.getByRole('link', {name: /Two/})
  expect(external).toHaveAttribute('href', 'https://example.org/elsewhere')
  expect(external).toHaveAttribute('target', '_blank')
  expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  expect(external).toHaveTextContent('Read on Substack')
})

test('a button pointing to a page on this site is a same-tab link', () => {
  render(<PointOfView _type="pointOfView" heading="We Said What We Said" buttonLabel="See all our posts" buttonUrl="/point-of-view" />)
  const button = screen.getByRole('link', {name: /See all our posts/})
  expect(button).toHaveAttribute('href', '/point-of-view')
  expect(button).not.toHaveAttribute('target')
  expect(button).not.toHaveAccessibleName(/new tab/)
})
