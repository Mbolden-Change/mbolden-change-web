import {fireEvent, render, screen} from '@testing-library/react'
import {MoneyWent, Voices} from './CaseStudyExtras'

const payments = {
  heading: 'Where the Money Went',
  items: [
    {_key: 'a', _type: 'payment' as const, date: 'May 11', amount: 500, needs: ['Housing'], use: 'Rent', people: 5},
    {_key: 'b', _type: 'payment' as const, date: 'May 20', amount: 100, needs: ['Food', 'Housing'], use: 'Food and rent', people: 4},
    {_key: 'c', _type: 'payment' as const, date: 'Mar 25', amount: 450, needs: ['Other'], use: 'Funeral costs', people: 1},
  ],
}

test('tallies all payments and the ones meeting a need', () => {
  render(<MoneyWent {...payments} />)
  expect(screen.getByText('3 payments · $1,050 · 10 people')).toBeInTheDocument()
  expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['All', 'Housing', 'Food', 'Other emergencies'])
  fireEvent.click(screen.getByRole('button', {name: 'Housing'}))
  expect(screen.getByText('2 payments included housing')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', {name: 'Other emergencies'}))
  expect(screen.getByText('1 payment included other emergencies')).toBeInTheDocument()
})

test('switches speakers', () => {
  render(
    <Voices
      heading="From the Families"
      items={[
        {_key: '1', _type: 'voice', speaker: 'A mother of two', quote: 'First quote.', note: 'First note.'},
        {_key: '2', _type: 'voice', speaker: 'A grandmother', quote: 'Second quote.', note: 'Translated from Spanish.'},
      ]}
    />,
  )
  expect(screen.getByText('First note.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', {name: /A grandmother/}))
  expect(screen.getByRole('button', {name: /A grandmother/})).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Second quote.')).toBeInTheDocument()
  expect(screen.getByText('Translated from Spanish.')).toBeInTheDocument()
})
