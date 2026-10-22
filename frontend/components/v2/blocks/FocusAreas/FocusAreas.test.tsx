import {render, screen} from '@testing-library/react'
import FocusAreas, {type FocusAreasProps} from './FocusAreas'

const block: FocusAreasProps = {
  _type: 'focusAreas',
  eyebrow: 'Strategic Priorities',
  heading: 'Our Focus Areas',
  page: {_type: 'reference', _ref: 'page-wwt'},
  source: {
    slug: 'what-were-tackling',
    topics: [
      {_key: 'a', title: 'Economic Security', accent: 'teal', card: {label: 'Cash Plus Care', title: 'Meeting Basic Needs', summary: 'One.\n\nTwo.', anchor: 'student-family-safety-net'}},
      {_key: 'b', title: 'Rapid Response', accent: 'yellow', card: {title: 'Responding to Urgent Needs', summary: 'Three.', anchor: 'gateway-fund'}},
    ],
  },
}

test('links each card to its pilot on the source page', () => {
  render(<FocusAreas {...block} />)
  const first = screen.getByRole('link', {name: /Meeting Basic Needs/})
  expect(first).toHaveAttribute('href', '/what-were-tackling#student-family-safety-net')
  expect(first).toHaveTextContent('See it in action ↗')
  expect(screen.getByText('Two.')).toBeInTheDocument()
  expect(screen.getByRole('heading', {level: 3, name: 'Rapid Response'})).toBeInTheDocument()
})

test('renders nothing without source topics', () => {
  const {container} = render(<FocusAreas {...block} source={null} />)
  expect(container).toBeEmptyDOMElement()
})
