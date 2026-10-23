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
