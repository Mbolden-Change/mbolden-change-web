import {render, screen} from '@testing-library/react'
import FeaturedIssue from './FeaturedIssue'
import type {FeaturedIssue as FeaturedIssueType} from '@/sanity/types'

// next-sanity's browser build is ESM-only; render blocks as plain paragraphs.
jest.mock('next-sanity', () => ({
  PortableText: ({value}: {value: Array<{_key: string; children: Array<{text: string}>}>}) =>
    value.map((block) => <p key={block._key}>{block.children.map((child) => child.text).join('')}</p>),
}))

const block: FeaturedIssueType = {
  _type: 'featuredIssue',
  eyebrow: 'Why it matters',
  heading: 'Bridging the Gap to Legal Protection',
  color: 'teal',
  stats: [
    {_key: 'a', _type: 'featuredIssueStat', prefix: '$', number: 250, label: 'now required just to apply'},
    {_key: 'b', _type: 'featuredIssueStat', number: 31933, label: 'young people applied', source: 'USCIS, fiscal year 2022'},
    {_key: 'c', _type: 'featuredIssueStat', number: 21, label: 'the age when eligibility ends'},
  ],
  body: [
    {_key: 'p1', _type: 'block', style: 'normal', markDefs: [], children: [{_key: 's', _type: 'span', text: 'First paragraph.', marks: []}]},
    {_key: 'p2', _type: 'block', style: 'normal', markDefs: [], children: [{_key: 's', _type: 'span', text: 'Second paragraph.', marks: []}]},
  ],
}

test('renders the final figures, labels, source and body without waiting for motion', () => {
  render(<FeaturedIssue {...block} />)
  expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Bridging the Gap to Legal Protection')
  expect(screen.getAllByText('$250')).toHaveLength(2)
  expect(screen.getAllByText('31,933')).toHaveLength(2)
  expect(screen.getByText('USCIS, fiscal year 2022')).toBeInTheDocument()
  expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
})

test('sets the lane color class', () => {
  const {container} = render(<FeaturedIssue {...block} color="fuchsia" />)
  expect(container.querySelector('section')?.className).toMatch(/fuchsia/)
})
