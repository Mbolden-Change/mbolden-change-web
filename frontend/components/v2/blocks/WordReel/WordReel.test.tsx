import {fireEvent, render, screen} from '@testing-library/react'
import WordReel from './WordReel'
import type {WordReel as WordReelType} from '@/sanity/types'

const word = (w: string, color: 'teal' | 'yellow' | 'fuchsia' | 'stacked') => ({
  _key: w,
  _type: 'wordReelWord' as const,
  word: w,
  color,
  opening: `${w} opening.`,
  line: `${w} line.`,
})

const block: WordReelType = {
  _type: 'wordReel',
  eyebrow: 'About Us · Who We Are',
  lead: 'We are',
  words: [word('Audacious', 'teal'), word('Honest', 'teal'), word('BOLD', 'stacked')],
}

test('starts on the first word with a tab for every word', () => {
  render(<WordReel {...block} />)
  expect(screen.getAllByRole('button')).toHaveLength(3)
  expect(screen.getByRole('button', {name: 'Audacious'})).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Audacious.')
})

test('a tab jumps to its word and shows its line', () => {
  render(<WordReel {...block} />)
  fireEvent.click(screen.getByRole('button', {name: 'Honest'}))
  expect(screen.getByRole('button', {name: 'Honest'})).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Honest line.').closest('p')).not.toHaveAttribute('aria-hidden', 'true')
  expect(screen.getByText('Audacious line.').closest('p')).toHaveAttribute('aria-hidden', 'true')
})
