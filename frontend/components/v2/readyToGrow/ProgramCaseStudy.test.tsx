import {fireEvent, render, screen} from '@testing-library/react'
import ProgramCaseStudy from './ProgramCaseStudy'
import type {ProgramCaseStudyData} from '@/lib/getProgramCaseStudy'

jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn(), getDimensionsFromRef: jest.fn(() => ({}))}))

const base: ProgramCaseStudyData = {
  _id: 'x',
  _type: 'programCaseStudy',
  _createdAt: '',
  _updatedAt: '',
  _rev: '',
  name: 'Youth Cash Transfer',
  slug: {_type: 'slug', current: 'youth-cash-transfer'},
  color: 'teal',
  lane: 'Economic Security',
  pilotYears: '2023–2024',
  summary: 'Monthly cash.',
  cardSummary: 'Card.',
  results: {heading: 'In One School Year', stats: [{_key: 'a', _type: 'stat', value: '100%', label: 'of seniors graduated'}]},
  video: {youtube: 'https://youtu.be/UOt1dy_IkIw', heading: 'Hear From the Evaluator'},
  quotes: {main: {quote: 'It helped me help my mom.', attribution: 'Student'}},
  nextPhase: {
    heading: 'What the Next Phase Needs',
    buttonLabel: 'Fund the Next Phase',
    emailSubject: 'Youth Cash Transfer: next phase',
    pdfSlug: 'youth-cash-transfer-evaluation',
    pdfLabel: 'Download the full evaluation (PDF)',
  },
  contact: {name: 'Sue Sutherland', title: 'Director of Advancement', email: 'sue@mboldenchange.org'},
}

test('renders the template with email, PDF and contact links', () => {
  render(<ProgramCaseStudy {...base} />)
  expect(screen.getByRole('heading', {level: 1, name: 'Youth Cash Transfer'})).toBeInTheDocument()
  expect(screen.getByText('Economic Security · Piloted 2023–2024')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: 'Fund the Next Phase'})).toHaveAttribute(
    'href',
    'mailto:sue@mboldenchange.org?subject=Youth%20Cash%20Transfer%3A%20next%20phase',
  )
  expect(screen.getByRole('link', {name: /Download the full evaluation \(PDF\)/})).toHaveAttribute(
    'href',
    '/reports/youth-cash-transfer-evaluation.pdf',
  )
  expect(screen.getByText('Sue Sutherland').closest('p')).toHaveTextContent(
    'Talk with Sue Sutherland, Director of Advancement, at sue@mboldenchange.org.',
  )
  // The full quote is readable once, not word by word.
  expect(screen.getByText('It helped me help my mom.')).toBeInTheDocument()
})

test('loads YouTube (privacy mode) only after play is pressed', () => {
  const {container} = render(<ProgramCaseStudy {...base} />)
  expect(container.querySelector('iframe')).toBeNull()
  fireEvent.click(screen.getByRole('button', {name: 'Play video: Hear From the Evaluator'}))
  expect(container.querySelector('iframe')?.getAttribute('src')).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/UOt1dy_IkIw/)
})

test('no video section without a YouTube link', () => {
  render(<ProgramCaseStudy {...base} video={undefined} />)
  expect(screen.queryByRole('button', {name: /Play video/})).toBeNull()
})
