import {fireEvent, render, screen} from '@testing-library/react'
import PilotDialog from './PilotDialog'
import {getPilotImage} from './pilotImage'
import type {TextMedia as TextMediaType} from '@/sanity/types'

jest.mock('@/lib/analytics', () => ({isDonateCta: () => false, trackDonateClick: jest.fn()}))
jest.mock('@/components/PortableTextComponent', () => ({__esModule: true, default: () => <p>Body copy</p>}))
jest.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {
      width: () => builder,
      fit: () => builder,
      auto: () => builder,
      url: () => 'https://cdn.test/image.jpg',
    }
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

test('shows the supporter note between the story and the buttons only when set', () => {
  const {container, rerender} = render(<PilotDialog {...pilot} />)
  expect(container.querySelector('[class*="supporter"]')).toBeNull()
  rerender(<PilotDialog {...pilot} supportedBy="Supported by a grant from a foundation." />)
  const note = screen.getByText('Supported by a grant from a foundation.')
  const buttons = screen.getByText('Give now')
  expect(note.compareDocumentPosition(buttons) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

test('a funder logo links to the funder in a new tab, named by its alt text', () => {
  render(
    <PilotDialog
      {...pilot}
      supportedBy="Supported by a grant from a foundation."
      supportedByLogo={{_type: 'image', asset: {_type: 'reference', _ref: 'image-logo-1000x250-png'}, alt: 'A Foundation'}}
      supportedByLink="https://example.org"
    />,
  )
  const link = screen.getByRole('link', {hidden: true, name: 'A Foundation'})
  expect(link).toHaveAttribute('href', 'https://example.org')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  const logo = link.querySelector('img')
  expect(logo).toHaveAttribute('width', '180')
  expect(logo).toHaveAttribute('height', '45')
  expect(screen.getByText('Supported by a grant from a foundation.')).toBeInTheDocument()
})

test('without a logo the supporter note stays a single line of text', () => {
  const {container} = render(<PilotDialog {...pilot} supportedBy="Supported by a foundation." />)
  const note = container.querySelector('[class*="supporter"]')
  expect(note?.tagName).toBe('P')
  expect(note).toHaveTextContent('Supported by a foundation.')
  expect(container.querySelector('a[target="_blank"] img')).toBeNull()
})

const MUX_ID = 'CiP7O9em3lzgEir017eprS6j9vVZtWczhsfAF1T7z400Q'

test('a pop-up Mux video plays from Mux after one click, ignoring the YouTube URL', () => {
  const {container} = render(
    <PilotDialog
      {...pilot}
      video={{url: 'https://youtu.be/abc123', muxPlaybackId: MUX_ID, title: 'The Gateway Fund video'}}
    />,
  )
  expect(screen.queryByTestId('mux-player')).toBeNull()
  fireEvent.click(screen.getByRole('button', {hidden: true, name: 'Play video: The Gateway Fund video'}))
  const player = screen.getByTestId('mux-player')
  expect(player).toHaveAttribute('data-playback-id', MUX_ID)
  expect(player).toHaveAttribute('data-video-title', 'The Gateway Fund video')
  expect(container.querySelector('iframe')).toBeNull()
})

test('a pop-up without a Mux playback ID plays the YouTube video as before', () => {
  const {container} = render(<PilotDialog {...pilot} video={{url: 'https://youtu.be/abc123'}} />)
  fireEvent.click(screen.getByRole('button', {hidden: true, name: `Play video: ${pilot.headline}`}))
  expect(screen.queryByTestId('mux-player')).toBeNull()
  expect(container.querySelector('iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0&playsinline=1',
  )
})
