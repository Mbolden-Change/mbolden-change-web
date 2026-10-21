import {render, screen} from '@testing-library/react'
import TextMedia from './TextMedia'
import type {TextMedia as TextMediaType} from '@/sanity/types'

jest.mock('@/lib/analytics', () => ({isDonateCta: () => false, trackDonateClick: jest.fn()}))

jest.mock('@/components/SanityNextImage', () => ({__esModule: true, default: () => <img alt="Program photo" />}))
jest.mock('@/components/PortableTextComponent', () => ({__esModule: true, default: () => <p>Body copy</p>}))

const base: TextMediaType = {
  _type: 'textMedia', headline: 'Meeting Basic Needs', textBody: [], media: {},
}

test('renders destination ID, supporting copy', () => {
  render(<TextMedia {...base} sectionId="basic-needs" eyebrow="Economic security" subtitle="With community partners" />)
  expect(screen.getByRole('region', {name: base.headline})).toHaveAttribute('id', 'basic-needs')
  expect(screen.getByText('Economic security')).toBeInTheDocument()
  expect(screen.getByText('With community partners')).toBeInTheDocument()
})

test('renders a video player instead of the image when both are present', () => {
  render(<TextMedia {...base} media={{videoUrl: 'https://www.youtube.com/watch?v=oKOMnSbQLik', image: {_type: 'image', asset: {_type: 'reference', _ref: 'image-test'}}}} />)
  expect(screen.getByTitle('YouTube video player')).toBeInTheDocument()
  expect(screen.queryByAltText('Program photo')).not.toBeInTheDocument()
})


test('renders an image with a Sanity asset reference', () => {
  render(<TextMedia {...base} media={{image: {_type: 'image', asset: {_type: 'reference', _ref: 'image-example-1200x800-jpg'}}}} />)
  expect(screen.getByAltText('Program photo')).toBeInTheDocument()
  expect(screen.queryByTitle('YouTube video player')).not.toBeInTheDocument()
})
