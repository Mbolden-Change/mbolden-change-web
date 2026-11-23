import {render} from '@testing-library/react'
import EmployerGuide, {GUIDE_ANCHORS, type EmployerGuideData} from './EmployerGuide'

jest.mock('@/lib/ga', () => ({gaEvent: jest.fn()}))

const guide = {
  _id: 'employerGuide-test',
  _type: 'employerGuide',
  title: 'Beyond Compliance',
  slug: {_type: 'slug', current: 'beyond-compliance'},
  areasHeading: 'Six Areas',
  areas: [{_key: 'a', title: 'Area', color: 'teal', steps: [{_key: 's', title: 'Step'}]}],
  warrant: {eyebrow: 'Check the Paperwork', heading: 'Is It a Judicial Warrant?', questions: ['Signed by a judge?']},
  ice: {eyebrow: 'Keep This Handy', heading: 'In Case of ICE', steps: ['Stay calm.']},
  materials: {eyebrow: 'From Our Partners', heading: 'Know Your Rights Materials'},
} as unknown as EmployerGuideData

// Ads and links point at these addresses.
test('gives the warrant checker, ICE card and materials sections their fixed addresses', () => {
  expect(GUIDE_ANCHORS).toEqual({
    warrant: 'warrant-checker',
    ice: 'in-case-of-ice',
    materials: 'know-your-rights',
  })
  const {container} = render(<EmployerGuide {...guide} />)
  const heading = (id: string) => {
    const sections = container.querySelectorAll(`[id="${id}"]`)
    expect(sections).toHaveLength(1)
    return sections[0].querySelector('h2')?.textContent
  }
  expect(heading('warrant-checker')).toBe('Is It a Judicial Warrant?')
  expect(heading('in-case-of-ice')).toBe('In Case of ICE')
  expect(heading('know-your-rights')).toBe('Know Your Rights Materials')
})

test('scrolls to the section on arrival at its address', () => {
  const scrollIntoView = jest.fn()
  Element.prototype.scrollIntoView = scrollIntoView
  window.history.replaceState(null, '', '/resources/beyond-compliance#in-case-of-ice')
  render(<EmployerGuide {...guide} />)
  expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'auto', block: 'start'})
  expect((scrollIntoView.mock.contexts[0] as Element).id).toBe('in-case-of-ice')
  window.history.replaceState(null, '', '/')
})
