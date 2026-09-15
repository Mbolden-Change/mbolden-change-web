/**
 * Walk page-builder content (and nested tabs) for FAQ blocks.
 * Used to decide whether FAQPage JSON-LD may be emitted.
 */

import type {FaqPair} from './guards'

type ContentBlock = {
  _type?: string
  items?: FaqPair[] | null
  tabs?: Array<{content?: ContentBlock[] | null} | null> | null
}

export function collectFaqPairsFromPageBuilder(
  content: ContentBlock[] | null | undefined,
): FaqPair[] {
  const pairs: FaqPair[] = []

  const walk = (blocks: ContentBlock[] | null | undefined) => {
    if (!blocks?.length) return
    for (const block of blocks) {
      if (!block) continue
      if (block._type === 'faq' && Array.isArray(block.items)) {
        for (const item of block.items) {
          if (item) pairs.push(item)
        }
      }
      if (block._type === 'tabsContainer' && Array.isArray(block.tabs)) {
        for (const tab of block.tabs) {
          walk(tab?.content ?? undefined)
        }
      }
    }
  }

  walk(content)
  return pairs
}

/** First N plain-text characters from Sanity portable text blocks. */
export function portableTextToPlain(
  blocks: unknown[] | null | undefined,
  maxLength = 300,
): string {
  if (!Array.isArray(blocks)) return ''
  const parts: string[] = []

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue
    const b = block as {
      _type?: string
      children?: Array<{text?: string}>
    }
    if (b._type !== 'block' || !Array.isArray(b.children)) continue
    const text = b.children.map((c) => c?.text ?? '').join('')
    if (text.trim()) parts.push(text.trim())
    if (parts.join(' ').length >= maxLength) break
  }

  const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (joined.length <= maxLength) return joined
  return `${joined.slice(0, maxLength - 1).trimEnd()}…`
}

/** Prefer explicit CMS date, then created, then updated. */
export function resolvePublishedDate(doc: {
  date?: string | null
  _createdAt?: string | null
  _updatedAt?: string | null
}): string | null {
  return doc.date || doc._createdAt || doc._updatedAt || null
}
