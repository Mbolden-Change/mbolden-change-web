import {render, screen, within} from '@testing-library/react'
import FunderCta from './FunderCta'
import ProcessLoop from './ProcessLoop'

const contact = {name: 'Sue Sutherland', title: 'Director of Advancement', email: 'sue@mboldenchange.org'}

test('renders the heading, the six stages as a list and the finished drawings', () => {
  const {container} = render(<ProcessLoop contact={contact} emailSubject="Ready to Grow" />)
  expect(screen.getByRole('heading', {level: 2, name: 'Our Community-Centered Design Process'})).toBeInTheDocument()
  const items = within(screen.getByRole('list')).getAllByRole('listitem')
  expect(items).toHaveLength(6)
  expect(items[0]).toHaveTextContent('Listen — We listen to those closest to the challenges.')
  expect(items[5]).toHaveTextContent('Share back & listen — We bring what we learned back')
  const drawings = screen.getAllByRole('img')
  expect(drawings).toHaveLength(2)
  expect(drawings[0]).toHaveAttribute('aria-label', expect.stringMatching(/^Our community-centered design process, a loop in six stages: Listen, then Build trust/))
  // Without motion (jsdom has no IntersectionObserver): no Pause button, every chip on.
  expect(screen.queryByRole('button')).toBeNull()
  expect(container.querySelectorAll('svg > g.on')).toHaveLength(12)
})

test('the link opens the same email as Get in Touch and is marked for tracking', () => {
  render(<ProcessLoop contact={contact} emailSubject="Ready to Grow" linkText="Fund a model" />)
  const link = screen.getByRole('link', {name: /Fund a model/})
  expect(link).toHaveAttribute('href', 'mailto:sue@mboldenchange.org?subject=Ready%20to%20Grow')
  expect(link).toHaveAttribute('data-funder-contact', 'process_loop')

  render(<FunderCta _type="funderCta" heading="Invest in What's Possible" emailSubject="Ready to Grow" contact={contact} />)
  const button = screen.getByRole('link', {name: 'Get in Touch'})
  expect(button).toHaveAttribute('href', link.getAttribute('href'))
  expect(button).toHaveAttribute('data-funder-contact', 'partner_section')
})

test('uses Studio wording and shows no link without a contact', () => {
  render(<ProcessLoop heading="Our process" stages={[{_key: 'a', _type: 'processLoopStage', label: 'Hear', description: 'We hear.'}]} />)
  expect(screen.getByRole('heading', {name: 'Our process'})).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Hear — We hear.')
  expect(screen.queryByRole('link')).toBeNull()
})
