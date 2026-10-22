import {render, screen} from '@testing-library/react'
import Timeline from './Timeline'
import type {Timeline as TimelineType} from '@/sanity/types'

const block: TimelineType = {
  _type: 'timeline',
  eyebrow: 'Since 2006',
  heading: 'Our History',
  milestones: [
    {_key: 'a', _type: 'timelineMilestone', year: '2006', title: 'Founded', text: 'We began in a garage.'},
    {_key: 'b', _type: 'timelineMilestone', year: 'Today', title: 'Deepening our impact', text: 'Our work now reaches deeper.'},
  ],
  cta: {_type: 'internalOrExternalLink', isExternalLink: true, url: '/what-were-tackling', title: "See What We're Tackling"},
}

test('renders every milestone in order with the closing button', () => {
  render(<Timeline {...block} />)
  expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
    '2006FoundedWe began in a garage.',
    'TodayDeepening our impactOur work now reaches deeper.',
  ])
  expect(screen.getByRole('link', {name: "See What We're Tackling"})).toHaveAttribute('href', '/what-were-tackling')
})
