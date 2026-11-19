import {cache} from 'react'
import archive from '@/content/substack-archive.json'
import {FEED_REVALIDATE_SECONDS} from './config'
import {
  SUBSTACK_ORIGIN,
  buildPost,
  newestFirst,
  parseFeed,
  sitePostPath,
  type SubstackArchivePost,
} from './core'

export type SubstackPost = SubstackArchivePost

/** What a post card shows. */
export type PostCard = {
  slug: string
  href: string
  title: string
  /** ISO date and time, for the <time> element. */
  date: string
  dateLabel: string
  excerpt: string
  image?: {src: string; alt: string}
}

const ARCHIVED = (archive as {posts: SubstackPost[]}).posts

/** Overridable so a failing feed can be tested (see the PR checks). */
const feedUrl = () => process.env.SUBSTACK_FEED_URL || `${SUBSTACK_ORIGIN}/feed`

/**
 * Posts in the feed that the archive file doesn't have yet, so a new post
 * shows up without a deploy. Any problem with the feed means none.
 */
async function newPostsFromFeed(): Promise<SubstackPost[]> {
  try {
    const response = await fetch(feedUrl(), {
      headers: {accept: 'application/rss+xml'},
      next: {revalidate: FEED_REVALIDATE_SECONDS, tags: ['substack']},
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return []
    const items = parseFeed(await response.text())
    const archived = new Set(ARCHIVED.map((post) => post.slug))
    const known = [...archived, ...items.map((item) => item.slug)]
    return items
      .filter((item) => !archived.has(item.slug))
      .map((item) => buildPost(item, known).post)
      .filter((post) => post.title && post.date && post.html)
  } catch {
    return []
  }
}

/** Every post, newest first: the archive file plus anything newer in the feed. */
export const getAllPosts = cache(async (): Promise<SubstackPost[]> => {
  return newestFirst([...(await newPostsFromFeed()), ...ARCHIVED])
})

export async function getPost(slug: string): Promise<SubstackPost | null> {
  return (await getAllPosts()).find((post) => post.slug === slug) ?? null
}

/** Slugs in the archive file, for pages built ahead of time. */
export const archivedSlugs = () => ARCHIVED.map((post) => post.slug)

/** "November 13, 2026", by the calendar in California, where we publish. */
export function formatPostDate(date: string): string {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}

export function toPostCard(post: SubstackPost): PostCard {
  return {
    slug: post.slug,
    href: sitePostPath(post.slug),
    title: post.title,
    date: post.date,
    dateLabel: formatPostDate(post.date),
    excerpt: post.excerpt,
    // Substack rarely has alt text for a cover; the title beside it says what the card is.
    image: post.coverImage ? {src: post.coverImage.url, alt: post.coverImage.alt ?? ''} : undefined,
  }
}

/** The three posts published before this one; past the oldest, it carries on from the newest. */
export function morePosts(posts: SubstackPost[], slug: string, count = 3): SubstackPost[] {
  const index = posts.findIndex((post) => post.slug === slug)
  const others = posts.filter((post) => post.slug !== slug)
  if (index < 0) return others.slice(0, count)
  return [...others.slice(index), ...others.slice(0, index)].slice(0, count)
}

// Widths the site's image optimizer serves (Next.js defaults).
const IMAGE_WIDTHS = [640, 828, 1080, 1920]

/**
 * Points a post's images at the site's image optimizer, which fetches them
 * from Substack's CDN. Visitors' browsers then load them from our own
 * address, in the right size for their screen.
 */
export function optimizeImages(html: string): string {
  return html.replace(/<img src="([^"]+)"/g, (_match, escaped: string) => {
    const source = escaped.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    const at = (width: number) => `/_next/image?url=${encodeURIComponent(source)}&amp;w=${width}&amp;q=75`
    const srcset = IMAGE_WIDTHS.map((width) => `${at(width)} ${width}w`).join(', ')
    return `<img src="${at(1080)}" srcset="${srcset}" sizes="(max-width: 760px) 100vw, 680px"`
  })
}
