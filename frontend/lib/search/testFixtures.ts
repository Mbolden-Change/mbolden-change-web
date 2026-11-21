import type {SanitySearchData} from './sanitySource'

const block = (text: string) => ({_type: 'block', style: 'normal', children: [{_type: 'span', text}]})

/** A small site: every kind of content search reads, plus everything it must leave out. */
export const SANITY: SanitySearchData = {
  pages: [
    {
      _id: 'page-home',
      title: 'Homepage',
      slug: '/',
      content: [{_type: 'impactHero', heading: 'Meeting Urgent Needs'}],
    },
    {
      _id: 'page-what-were-tackling',
      title: "What We're Tackling",
      slug: 'what-were-tackling',
      description: 'Our work in economic security, health access and rapid response.',
      searchKeywords: ['programs'],
      content: [
        {_type: 'pageHeader', heading: "What We're Tackling", dek: 'Opportunity is shaped by policy.'},
        {
          _type: 'textMedia',
          appearance: 'pilotDialog',
          sectionId: 'gateway-fund',
          headline: 'The Gateway Fund',
          subtitle: 'Bridging the Gap to Legal Protection',
          searchSummary: 'The Gateway Fund pays filing fees for young people seeking legal protection.',
          searchKeywords: ['SIJS', 'immigrant kids'],
          textBody: [block('A new rule adds a fee that stands between a child and safety.')],
          ctas: [{label: 'Give to the Gateway Fund', link: '/donate#gateway-fund'}],
        },
        {
          _type: 'textMedia',
          appearance: 'pilotDialog',
          sectionId: 'care-access-fund',
          headline: 'Pediatric Therapy Access',
          subtitle: 'Care Access Fund',
          textBody: [block('Children on Medi-Cal wait months for therapy.')],
          ctas: [{label: 'Give', link: '/donate#care-access-fund'}],
        },
      ],
    },
    {
      _id: 'page-about',
      title: 'About',
      slug: 'about',
      content: [
        {
          _type: 'leadership',
          title: 'Our Leadership',
          eyebrow: 'The People Behind the Work',
          people: [{name: 'Minh Ngo', role: 'Board Chair & Executive Director', bio: 'A philanthropic leader.'}],
          invite: {
            buttonLabel: 'Shape the future with us',
            heading: 'Shape the Future with mBOLDen Change',
            sectionId: 'shape-the-future',
            body: [block('Board members provide fiduciary oversight and strategic guidance.')],
            email: 'someone@example.org',
          },
        },
        {_type: 'timeline', heading: 'Our History', milestones: [{year: '2006', title: 'Founded', text: 'We began with shoes.'}]},
        {_type: 'getInTouch', heading: 'Get in Touch', text: 'We’d love to hear from you.'},
      ],
    },
    {
      _id: 'page-donate',
      title: 'Donate',
      slug: 'donate',
      content: [
        {_type: 'campaignBanner', enabled: false, heading: 'A banner that is switched off'},
        {
          _type: 'fundCards',
          heading: 'Choose Where Your Gift Goes',
          funds: [
            {title: "Where it's needed most", text: 'Lets us move fast.', linkId: 'where-needed-most'},
            {title: 'The Gateway Fund', text: '$250 covers one application fee.', linkId: 'gateway-fund'},
            {title: 'The Care Access Fund', linkId: 'care-access-fund', showOnDonatePage: false},
            {title: 'Stories, Systems, Change', text: 'Narrative work.', linkId: 'stories-systems-change', showOnDonatePage: false},
          ],
        },
        {_type: 'givingOptions', heading: 'Other Ways to Give', options: [{title: 'Donor-advised fund', text: 'Recommend a grant through your DAF sponsor.', detail: '12-3456789'}]},
      ],
    },
    {_id: 'page-resources', title: 'Resources', slug: 'resources', content: [{_type: 'resourceLibrary', heading: 'Guides, Tools and Research', items: [{title: 'Beyond Compliance', text: 'A guide for employers.', href: '/resources/beyond-compliance'}]}]},
    {_id: 'page-ready', title: 'Ready to Grow', slug: 'ready-to-grow', content: []},
    {_id: 'page-news', title: 'News & Statements', slug: 'news', content: []},
    {_id: 'page-pov', title: 'Our Point of View', slug: 'point-of-view', content: []},
    {_id: 'page-privacy', title: 'Privacy Policy', slug: 'privacy', content: [{_type: 'policyText', title: 'Privacy Policy', body: [block('We collect very little.')]}]},
    // Never indexed.
    {_id: 'page-test', title: 'Test Layouts', slug: 'test-layouts', content: [{_type: 'richText', heading: 'Lorem immigrant ipsum'}]},
    {_id: 'drafts.page-secret', title: 'An Unpublished Immigrant Page', slug: 'unpublished', content: []},
    {_id: 'page-retention', title: 'Document Retention & Destruction Policy', slug: 'records-policy', content: []},
    {
      _id: 'page-mentions',
      title: 'Giving Guide',
      slug: 'giving-guide',
      content: [
        {
          _type: 'richText',
          heading: 'Ways to help',
          text: 'Support families with cash. You can also give to Stories, Systems, Change. Read our Document Retention and Destruction Policy. Thank you.',
        },
      ],
    },
  ],
  statements: [
    {_id: 'st-1', title: 'No Tax Justice Without a Just EITC', slug: 'no-tax-justice', date: '2025-06-01T12:00:00.000Z', datePrecision: 'month', lead: 'No one should work full time and live in poverty.', text: [block('Immigrant families are shut out of the credit.')]},
  ],
  letters: [{_id: 'letter-1', title: 'Support for AB 1357', slug: 'ab-1357', date: '2025-05-07', summary: 'Guaranteed income without losing benefits.', body: [block('We write in support.')]}],
  newsItems: [
    {_id: 'news-1', title: 'Support for AB 1357', kind: 'ourLetter', date: '2025-05-07', summary: 'Exempts guaranteed income.', link: '/letter/ab-1357', issue: 'Economic Security'},
    {_id: 'news-2', title: 'Coalition Letter on Medicaid', kind: 'coalitionLetter', date: '2026-11-16', summary: 'Urges Congress to delay.', link: 'https://example.org/letter'},
  ],
  programCaseStudies: [
    {_id: 'pcs-1', name: 'Project Empower', slug: 'project-empower', summary: 'A guaranteed income pilot.', pilotYears: '2022–2024'},
    {_id: 'pcs-2', name: 'Student & Family Safety Net', slug: 'student-and-family-safety-net', section: 'resources', summary: 'Emergency cash for students.'},
  ],
  employerGuides: [{_id: 'eg-1', title: 'Beyond Compliance', slug: 'beyond-compliance', description: 'A practical guide for employers.', searchKeywords: ['ICE raid']}],
  caseStudies: [{_id: 'cs-1', heading: 'An Older Case Study', slug: 'older-case-study'}],
  reports: [{_id: 'report-1', title: 'A Report', slug: 'a-report'}],
  settings: null,
}

export const POSTS = [
  {
    slug: 'cash-aid',
    title: 'Cash Aid Isn’t the Ceiling',
    subtitle: 'Where a just society begins',
    date: '2026-11-13T18:00:00.000Z',
    excerpt: 'Where a just society begins',
    html: '<p>Direct cash works.</p><h2>What the evidence says</h2><p>Families spend it on rent.</p>',
  },
  {
    slug: 'no-subtitle',
    title: 'A Post Without a Subtitle',
    date: '2026-10-01T18:00:00.000Z',
    excerpt:
      'This first sentence runs long enough that the summary has to be cut somewhere sensible, at a word and not in the middle of one, so that it reads cleanly in a result.',
    html: '<p>Body text about immigrant workers.</p>',
  },
]

export const ACTION_FILE = {
  version: 1,
  site: 'mboldenaction.org',
  generated: '2026-11-21T00:00:00.000Z',
  pages: [
    {url: 'https://www.mboldenaction.org/', title: 'mBOLDen Action', description: 'The advocacy and storytelling arm of mBOLDen Change.', campaign: 'mBOLDen Action', headings: ['Current campaigns'], text: 'Campaigns that make systems visible.', updated: '2026-11-21'},
    {url: 'https://www.mboldenaction.org/movemydaf/', title: 'Move My DAF', description: 'See where your DAF sponsor stands.', campaign: 'Move My DAF', headings: ['How we got here'], text: 'Donor-advised fund sponsors blocked grants.', updated: '2026-11-21'},
    {url: 'https://evil.example.com/phish', title: 'Not ours', description: '', campaign: '', headings: [], text: ''},
  ],
}
