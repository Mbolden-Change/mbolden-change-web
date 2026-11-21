/** @jest-environment node */
import fs from 'fs'
import path from 'path'
import {forgetActionEntries, getActionEntries, parseActionIndex} from './actionSource'
import {assembleIndex, DEFAULT_POPULAR, DEFAULT_TRY_WORDS} from './buildIndex'
import {CODE_PAGES} from './codePages'
import {createSearchEngine} from './engine'
import {isExcludedUrl, isRetentionPolicy, isTestSlug, scrubText} from './exclusions'
import {groupForDocument, groupForPage} from './groups'
import {SEARCH_INDEX_QUERY} from './sanitySource'
import {clip, sectionAnchor} from './text'
import {GROUPS, type SearchEntry} from './types'
import {ACTION_FILE, POSTS, SANITY} from './testFixtures'

const index = assembleIndex({sanity: SANITY, posts: POSTS, action: parseActionIndex(ACTION_FILE)})
const byUrl = (url: string) => index.entries.find((entry) => entry.url === url)
const everything = JSON.stringify(index)

describe('groups', () => {
  it('keeps the order Minh set', () => {
    expect([...GROUPS]).toEqual([
      "What We're Tackling",
      'News & Statements',
      'Resources',
      'About',
      'Ready to Grow',
      'Our Point of View',
      'Donate',
      'From mBOLDen Action',
    ])
  })

  it('maps each document type to its group', () => {
    expect(groupForDocument('statement')).toBe('News & Statements')
    expect(groupForDocument('letter')).toBe('News & Statements')
    expect(groupForDocument('newsItem')).toBe('News & Statements')
    expect(groupForDocument('employerGuide')).toBe('Resources')
    expect(groupForDocument('programCaseStudy', 'resources')).toBe('Resources')
    expect(groupForDocument('programCaseStudy', 'readyToGrow')).toBe('Ready to Grow')
    expect(groupForDocument('programCaseStudy', null)).toBe('Ready to Grow')
    // Proposed, for Minh to confirm.
    expect(groupForDocument('caseStudy')).toBe('Resources')
    expect(groupForDocument('report')).toBe('Resources')
    expect(groupForDocument('pdfDocument')).toBeNull()
  })

  it('maps each page to its group by slug', () => {
    expect(groupForPage('what-were-tackling')).toBe("What We're Tackling")
    expect(groupForPage('news')).toBe('News & Statements')
    expect(groupForPage('resources')).toBe('Resources')
    expect(groupForPage('about')).toBe('About')
    expect(groupForPage('ready-to-grow')).toBe('Ready to Grow')
    expect(groupForPage('point-of-view')).toBe('Our Point of View')
    expect(groupForPage('donate')).toBe('Donate')
    // Proposed, for Minh to confirm.
    expect(groupForPage('privacy')).toBe('About')
  })

  it('puts every entry in exactly one known group', () => {
    for (const entry of index.entries) expect(GROUPS).toContain(entry.group)
    expect(new Set(index.entries.map((entry) => entry.id)).size).toBe(index.entries.length)
  })

  it('groups the entries built from documents, code pages, posts and mBOLDen Action', () => {
    expect(byUrl('/statement/no-tax-justice')?.group).toBe('News & Statements')
    expect(byUrl('/letter/ab-1357')?.group).toBe('News & Statements')
    expect(byUrl('https://example.org/letter')).toMatchObject({group: 'News & Statements', newTab: true})
    expect(byUrl('/resources/beyond-compliance')?.group).toBe('Resources')
    expect(byUrl('/resources/student-and-family-safety-net')?.group).toBe('Resources')
    expect(byUrl('/ready-to-grow/project-empower')?.group).toBe('Ready to Grow')
    expect(byUrl('/simulator')).toMatchObject({group: 'Resources', title: 'Safety Net Simulator'})
    expect(byUrl('/legal-providers')?.group).toBe("What We're Tackling")
    expect(byUrl('/building-the-road')?.group).toBe('About')
    expect(byUrl('/point-of-view/cash-aid')?.group).toBe('Our Point of View')
    expect(byUrl('https://www.mboldenaction.org/movemydaf/')?.group).toBe('From mBOLDen Action')
  })

  it('lists a news row once when it only points at a letter we already list', () => {
    expect(index.entries.filter((entry) => entry.url === '/letter/ab-1357')).toHaveLength(1)
    expect(byUrl('/letter/ab-1357')?.body).toContain('Exempts guaranteed income')
  })
})

describe('exclusions', () => {
  it('asks Studio for published documents only', () => {
    const filters = SEARCH_INDEX_QUERY.match(/!\(_id in path\("drafts\.\*\*"\)\)/g) ?? []
    // Pages, statements, letters, news items, program case studies, employer guides, case studies, reports.
    expect(filters).toHaveLength(8)
  })

  it('leaves out drafts', () => {
    expect(byUrl('/unpublished')).toBeUndefined()
    expect(everything).not.toContain('Unpublished Immigrant Page')
  })

  it('leaves out pages whose slug starts with test', () => {
    expect(isTestSlug('test-layouts')).toBe(true)
    expect(isTestSlug('testimonials')).toBe(true)
    expect(isTestSlug('contest')).toBe(false)
    expect(byUrl('/test-layouts')).toBeUndefined()
    expect(everything).not.toContain('Lorem immigrant ipsum')
  })

  it('leaves out the homepage as a page of its own', () => {
    expect(byUrl('/')).toBeUndefined()
    expect(index.entries.some((entry) => entry.title === 'Homepage')).toBe(false)
  })

  it('leaves out the Document Retention & Destruction Policy, by title, address or mention', () => {
    expect(isRetentionPolicy('Document Retention & Destruction Policy')).toBe(true)
    expect(isRetentionPolicy('document-retention-and-destruction-policy.pdf')).toBe(true)
    expect(isRetentionPolicy('Employee retention in hiring')).toBe(false)
    expect(byUrl('/records-policy')).toBeUndefined()
    expect(isExcludedUrl('/reports/document-retention-destruction-policy.pdf')).toBe(true)
    expect(everything).not.toMatch(/retention/i)
  })

  it('never lists the original TCPP report', () => {
    expect(isExcludedUrl('/reports/tcpp-alum-rock-partner-report.pdf')).toBe(false)
    expect(isExcludedUrl('/reports/tcpp-alum-rock-partner-report-original.pdf')).toBe(true)
    expect(isExcludedUrl('https://cdn.sanity.io/files/x/production/TCPP-Alum-Rock-Partner-Report.pdf')).toBe(true)
    expect(index.entries.some((entry) => /tcpp/i.test(entry.url))).toBe(false)
  })

  it('gives a hidden fund no result and never links to its form', () => {
    const urls = index.entries.map((entry) => entry.url)
    expect(urls).toContain('/donate#gateway-fund')
    expect(urls).toContain('/donate#where-needed-most')
    expect(urls).not.toContain('/donate#care-access-fund')
    expect(urls).not.toContain('/donate#stories-systems-change')
    expect(isExcludedUrl('/donate#care-access-fund', ['care-access-fund'])).toBe(true)
    expect(index.entries.some((entry) => entry.title === 'The Care Access Fund')).toBe(false)
    // Its pop-up on What We're Tackling is a different thing, and stays.
    expect(urls).toContain('/what-were-tackling#care-access-fund')
  })

  it('keeps Stories, Systems, Change out of everything', () => {
    expect(everything).not.toMatch(/stories,? systems/i)
    expect(everything).not.toContain('stories-systems-change')
    expect(everything).not.toContain('Narrative work')
    // The sentence naming it is dropped; the sentences around it stay.
    expect(byUrl('/giving-guide')?.body).toBe('Support families with cash. Thank you.')
    expect(scrubText('Give to Stories, Systems, Change today.')).toBe('')
  })

  it('leaves out switched-off banners, button labels, emails and account details', () => {
    expect(everything).not.toContain('switched off')
    expect(everything).not.toContain('Give to the Gateway Fund')
    expect(everything).not.toContain('someone@example.org')
    expect(everything).not.toContain('12-3456789')
  })
})

describe('pop-ups and sections', () => {
  it('links a Text & Media pop-up to its page plus the sectionId', () => {
    expect(byUrl('/what-were-tackling#gateway-fund')).toMatchObject({
      title: 'The Gateway Fund',
      group: "What We're Tackling",
      location: "What We're Tackling › The Gateway Fund",
      summary: 'The Gateway Fund pays filing fees for young people seeking legal protection.',
    })
  })

  it('uses the subtitle when a pop-up has no search summary', () => {
    expect(byUrl('/what-were-tackling#care-access-fund')?.summary).toBe('Care Access Fund')
  })

  it('links the About invitation pop-up to its sectionId', () => {
    expect(byUrl('/about#shape-the-future')).toMatchObject({
      title: 'Shape the Future with mBOLDen Change',
      group: 'About',
      location: 'About › Our Leadership',
    })
  })

  it('gives About sections their own results', () => {
    expect(sectionAnchor('Our History')).toBe('our-history')
    expect(sectionAnchor("What We're Tackling & More")).toBe('what-were-tackling-and-more')
    for (const url of ['/about#our-leadership', '/about#our-history', '/about#get-in-touch']) {
      expect(byUrl(url)?.group).toBe('About')
    }
    expect(byUrl('/donate#other-ways-to-give')?.group).toBe('Donate')
  })

  it('keeps a pop-up’s text out of its page’s own result', () => {
    expect(byUrl('/what-were-tackling')?.body ?? '').not.toContain('stands between a child')
    expect(byUrl('/what-were-tackling')?.headings).toContain('The Gateway Fund')
  })
})

describe('posts', () => {
  it('uses the subtitle, or the start of the excerpt cut at a word', () => {
    expect(byUrl('/point-of-view/cash-aid')).toMatchObject({
      summary: 'Where a just society begins',
      location: 'Our Point of View · Nov 13, 2026',
      headings: ['What the evidence says'],
    })
    const summary = byUrl('/point-of-view/no-subtitle')?.summary ?? ''
    expect(summary.length).toBeLessThanOrEqual(141)
    expect(summary.endsWith('…')).toBe(true)
    expect(POSTS[1].excerpt.startsWith(summary.slice(0, -1))).toBe(true)
    expect(POSTS[1].excerpt[summary.length - 1]).toBe(' ')
    expect(clip('Short enough.')).toBe('Short enough.')
  })
})

describe('mBOLDen Action', () => {
  it('reads the file format and writes the location line', () => {
    const entries = parseActionIndex(ACTION_FILE)
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://www.mboldenaction.org/',
      'https://www.mboldenaction.org/movemydaf/',
    ])
    expect(entries[0]).toMatchObject({location: 'mboldenaction.org', newTab: true})
    expect(entries[1]).toMatchObject({
      title: 'Move My DAF',
      location: 'mboldenaction.org › Move My DAF',
      summary: 'See where your DAF sponsor stands.',
    })
  })

  it('still returns a working index when the fetch fails', async () => {
    forgetActionEntries()
    const failing = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch
    const action = await getActionEntries(failing)
    expect(action).toEqual([])
    const built = assembleIndex({sanity: SANITY, posts: POSTS, action})
    expect(built.entries.some((entry) => entry.group === 'From mBOLDen Action')).toBe(false)
    expect(createSearchEngine(built.entries).search('gateway').total).toBeGreaterThan(0)
  })

  it('treats a missing or broken file the same way', async () => {
    forgetActionEntries()
    const notFound = jest.fn().mockResolvedValue({ok: false, status: 404}) as unknown as typeof fetch
    expect(await getActionEntries(notFound)).toEqual([])
    const html = jest.fn().mockResolvedValue({ok: true, json: async () => ({nope: true})}) as unknown as typeof fetch
    expect(await getActionEntries(html)).toEqual([])
  })

  it('keeps the last good copy when a later fetch fails', async () => {
    forgetActionEntries()
    const good = jest.fn().mockResolvedValue({ok: true, json: async () => ACTION_FILE}) as unknown as typeof fetch
    expect(await getActionEntries(good)).toHaveLength(2)
    expect(good).toHaveBeenCalledWith('https://www.mboldenaction.org/search-index.json', expect.anything())
    const failing = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch
    expect(await getActionEntries(failing)).toHaveLength(2)
  })
})

describe('ranking and matching', () => {
  const entry = (id: string, fields: Partial<SearchEntry>): SearchEntry => ({
    id,
    url: `/${id}`,
    title: id,
    group: 'Resources',
    location: 'Resources',
    ...fields,
  })

  it('ranks a title match above a body match', () => {
    const engine = createSearchEngine([
      entry('body', {title: 'Something Else', body: 'A long text that mentions the simulator once.'}),
      entry('title', {title: 'Safety Net Simulator', body: 'A tool.'}),
    ])
    expect(engine.search('simulator').groups[0].results.map((result) => result.id)).toEqual(['title', 'body'])
  })

  it('ranks keywords above summary, summary above headings and headings above body', () => {
    const engine = createSearchEngine([
      entry('in-body', {body: 'cliff'}),
      entry('in-headings', {headings: ['cliff']}),
      entry('in-summary', {summary: 'cliff'}),
      entry('in-keywords', {keywords: ['cliff']}),
    ])
    expect(engine.search('cliff').groups[0].results.map((result) => result.id)).toEqual([
      'in-keywords',
      'in-summary',
      'in-headings',
      'in-body',
    ])
  })

  it('matches words of 1–2 letters as whole words only', () => {
    const engine = createSearchEngine([
      entry('aid', {title: 'Cash Aid for Families', body: 'Aid and aim and air.'}),
      entry('ai', {title: 'What AI Owes Us', body: 'AI runs on our water.'}),
    ])
    expect(engine.search('AI').groups.flatMap((group) => group.results.map((result) => result.id))).toEqual(['ai'])
    expect(engine.search('ai').total).toBe(1)
  })

  it('matches the start of a longer word while typing', () => {
    const engine = createSearchEngine([entry('immigrant', {title: 'Immigrant Workers'})])
    expect(engine.search('imm').total).toBe(1)
    expect(engine.search('immig').total).toBe(1)
  })

  it('forgives a small typo in words of 5 letters or more, not in shorter ones', () => {
    const engine = createSearchEngine([entry('therapy', {title: 'Pediatric Therapy Access'}), entry('cash', {title: 'Cash'})])
    expect(engine.search('theripy').total).toBe(1)
    expect(engine.search('cesh').total).toBe(0)
  })

  it('needs every word, and falls back to any word when that finds nothing', () => {
    const engine = createSearchEngine([
      entry('both', {title: 'Guaranteed Income'}),
      entry('one', {title: 'Guaranteed Delivery'}),
    ])
    expect(engine.search('guaranteed income').groups[0].results.map((result) => result.id)).toEqual(['both'])
    expect(engine.search('guaranteed unicorns').total).toBe(2)
  })

  it('sorts by score inside a group and keeps the groups in order', () => {
    const results = createSearchEngine(index.entries).search('gateway')
    const order = results.groups.map((group) => GROUPS.indexOf(group.group))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    for (const group of results.groups) {
      const scores = group.results.map((result) => result.score)
      expect(scores).toEqual([...scores].sort((a, b) => b - a))
    }
    expect(results.groups[0].results[0].title).toBe('The Gateway Fund')
  })
})

describe('hidden search keywords', () => {
  const engine = createSearchEngine(index.entries)

  it('match the entry they belong to', () => {
    expect(engine.search('SIJS').groups[0].results[0].url).toBe('/what-were-tackling#gateway-fund')
    expect(engine.search('immigrant kids').groups[0].results[0].url).toBe('/what-were-tackling#gateway-fund')
    expect(engine.search('ICE raid').groups.flatMap((group) => group.results).some((result) => result.url === '/resources/beyond-compliance')).toBe(true)
    expect(engine.search('programs').groups[0].results[0].url).toBe('/what-were-tackling')
  })

  it('are never part of what a result shows', () => {
    const shown = JSON.stringify(engine.search('immigrant kids'))
    expect(shown).toContain('/what-were-tackling#gateway-fund')
    expect(shown).not.toContain('immigrant kids')
    expect(JSON.stringify(engine.search('programs'))).not.toContain('programs')
    for (const result of engine.search('gateway').groups.flatMap((group) => group.results)) {
      for (const hidden of ['keywords', 'headings', 'body']) expect(result).not.toHaveProperty(hidden)
    }
  })

  it('reach pages built in code from Search settings', () => {
    const built = assembleIndex({
      sanity: {...SANITY, settings: {codePageKeywords: [{path: '/simulator', searchKeywords: ['benefits cliff']}]}},
    })
    expect(createSearchEngine(built.entries).search('benefits cliff').groups[0].results[0].url).toBe('/simulator')
  })
})

describe('Search settings', () => {
  it('falls back to the seed values until the document is published', () => {
    expect(index.tryWords).toEqual(DEFAULT_TRY_WORDS)
    expect(index.popular).toEqual(DEFAULT_POPULAR)
  })

  it('uses the Studio values, at most 6, and never a hidden fund or the retention policy', () => {
    const built = assembleIndex({
      sanity: {
        ...SANITY,
        settings: {
          tryWords: ['cash', ' DAF ', '', 'a', 'b', 'c', 'd', 'e'],
          popularLinks: [
            {title: 'Donate', isExternalLink: true, url: '/donate', target: '_blank'},
            {title: 'About', reference: {_type: 'page', slug: 'about'}},
            {title: 'A case study', reference: {_type: 'programCaseStudy', slug: 'sfsn', section: 'resources'}},
            {title: 'mBOLDen Action', isExternalLink: true, url: 'https://www.mboldenaction.org/', target: '_blank'},
            {title: 'Hidden fund', isExternalLink: true, url: '/donate#stories-systems-change'},
            {title: 'Care', isExternalLink: true, url: '/donate#care-access-fund'},
            {title: 'Policy', isExternalLink: true, url: '/reports/document-retention-policy.pdf'},
            {title: '', isExternalLink: true, url: '/nowhere'},
          ],
        },
      },
    })
    expect(built.tryWords).toEqual(['cash', 'DAF', 'a', 'b', 'c', 'd'])
    expect(built.popular).toEqual([
      {title: 'Donate', href: '/donate'},
      {title: 'About', href: '/about'},
      {title: 'A case study', href: '/resources/sfsn'},
      {title: 'mBOLDen Action', href: 'https://www.mboldenaction.org/', newTab: true},
    ])
  })
})

describe('pages built in code', () => {
  const page = (file: string) => fs.readFileSync(path.join(process.cwd(), 'app', file, 'page.tsx'), 'utf8')

  it('use the descriptions in each page’s own metadata', () => {
    for (const entry of CODE_PAGES) {
      expect(page(entry.url.slice(1))).toContain(`'${entry.summary}'`)
    }
  })

  it('use the pages’ titles', () => {
    expect(page('simulator')).toContain("'The Safety Net Simulator'")
    expect(page('legal-providers')).toContain("'Request for Funds'")
    const journey = fs.readFileSync(path.join(process.cwd(), 'components/v2/journey/journeyData.ts'), 'utf8')
    expect(journey).toContain('"title": "Building the Road to Systemic Equity"')
  })
})
