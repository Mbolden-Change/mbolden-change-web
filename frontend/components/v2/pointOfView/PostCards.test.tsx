import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCards from './PostCards'

const cards = Array.from({length: 30}, (_, i) => ({
  slug: `post-${i + 1}`,
  href: `/point-of-view/post-${i + 1}`,
  title: `Post ${i + 1}`,
  date: '2026-11-13T21:03:32.060Z',
  dateLabel: 'November 13, 2026',
  excerpt: `Excerpt ${i + 1}`,
  image: i === 0 ? {src: 'https://substack-post-media.s3.amazonaws.com/public/images/1.jpeg', alt: ''} : undefined,
}))

test('shows 12 posts, then 12 more each time, moving focus to the first new card', async () => {
  const user = userEvent.setup()
  render(<PostCards cards={cards} label="All posts" initialCount={12} />)
  expect(screen.getByRole('region', {name: 'All posts'})).toBeInTheDocument()
  expect(screen.getAllByRole('link')).toHaveLength(12)
  // The whole card is one link, in the same tab.
  const first = screen.getByRole('link', {name: /Post 1 /})
  expect(first).toHaveAttribute('href', '/point-of-view/post-1')
  expect(first).not.toHaveAttribute('target')
  expect(first).toHaveTextContent('November 13, 2026')
  expect(first).toHaveTextContent('Excerpt 1')

  await user.click(screen.getByRole('button', {name: 'Show more'}))
  expect(screen.getAllByRole('link')).toHaveLength(24)
  expect(screen.getByRole('link', {name: /Post 13 /})).toHaveFocus()
  expect(screen.getByRole('status')).toHaveTextContent('Showing 24 of 30 posts')

  await user.click(screen.getByRole('button', {name: 'Show more'}))
  expect(screen.getAllByRole('link')).toHaveLength(30)
  expect(screen.queryByRole('button', {name: 'Show more'})).not.toBeInTheDocument()
})

test('with a heading and no count, every card shows under it', () => {
  render(<PostCards cards={cards.slice(0, 3)} heading="More from Our Point of View" />)
  expect(screen.getByRole('heading', {level: 2, name: 'More from Our Point of View'})).toBeInTheDocument()
  expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
