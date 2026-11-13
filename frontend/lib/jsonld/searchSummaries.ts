/**
 * Search summaries for Text & Media pop-ups.
 *
 * A summary is one sentence written for search engines and AI tools. It goes
 * out only as JSON-LD and is never rendered as page text, hidden or not.
 * stripSearchSummaries removes it from the blocks before they render, so it
 * can't reach a component or the data Next.js sends to the browser.
 */

import type {JsonLd, SchemaGuardResult} from './types'
import {ORG_ID, SITE_ORIGIN} from './constants'

export type SearchSummaryItem = {
  headline: string
  subtitle?: string
  summary: string
  sectionId: string
}

type ContentBlock = {
  _type?: string
  headline?: string | null
  subtitle?: string | null
  sectionId?: string | null
  searchSummary?: string | null
  tabs?: Array<{content?: ContentBlock[] | null} | null> | null
}

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * Text & Media blocks that have a search summary, a Section ID and a
 * headline, in page order (including blocks inside tabs).
 */
export function collectSearchSummaries(
  content: readonly unknown[] | null | undefined,
): SearchSummaryItem[] {
  const items: SearchSummaryItem[] = []

  const walk = (blocks: readonly unknown[] | null | undefined) => {
    if (!Array.isArray(blocks)) return
    for (const entry of blocks) {
      if (!entry || typeof entry !== 'object') continue
      const block = entry as ContentBlock
      if (block._type === 'textMedia') {
        const headline = clean(block.headline)
        const summary = clean(block.searchSummary)
        const sectionId = clean(block.sectionId)
        const subtitle = clean(block.subtitle)
        if (headline && summary && sectionId) {
          items.push({headline, summary, sectionId, ...(subtitle ? {subtitle} : {})})
        }
      }
      if (block._type === 'tabsContainer' && Array.isArray(block.tabs)) {
        for (const tab of block.tabs) walk(tab?.content)
      }
    }
  }

  walk(content)
  return items
}

/** The same blocks without `searchSummary`, for rendering. */
export function stripSearchSummaries<T>(content: T): T {
  if (!Array.isArray(content)) return content

  return content.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return entry
    const block = entry as ContentBlock
    if (block._type === 'textMedia' && 'searchSummary' in block) {
      const {searchSummary: _removed, ...rest} = block
      void _removed
      return rest
    }
    if (block._type === 'tabsContainer' && Array.isArray(block.tabs)) {
      return {
        ...block,
        tabs: block.tabs.map((tab) =>
          tab && Array.isArray(tab.content)
            ? {...tab, content: stripSearchSummaries(tab.content)}
            : tab,
        ),
      }
    }
    return entry
  }) as T
}

/**
 * ItemList of CreativeWork, one per summary. Not emitted without summaries.
 * `path` is the page's site-relative path, such as /what-were-tackling.
 */
export function guardSearchSummaryList(
  items: SearchSummaryItem[] | null | undefined,
  page: {title?: string | null; path: string},
): SchemaGuardResult {
  if (!items?.length) {
    return {ok: false, reason: 'ItemList requires at least one search summary'}
  }

  const pageUrl = `${SITE_ORIGIN}${page.path.startsWith('/') ? page.path : `/${page.path}`}`
  const title = clean(page.title)

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(title ? {name: title} : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.headline,
        ...(item.subtitle ? {alternateName: item.subtitle} : {}),
        description: item.summary,
        url: `${pageUrl}#${item.sectionId}`,
        creator: {'@id': ORG_ID},
      },
    })),
  }

  return {ok: true, data}
}
