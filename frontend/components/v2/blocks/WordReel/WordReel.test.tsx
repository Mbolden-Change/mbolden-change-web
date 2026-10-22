import {act, fireEvent, render, screen} from '@testing-library/react'
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

const pressed = () => screen.getAllByRole('button').find((b) => b.getAttribute('aria-pressed') === 'true')?.textContent

// Report every observed element as on screen; `visible` lets a test scroll it away.
let observers: Array<{cb: IntersectionObserverCallback; el?: Element}> = []
function setOnScreen(onScreen: boolean) {
  act(() => {
    observers.forEach(({cb, el}) =>
      cb([{isIntersecting: onScreen, intersectionRatio: onScreen ? 1 : 0, intersectionRect: {height: onScreen ? 800 : 0}, target: el} as unknown as IntersectionObserverEntry], {} as IntersectionObserver),
    )
  })
}

beforeEach(() => {
  observers = []
  jest.useFakeTimers()
  window.matchMedia = jest.fn().mockReturnValue({matches: false}) as unknown as typeof window.matchMedia
  window.IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
    const entry: {cb: IntersectionObserverCallback; el?: Element} = {cb}
    observers.push(entry)
    return {observe: (el: Element) => (entry.el = el), unobserve: jest.fn(), disconnect: jest.fn()}
  }) as unknown as typeof IntersectionObserver
})

afterEach(() => {
  jest.useRealTimers()
})

test('starts on the first word with a tab for every word', () => {
  render(<WordReel {...block} />)
  expect(screen.getAllByRole('button', {pressed: undefined}).filter((b) => b.hasAttribute('aria-pressed'))).toHaveLength(3)
  expect(pressed()).toBe('Audacious')
  expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Audacious.')
})

test('cycles every 2.5s, holds the last word 4s, then loops', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  act(() => jest.advanceTimersByTime(2400))
  expect(pressed()).toBe('Audacious')
  act(() => jest.advanceTimersByTime(200))
  expect(pressed()).toBe('Honest')
  act(() => jest.advanceTimersByTime(2500))
  expect(pressed()).toBe('BOLD')
  act(() => jest.advanceTimersByTime(3900))
  expect(pressed()).toBe('BOLD')
  act(() => jest.advanceTimersByTime(200))
  expect(pressed()).toBe('Audacious')
})

test('a tab shows its word, holds 8s, then cycling resumes from there', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  fireEvent.click(screen.getByRole('button', {name: 'Honest'}))
  expect(pressed()).toBe('Honest')
  expect(screen.getByText('Honest line.').closest('p')).not.toHaveAttribute('aria-hidden', 'true')
  act(() => jest.advanceTimersByTime(7900))
  expect(pressed()).toBe('Honest')
  act(() => jest.advanceTimersByTime(200))
  expect(pressed()).toBe('BOLD')
})

test('pauses while off-screen and resumes with the time left', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  act(() => jest.advanceTimersByTime(1500))
  setOnScreen(false)
  act(() => jest.advanceTimersByTime(10000))
  expect(pressed()).toBe('Audacious')
  setOnScreen(true)
  act(() => jest.advanceTimersByTime(900))
  expect(pressed()).toBe('Audacious')
  act(() => jest.advanceTimersByTime(200))
  expect(pressed()).toBe('Honest')
})

test('uses the per-word and last-word times from Studio', () => {
  render(<WordReel {...block} stepSeconds={1} lastHoldSeconds={2} />)
  setOnScreen(true)
  act(() => jest.advanceTimersByTime(1000))
  expect(pressed()).toBe('Honest')
  act(() => jest.advanceTimersByTime(1000))
  expect(pressed()).toBe('BOLD')
  act(() => jest.advanceTimersByTime(2000))
  expect(pressed()).toBe('Audacious')
})

test('with reduced motion it shows the last word and does not move', () => {
  window.matchMedia = jest.fn().mockReturnValue({matches: true}) as unknown as typeof window.matchMedia
  render(<WordReel {...block} />)
  setOnScreen(true)
  expect(pressed()).toBe('BOLD')
  act(() => jest.advanceTimersByTime(30000))
  expect(pressed()).toBe('BOLD')
})

test('pauses while the browser tab is hidden', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  const setHidden = (hidden: boolean) => {
    Object.defineProperty(document, 'hidden', {configurable: true, get: () => hidden})
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
  }
  act(() => jest.advanceTimersByTime(2000))
  setHidden(true)
  act(() => jest.advanceTimersByTime(10000))
  expect(pressed()).toBe('Audacious')
  setHidden(false)
  act(() => jest.advanceTimersByTime(600))
  expect(pressed()).toBe('Honest')
})

test('pause holds the current word until play, then resumes with the time left', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  act(() => jest.advanceTimersByTime(1000))
  fireEvent.click(screen.getByRole('button', {name: 'Pause the words'}))
  act(() => jest.advanceTimersByTime(30000))
  expect(pressed()).toBe('Audacious')
  fireEvent.click(screen.getByRole('button', {name: 'Play the words'}))
  act(() => jest.advanceTimersByTime(1400))
  expect(pressed()).toBe('Audacious')
  act(() => jest.advanceTimersByTime(200))
  expect(pressed()).toBe('Honest')
})

test('a tab click while paused ends the pause after its 8s hold', () => {
  render(<WordReel {...block} />)
  setOnScreen(true)
  fireEvent.click(screen.getByRole('button', {name: 'Pause the words'}))
  fireEvent.click(screen.getByRole('button', {name: 'Honest'}))
  expect(screen.getByRole('button', {name: 'Pause the words'})).toBeInTheDocument()
  act(() => jest.advanceTimersByTime(8100))
  expect(pressed()).toBe('BOLD')
})

test('no pause button with reduced motion', () => {
  window.matchMedia = jest.fn().mockReturnValue({matches: true}) as unknown as typeof window.matchMedia
  render(<WordReel {...block} />)
  expect(screen.queryByRole('button', {name: /the words/})).toBeNull()
})
