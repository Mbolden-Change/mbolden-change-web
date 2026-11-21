import {sanityFetch} from '@/sanity/lib/fetch'
import {getAllPosts} from '@/lib/substackPosts/posts'
import {getActionEntries} from './actionSource'
import {assembleIndex} from './buildIndex'
import {SEARCH_INDEX_QUERY, type SanitySearchData} from './sanitySource'
import type {SearchIndex} from './types'

async function quietly<T>(load: () => Promise<T>, fallback: T, what: string): Promise<T> {
  try {
    return await load()
  } catch (error) {
    console.error(`Search index: ${what} could not be loaded`, error)
    return fallback
  }
}

/**
 * The whole search index. Studio content carries the Sanity cache tag, so the
 * publish webhook refreshes it; Substack and mBOLDen Action refresh hourly.
 * One source failing leaves the others searchable.
 */
export async function getSearchIndex(): Promise<SearchIndex> {
  const [sanity, posts, action] = await Promise.all([
    quietly(() => sanityFetch<SanitySearchData>(SEARCH_INDEX_QUERY), null, 'Studio content'),
    quietly(() => getAllPosts(), [], 'Substack posts'),
    getActionEntries(),
  ])
  return assembleIndex({sanity, posts, action})
}
