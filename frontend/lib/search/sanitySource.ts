/**
 * Search entries from Studio content: pages (and the sections and pop-ups
 * inside them), statements, letters, news items, case studies and guides.
 * Pure functions over the query result, so tests can pass their own content.
 */
import {isTestSlug, isUnlistedPage} from './exclusions'
import {groupForDocument, groupForPage} from './groups'
import {clip, extractText, portableTextToLines, sectionAnchor, shortDate, tidy, type Extracted} from './text'
import {PAGE_LOCATION, type SearchEntry, type SearchGroup, type SearchLink} from './types'

const LINK = `{title, isExternalLink, url, target, reference->{_type, "slug": slug.current, section}}`
const PUBLISHED = `defined(slug.current) && !(_id in path("drafts.**"))`

/** Everything search reads from Studio, published documents only. */
export const SEARCH_INDEX_QUERY = `{
  "pages": *[_type == "page" && ${PUBLISHED}]{
    _id, title, description, searchKeywords, "slug": slug.current,
    content[]{
      ...,
      _type == "caseStudyCards" => {..., "cards": caseStudies[]->{name, cardSummary, lane}},
      _type == "statementCards" => {..., cards[]{text, "title": statement->title}},
      _type == "tabsContainer" => {..., tabs[]{..., content[]{...}}}
    }
  },
  "statements": *[_type == "statement" && ${PUBLISHED}]{
    _id, title, "slug": slug.current, date, datePrecision, issue, lead, description, text, closing, searchKeywords
  },
  "letters": *[_type == "letter" && ${PUBLISHED}]{
    _id, title, "slug": slug.current, date, issue, summary, bill, to, re, body, searchKeywords
  },
  "newsItems": *[_type == "newsItem" && defined(date) && !(_id in path("drafts.**"))] | order(date desc){
    _id, title, kind, date, datePrecision, issue, summary, details, link, searchKeywords
  },
  "programCaseStudies": *[_type == "programCaseStudy" && ${PUBLISHED}]{..., "slug": slug.current},
  "employerGuides": *[_type == "employerGuide" && ${PUBLISHED}]{..., "slug": slug.current},
  "caseStudies": *[_type == "caseStudy" && ${PUBLISHED}]{
    _id, heading, subheading, "slug": slug.current, date, text, searchKeywords
  },
  "reports": *[_type == "report" && ${PUBLISHED}]{_id, title, "slug": slug.current, date, text, searchKeywords},
  "settings": *[_id == "searchSettings"][0]{
    tryWords,
    popularLinks[]${LINK},
    codePageKeywords[]{path, searchKeywords}
  }
}`

type Doc = Record<string, unknown> & {_id?: string; slug?: string | null; searchKeywords?: string[] | null}
type Block = Record<string, unknown> & {_type?: string; _key?: string}

export type SettingsLink = {
  title?: string | null
  isExternalLink?: boolean | null
  url?: string | null
  target?: string | null
  reference?: {_type?: string; slug?: string | null; section?: string | null} | null
}

export type SanitySearchData = {
  pages?: Array<Doc & {title?: string; description?: string | null; content?: Block[] | null}> | null
  statements?: Doc[] | null
  letters?: Doc[] | null
  newsItems?: Doc[] | null
  programCaseStudies?: Doc[] | null
  employerGuides?: Doc[] | null
  caseStudies?: Doc[] | null
  reports?: Doc[] | null
  settings?: {
    tryWords?: string[] | null
    popularLinks?: SettingsLink[] | null
    codePageKeywords?: Array<{path?: string | null; searchKeywords?: string[] | null}> | null
  } | null
}

export type SanityEntries = {
  entries: SearchEntry[]
  /** Link IDs of funds switched off on the Donate page. Their deep links are never a result. */
  hiddenFundIds: string[]
}

const str = (value: unknown) => tidy(value)
const keywordsOf = (value: unknown) =>
  Array.isArray(value) ? value.map(str).filter(Boolean) : []
const join = (parts: string[]) => parts.filter(Boolean).join(' ')
const optional = <K extends string, V extends string | string[]>(key: K, value: V) =>
  (value.length ? {[key]: value} : {}) as {[P in K]?: V}

/** Sections of a page that get a result of their own, with the field holding their heading. */
const SECTION_HEADING: Record<string, string> = {
  leadership: 'title',
  timeline: 'heading',
  getInTouch: 'heading',
  resourceLibrary: 'heading',
  partnerResources: 'heading',
  caseStudyCards: 'heading',
  givingOptions: 'heading',
}
/** The Other Ways to Give section's own id (see blocks/Donate/GivingOptions.tsx). */
const OTHER_WAYS_ID = 'other-ways-to-give'
const SECTION_SUMMARY_KEYS = ['text', 'intro', 'description', 'dek']

const NEWS_KIND: Record<string, string> = {
  statement: 'Statement',
  ourLetter: 'Our letter',
  coalitionLetter: 'Coalition letter',
  announcement: 'Announcement',
}

const isSitePath = (url: string) => url.startsWith('/') && !url.startsWith('//')

function flatten(content: Block[] | null | undefined): Block[] {
  const blocks: Block[] = []
  for (const block of content ?? []) {
    if (!block || typeof block !== 'object') continue
    if (block._type === 'tabsContainer' && Array.isArray(block.tabs)) {
      for (const tab of block.tabs as Array<{content?: Block[]}>) blocks.push(...flatten(tab?.content))
    } else {
      blocks.push(block)
    }
  }
  return blocks
}

function entriesFromPage(
  page: NonNullable<SanitySearchData['pages']>[number],
  hiddenFundIds: string[],
): SearchEntry[] {
  const slug = page.slug ?? ''
  const pageTitle = str(page.title)
  // The homepage isn't a result of its own: its sections live on other pages.
  if (!slug || slug === '/' || isTestSlug(slug) || isUnlistedPage(slug) || !pageTitle) return []

  const path = `/${slug}`
  const group = groupForPage(slug)
  const sections: SearchEntry[] = []
  const own: Extracted = {headings: [], body: []}
  const keywords = keywordsOf(page.searchKeywords)

  const section = (
    anchor: string,
    title: string,
    text: Extracted,
    extra: {summary?: string; keywords?: string[]; location?: string} = {},
  ) => {
    const headings = text.headings.filter((heading) => heading !== title)
    sections.push({
      id: `${page._id}#${anchor}`,
      url: `${path}#${anchor}`,
      title,
      group,
      location: extra.location ?? pageTitle,
      ...optional('summary', extra.summary ?? ''),
      ...optional('keywords', extra.keywords ?? []),
      ...optional('headings', headings),
      ...optional('body', join(text.body)),
    })
    // The page still answers to its sections' names.
    own.headings.push(title)
  }

  for (const block of flatten(page.content)) {
    const type = block._type ?? ''

    if (type === 'textMedia') {
      const anchor = str(block.sectionId)
      const headline = str(block.headline)
      if (anchor && headline) {
        // A pop-up, or a section with its own address: #section-id opens it.
        section(anchor, headline, extractText(block), {
          summary: str(block.searchSummary) || str(block.subtitle),
          keywords: keywordsOf(block.searchKeywords),
          location: `${pageTitle} › ${headline}`,
        })
      } else {
        extractText(block, own)
        keywords.push(...keywordsOf(block.searchKeywords))
      }
      continue
    }

    if (type === 'fundCards') {
      own.headings.push(...[str(block.eyebrow), str(block.heading)].filter(Boolean))
      for (const fund of (block.funds ?? []) as Array<Record<string, unknown>>) {
        const linkId = str(fund.linkId)
        const title = str(fund.title)
        // A fund switched off on the Donate page: no result, no words, no link.
        if (fund.showOnDonatePage === false) {
          if (linkId) hiddenFundIds.push(linkId)
          continue
        }
        if (!title) continue
        if (!linkId) {
          own.headings.push(title)
          own.body.push(str(fund.text))
          continue
        }
        sections.push({
          id: `${page._id}#${linkId}`,
          url: `${path}#${linkId}`,
          title,
          group,
          location: `${pageTitle} › Fund`,
          ...optional('summary', str(fund.text)),
        })
        own.headings.push(title)
      }
      continue
    }

    if (type === 'campaignBanner' && block.enabled !== true) continue

    if (type === 'leadership') {
      const invite = block.invite as Record<string, unknown> | undefined
      const inviteId = str(invite?.sectionId)
      const inviteTitle = str(invite?.heading) || str(invite?.buttonLabel)
      // The Invitation pop-up, shown only when it has a button.
      const {invite: _invite, ...rest} = block
      void _invite
      const title = str(rest.title)
      if (invite && str(invite.buttonLabel) && inviteId && inviteTitle) {
        const lines = [...portableTextToLines(invite.body), ...portableTextToLines(invite.closingLine)]
        section(inviteId, inviteTitle, {headings: [], body: lines}, {
          summary: clip(lines[0] ?? '', 140),
          location: title ? `${pageTitle} › ${title}` : pageTitle,
        })
      }
      const anchor = sectionAnchor(title)
      if (title && anchor) section(anchor, title, extractText(rest), {summary: str(rest.eyebrow)})
      else extractText(rest, own)
      continue
    }

    const headingKey = SECTION_HEADING[type]
    if (headingKey) {
      const title = str(block[headingKey])
      const anchor = type === 'givingOptions' ? OTHER_WAYS_ID : sectionAnchor(title)
      if (title && anchor) {
        const summary = SECTION_SUMMARY_KEYS.map((key) => str(block[key])).find(Boolean) ?? ''
        section(anchor, title, extractText(block), {summary: clip(summary, 160)})
        continue
      }
    }

    extractText(block, own)
  }

  const summary = str(page.description)
  const pageEntry: SearchEntry = {
    id: String(page._id),
    url: path,
    title: pageTitle,
    group,
    location: PAGE_LOCATION,
    ...optional('summary', summary),
    ...optional('keywords', keywords),
    ...optional('headings', [...new Set(own.headings)].filter((heading) => heading !== pageTitle)),
    ...optional('body', join(own.body)),
  }
  return [pageEntry, ...sections]
}

type DocumentShape = {
  type: string
  path: (doc: Doc) => string
  title: (doc: Doc) => string
  summary: (doc: Doc) => string
  label: (doc: Doc) => string
}

const DOCUMENTS: Record<string, DocumentShape> = {
  statements: {
    type: 'statement',
    path: (doc) => `/statement/${doc.slug}`,
    title: (doc) => str(doc.title),
    summary: (doc) => str(doc.description) || str(doc.lead),
    label: (doc) => ['Statement', shortDate(doc.date as string, doc.datePrecision as string)].filter(Boolean).join(' · '),
  },
  letters: {
    type: 'letter',
    path: (doc) => `/letter/${doc.slug}`,
    title: (doc) => str(doc.title),
    summary: (doc) => str(doc.summary),
    label: (doc) => ['Letter', shortDate(doc.date as string)].filter(Boolean).join(' · '),
  },
  programCaseStudies: {
    type: 'programCaseStudy',
    path: (doc) => `/${doc.section === 'resources' ? 'resources' : 'ready-to-grow'}/${doc.slug}`,
    title: (doc) => str(doc.name),
    summary: (doc) => str(doc.summary) || str(doc.cardSummary),
    label: (doc) => ['Case Study', str(doc.pilotYears)].filter(Boolean).join(' · '),
  },
  employerGuides: {
    type: 'employerGuide',
    path: (doc) => `/resources/${doc.slug}`,
    title: (doc) => str(doc.title),
    summary: (doc) => str(doc.description) || str(doc.subtitle),
    label: () => 'Employer Guide',
  },
  caseStudies: {
    type: 'caseStudy',
    path: (doc) => `/case-study/${doc.slug}`,
    title: (doc) => str(doc.heading),
    summary: (doc) => str(doc.subheading),
    label: () => 'Case Study',
  },
  reports: {
    type: 'report',
    path: (doc) => `/report/${doc.slug}`,
    title: (doc) => str(doc.title),
    summary: () => '',
    label: () => 'Report',
  },
}

function entriesFromDocuments(data: SanitySearchData): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const [key, shape] of Object.entries(DOCUMENTS)) {
    for (const doc of (data[key as keyof SanitySearchData] ?? []) as Doc[]) {
      const title = shape.title(doc)
      if (!doc?.slug || isTestSlug(doc.slug) || !title) continue
      const group = groupForDocument(shape.type, doc.section as string) as SearchGroup
      const text = extractText(doc)
      const summary = shape.summary(doc)
      entries.push({
        id: String(doc._id),
        url: shape.path(doc),
        title,
        group,
        location: `${group} › ${shape.label(doc)}`,
        ...optional('summary', summary),
        ...optional('keywords', keywordsOf(doc.searchKeywords)),
        ...optional('headings', text.headings.filter((heading) => heading !== title)),
        ...optional('body', join(text.body.filter((line) => line !== summary))),
      })
    }
  }
  return entries
}

/** Rows of The Full Record. A row that only points at a statement or letter we already list adds its words to that result. */
function entriesFromNews(items: Doc[], existing: SearchEntry[]): SearchEntry[] {
  const byUrl = new Map(existing.map((entry) => [entry.url, entry]))
  const entries: SearchEntry[] = []
  for (const item of items) {
    const title = str(item.title)
    if (!title) continue
    const link = typeof item.link === 'string' ? item.link.trim() : ''
    const internal = isSitePath(link)
    if (internal && isTestSlug(link.split('/').pop())) continue
    const summary = str(item.summary)
    const words = join([str(item.details), str(item.issue)])
    const keywords = keywordsOf(item.searchKeywords)

    const twin = internal ? byUrl.get(link) : undefined
    if (twin) {
      twin.body = join([twin.body ?? '', summary, words])
      if (keywords.length) twin.keywords = [...(twin.keywords ?? []), ...keywords]
      continue
    }

    const label = [NEWS_KIND[String(item.kind)] ?? 'News', shortDate(item.date as string, item.datePrecision as string)]
      .filter(Boolean)
      .join(' · ')
    entries.push({
      id: String(item._id),
      // Without a link of its own, the row is on News & Statements.
      url: link || '/news',
      title,
      group: 'News & Statements',
      location: `News & Statements › ${label}`,
      ...optional('summary', summary),
      ...optional('keywords', keywords),
      ...optional('body', words),
      ...(link && !internal ? {newTab: true} : {}),
    })
  }
  return entries
}

const isDraft = (doc: {_id?: string} | null | undefined) => /^(drafts|versions)\./.test(doc?._id ?? '')

/** The query asks for published documents only; this drops a draft even if one were passed in. */
function publishedOnly(data: SanitySearchData): SanitySearchData {
  const published: Record<string, unknown> = {...data}
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) published[key] = value.filter((doc) => !isDraft(doc))
  }
  return published as SanitySearchData
}

export function entriesFromSanity(input: SanitySearchData | null | undefined): SanityEntries {
  const data = publishedOnly(input ?? {})
  const hiddenFundIds: string[] = []
  const entries: SearchEntry[] = []
  for (const page of data.pages ?? []) entries.push(...entriesFromPage(page, hiddenFundIds))
  entries.push(...entriesFromDocuments(data))
  entries.push(...entriesFromNews((data.newsItems ?? []) as Doc[], entries))
  return {entries, hiddenFundIds}
}

/** A Studio link → an address, or null when it points nowhere. */
export function hrefForSettingsLink(link: SettingsLink): string | null {
  if (link.isExternalLink) return link.url?.trim() || null
  const reference = link.reference
  if (!reference?.slug) return null
  const {_type: type, slug, section} = reference
  if (type === 'page') return slug === '/' ? '/' : `/${slug}`
  if (type === 'pdfDocument') return `/reports/${slug}.pdf`
  if (type === 'programCaseStudy') return `/${section === 'resources' ? 'resources' : 'ready-to-grow'}/${slug}`
  const prefix = ({caseStudy: 'case-study', employerGuide: 'resources', statement: 'statement', letter: 'letter', report: 'report'} as Record<string, string>)[type ?? '']
  return prefix ? `/${prefix}/${slug}` : null
}

export function popularFromSettings(links: SettingsLink[] | null | undefined): SearchLink[] {
  const popular: SearchLink[] = []
  for (const link of links ?? []) {
    const title = str(link?.title)
    const href = link ? hrefForSettingsLink(link) : null
    if (!title || !href) continue
    const outside = !isSitePath(href)
    // Links to the Donate page stay in the same tab, as everywhere on the site.
    popular.push({title, href, ...(outside && link.target === '_blank' ? {newTab: true} : outside && /mboldenaction\.org/.test(href) ? {newTab: true} : {})})
  }
  return popular.slice(0, 6)
}
