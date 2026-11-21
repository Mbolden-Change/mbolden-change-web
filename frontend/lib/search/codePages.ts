import type {SearchEntry} from './types'

/**
 * Pages built in code rather than in Studio. Titles and descriptions match
 * each page's own metadata (app/<page>/page.tsx); codePages.test.ts fails if
 * they drift apart. /point-of-view is a Studio page, so it is indexed with
 * the other pages.
 */
export const CODE_PAGES: SearchEntry[] = [
  {
    id: 'code:/simulator',
    url: '/simulator',
    title: 'Safety Net Simulator',
    summary:
      'Follow a household through federal safety net cuts and face the tradeoffs real families face when benefits are reduced.',
    group: 'Resources',
    location: 'Resources › Tool',
  },
  {
    id: 'code:/legal-providers',
    url: '/legal-providers',
    title: 'Request for Funds',
    summary:
      'Request Gateway Fund support for SIJS filing fees. For nonprofit legal service providers, legal services networks and law firms.',
    group: "What We're Tackling",
    location: "What We're Tackling › The Gateway Fund",
  },
  {
    id: 'code:/building-the-road',
    url: '/building-the-road',
    title: 'Building the Road to Systemic Equity',
    summary:
      'Build the road to systemic equity with mBOLDen Change, from where we are today to the future we envision together.',
    group: 'About',
    location: 'About',
  },
]
