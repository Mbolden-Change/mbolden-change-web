import {render, screen} from '@testing-library/react'
import BoltSteps from './BoltSteps'
import type {BoltSteps as BoltStepsType} from '@/sanity/types'

jest.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {width: () => builder, auto: () => builder, url: () => 'https://cdn.test/layer.png'}
    return builder
  },
  getDimensionsFromRef: () => ({imageWidth: 900, imageHeight: 812}),
}))

const layer = {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: 'image-a-900x812-png'}}
const step = (title: string, color: 'teal' | 'yellow' | 'fuchsia', motion: 'listen' | 'build' | 'advocate') => ({
  _key: title,
  _type: 'boltStep' as const,
  title,
  body: `${title} body`,
  color,
  motion,
  backLayer: layer,
  frontLayer: layer,
  alt: `${title} illustration`,
})

const block: BoltStepsType = {
  _type: 'boltSteps',
  eyebrow: 'Our Model',
  title: 'How We Work',
  intro: 'Intro copy.',
  steps: [step('We Listen', 'teal', 'listen'), step('We Build', 'yellow', 'build'), step('We Advocate', 'fuchsia', 'advocate')],
}

test('renders the heading, three steps and described illustrations', () => {
  render(<BoltSteps {...block} />)
  expect(screen.getByRole('region', {name: 'How We Work'})).toBeInTheDocument()
  expect(screen.getAllByRole('heading', {level: 3}).map((h) => h.textContent)).toEqual([
    'We Listen',
    'We Build',
    'We Advocate',
  ])
  expect(screen.getByRole('img', {name: 'We Build illustration'})).toBeInTheDocument()
})

test('colors the bolt and bars from the steps', () => {
  const {container} = render(<BoltSteps {...block} />)
  const section = container.querySelector('section') as HTMLElement
  expect(section.style.getPropertyValue('--step-1')).toBe('var(--brand-aqua-teal)')
  expect(section.style.getPropertyValue('--step-3')).toBe('var(--brand-fuchsia)')
})

test('renders nothing without exactly three steps', () => {
  const {container} = render(<BoltSteps {...block} steps={block.steps.slice(0, 2)} />)
  expect(container).toBeEmptyDOMElement()
})
