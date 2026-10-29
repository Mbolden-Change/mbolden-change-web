import {act, fireEvent, render, screen} from '@testing-library/react'
import type {Leadership as LeadershipType} from '@/sanity/types'
import LeadershipFeatured from './LeadershipFeatured'
import LeadershipInvite from './LeadershipInvite'

jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn(), getDimensionsFromRef: jest.fn()}))

type Invite = NonNullable<LeadershipType['invite']>

const block = (key: string, text: string, marks: string[] = []) => ({
  _type: 'block' as const,
  _key: key,
  style: 'normal' as const,
  markDefs: [],
  children: [{_type: 'span' as const, _key: `${key}s`, text, marks}],
})

const invite: Invite = {
  buttonLabel: 'Shape the future with us',
  heading: 'Shape the Future with mBOLDen Change',
  body: [block('a', 'We look for people passionate about advancing equity and justice.')],
  closingLine: [
    {
      ...block('c', 'Ready to take action?', ['strong']),
      children: [
        {_type: 'span', _key: 'c1', text: 'Ready to take action?', marks: ['strong']},
        {_type: 'span', _key: 'c2', text: ' Introduce yourself to Minh.', marks: []},
      ],
      markDefs: null,
    },
  ],
  email: 'minh@mboldenchange.org',
  emailSubject: 'Shape the Future with mBOLDen Change',
  sectionId: 'shape-the-future',
}

const leadership: LeadershipType = {
  _type: 'leadership',
  layout: 'featured',
  title: 'Our Leadership',
  people: [{_type: 'person', _key: 'p', name: 'A Person', role: 'Founder'}],
  groups: [
    {
      _type: 'leadershipGroup',
      _key: 'g',
      title: 'Board of Directors',
      people: [{_type: 'person', _key: 'b', name: 'A Member'}],
    },
  ],
}

beforeAll(() => {
  // jsdom has no modal dialogs or media queries.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
})

afterEach(() => window.history.replaceState(null, '', '/'))

const mailto = () => screen.getByRole('link', {hidden: true, name: 'minh@mboldenchange.org'})

test('the email link carries the subject, encoded', () => {
  render(<LeadershipInvite {...invite} />)
  expect(mailto().getAttribute('href')).toBe(
    'mailto:minh@mboldenchange.org?subject=Shape%20the%20Future%20with%20mBOLDen%20Change',
  )
})

test('without a subject the email link is the plain address', () => {
  const {rerender} = render(<LeadershipInvite {...invite} emailSubject={undefined} />)
  expect(mailto().getAttribute('href')).toBe('mailto:minh@mboldenchange.org')
  rerender(<LeadershipInvite {...invite} emailSubject="" />)
  expect(mailto().getAttribute('href')).toBe('mailto:minh@mboldenchange.org')
})

test('the content is in the HTML, in a closed dialog labelled by its heading', () => {
  const {container} = render(<LeadershipInvite {...invite} />)
  const dialog = container.querySelector('dialog#shape-the-future')
  expect(dialog).not.toHaveAttribute('open')
  expect(dialog).toHaveAttribute('aria-labelledby', 'shape-the-future-title')
  expect(screen.getByRole('heading', {hidden: true, name: invite.heading})).toHaveAttribute(
    'id',
    'shape-the-future-title',
  )
  expect(dialog?.querySelector('strong')).toHaveTextContent('Ready to take action?')
})

test('the button opens the dialog and sets the hash; closing returns focus to it', () => {
  const {container} = render(<LeadershipInvite {...invite} />)
  const button = screen.getByRole('button', {name: invite.buttonLabel})
  expect(button).toHaveAttribute('aria-haspopup', 'dialog')
  expect(button).toHaveAttribute('aria-controls', 'shape-the-future')
  fireEvent.click(button)
  const dialog = container.querySelector('dialog')!
  expect(dialog).toHaveAttribute('open')
  expect(window.location.hash).toBe('#shape-the-future')
  fireEvent.click(screen.getByRole('button', {name: 'Close'}))
  expect(dialog).not.toHaveAttribute('open')
  expect(window.location.hash).toBe('')
  expect(button).toHaveFocus()
})

test('the address with the hash opens the dialog on load', () => {
  window.history.replaceState(null, '', '/about#shape-the-future')
  const {container} = render(<LeadershipInvite {...invite} />)
  expect(container.querySelector('dialog')).toHaveAttribute('open')
})

test('Copy puts the address on the clipboard and announces it, without following the link', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined)
  Object.assign(navigator, {clipboard: {writeText}})
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0)
    return 0
  })
  render(<LeadershipInvite {...invite} />)
  const status = screen.getByRole('status', {hidden: true})
  expect(status).toHaveTextContent('')
  await act(async () => {
    fireEvent.click(screen.getByRole('button', {hidden: true, name: /^Copy email address/}))
  })
  expect(writeText).toHaveBeenCalledWith('minh@mboldenchange.org')
  expect(status).toHaveTextContent('Email address copied')
  expect(status).toHaveAttribute('aria-live', 'polite')
})

test('Featured Leadership shows the button after the groups only when the invite has a label', () => {
  const {container, rerender} = render(<LeadershipFeatured {...leadership} />)
  expect(container.querySelector('dialog')).toBeNull()
  expect(screen.queryByRole('button')).toBeNull()

  rerender(<LeadershipFeatured {...leadership} invite={{...invite, buttonLabel: ''}} />)
  expect(container.querySelector('dialog')).toBeNull()

  rerender(<LeadershipFeatured {...leadership} invite={invite} />)
  const button = screen.getByRole('button', {name: invite.buttonLabel})
  const group = screen.getByRole('heading', {name: 'Board of Directors'})
  expect(group.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})
