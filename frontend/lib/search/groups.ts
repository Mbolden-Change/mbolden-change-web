import type {SearchGroup} from './types'

/** Studio pages by slug. Any other page falls back to PROPOSED_PAGE_GROUP. */
const PAGE_GROUPS: Record<string, SearchGroup> = {
  'what-were-tackling': "What We're Tackling",
  news: 'News & Statements',
  resources: 'Resources',
  about: 'About',
  'ready-to-grow': 'Ready to Grow',
  'point-of-view': 'Our Point of View',
  donate: 'Donate',
}

/**
 * Pages with no group of their own are listed under About. (The Privacy
 * Policy isn't in search at all; see exclusions.ts.)
 */
export const PROPOSED_PAGE_GROUP: SearchGroup = 'About'

export function groupForPage(slug: string): SearchGroup {
  return PAGE_GROUPS[slug] ?? PROPOSED_PAGE_GROUP
}

/** Program case studies live under Ready to Grow unless their section is Resources. */
export function groupForProgramCaseStudy(section?: string | null): SearchGroup {
  return section === 'resources' ? 'Resources' : 'Ready to Grow'
}

/**
 * Documents by type. caseStudy and report under Resources are proposed, for
 * Minh to confirm (production has none of either today).
 */
export function groupForDocument(type: string, section?: string | null): SearchGroup | null {
  switch (type) {
    case 'statement':
    case 'letter':
    case 'newsItem':
      return 'News & Statements'
    case 'employerGuide':
      return 'Resources'
    case 'programCaseStudy':
      return groupForProgramCaseStudy(section)
    case 'caseStudy':
    case 'report':
      return 'Resources'
    default:
      return null
  }
}
