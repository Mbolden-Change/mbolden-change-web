import {render, screen} from '@testing-library/react'
import PilotDialog from './PilotDialog'
import {getPilotImage} from './pilotImage'
import type {TextMedia as TextMediaType} from '@/sanity/types'

jest.mock('@/lib/analytics', () => ({isDonateCta: () => false, trackDonateClick: jest.fn()}))
jest.mock('@/components/PortableTextComponent', () => ({__esModule: true, default: () => <p>Body copy</p>}))
jest.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {width: () => builder, auto: () => builder, url: () => 'https://cdn.test/image.jpg'}
    return builder
  },
  getDimensionsFromRef: (ref: string) => {
    const [width, height] = ref.split('-')[2].split('x').map(Number)
    return {imageWidth: width, imageHeight: height}
  },
}))

const asset = {_type: 'reference' as const, _ref: 'image-abc-2000x1333-jpg'}

test('a portrait crop of a landscape photo uses the portrait layout, focused on the hotspot', () => {
  const image = getPilotImage({
    asset,
    crop: {_type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0.2, right: 0.2},
    hotspot: {_type: 'sanity.imageHotspot', x: 0.5, y: 0.25},
  })
  expect(image?.orientation).toBe('portrait')
  expect(image?.ratio).toBeCloseTo((2000 * 0.6) / 1333)
  expect(image?.focus).toBe('50.0% 25.0%')
})

test('an uncropped landscape photo becomes a banner, centered without a hotspot', () => {
  const image = getPilotImage({asset})
  expect(image?.orientation).toBe('landscape')
  expect(image?.focus).toBe('50.0% 50.0%')
})

const pilot: TextMediaType = {
  _type: 'textMedia',
  appearance: 'pilotDialog',
  sectionId: 'student-family-safety-net',
  headline: 'Student & Family Safety Net',
  displayLine: 'Partnerships can respond to community needs.',
  displayAttribution: 'A Partner, Title, Organization',
  textBody: [],
  ctas: [
    {_type: 'cta', _key: 'a', label: 'Give now', link: 'https://example.org/give'},
    {_type: 'cta', _key: 'b', label: 'No link yet'},
  ],
}

test('renders a closed, labelled dialog whose content is in the HTML', () => {
  const {container} = render(<PilotDialog {...pilot} />)
  const dialog = container.querySelector('dialog#student-family-safety-net')
  expect(dialog).not.toBeNull()
  expect(dialog).not.toHaveAttribute('open')
  expect(dialog).toHaveAttribute('aria-labelledby', 'student-family-safety-net-title')
  expect(screen.getByRole('heading', {hidden: true, name: pilot.headline})).toHaveAttribute(
    'id',
    'student-family-safety-net-title',
  )
})

test('shows the quote with its attribution and hides buttons without a link', () => {
  const {container} = render(<PilotDialog {...pilot} />)
  expect(container.querySelector('blockquote')).toHaveTextContent(pilot.displayLine!)
  expect(container.querySelector('figcaption')).toHaveTextContent('— A Partner, Title, Organization')
  expect(screen.getByText('Give now')).toBeInTheDocument()
  expect(screen.queryByText('No link yet')).not.toBeInTheDocument()
})
