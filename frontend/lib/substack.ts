/**
 * Server-side lookups of our Substack posts for the Point of View block.
 * Responses are cached for a day, so the cards refresh daily without a
 * request to Substack on every page view. Visitors never load anything from
 * Substack except through our own image optimizer.
 */

export const SUBSTACK_HOST = 'mboldenchange.substack.com'
const SUBSTACK_ORIGIN = `https://${SUBSTACK_HOST}`
const ONE_DAY = 60 * 60 * 24

/** Where Substack serves cover photos; also allowed in next.config.ts. */
export const SUBSTACK_IMAGE_HOSTS = [
  'substack-post-media.s3.amazonaws.com',
  'substackcdn.com',
  'bucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com',
]

export type SubstackPost = {
  url: string
  title?: string
  subtitle?: string
  /** A cover photo on an allowed host, or undefined (never the publication logo). */
  image?: string
}

/** "https://mboldenchange.substack.com/p/slug" → "slug"; anything else → null. */
export function substackPostSlug(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== SUBSTACK_HOST) return null
    const match = url.pathname.match(/^\/p\/([^/]+)\/?$/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

function allowedImage(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && SUBSTACK_IMAGE_HOSTS.includes(url.hostname) ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
  return text || undefined
}

function decodeEntities(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

async function fetchCached(url: string, accept: string) {
  try {
    const response = await fetch(url, {
      headers: {accept},
      next: {revalidate: ONE_DAY, tags: ['substack']},
    })
    return response.ok ? response : null
  } catch {
    return null
  }
}

/** Reads a meta tag's content from a page's HTML. */
function meta(html: string, property: string) {
  const tag = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`, 'i'))?.[0]
  return tag?.match(/content=["']([^"']*)["']/i)?.[1]
}

/**
 * One picked post, by its URL: title, subtitle and cover from Substack's post
 * API. If that fails, the title and subtitle come from the post page itself,
 * without a photo, since its share image can be the publication logo.
 */
export async function getSubstackPost(postUrl: string): Promise<SubstackPost | null> {
  const slug = substackPostSlug(postUrl)
  if (!slug) return null
  const url = `${SUBSTACK_ORIGIN}/p/${encodeURIComponent(slug)}`

  const api = await fetchCached(`${SUBSTACK_ORIGIN}/api/v1/posts/${encodeURIComponent(slug)}`, 'application/json')
  if (api) {
    try {
      const post = (await api.json()) as {title?: unknown; subtitle?: unknown; cover_image?: unknown}
      if (clean(post.title)) {
        return {url, title: clean(post.title), subtitle: clean(post.subtitle), image: allowedImage(post.cover_image)}
      }
    } catch {
      // Fall through to the post page.
    }
  }

  const page = await fetchCached(url, 'text/html')
  if (!page) return null
  const html = await page.text()
  const title = clean(meta(html, 'og:title'))
  return title ? {url, title, subtitle: clean(meta(html, 'og:description'))} : null
}

function rssField(item: string, name: string) {
  const raw = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1]
  return raw?.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1')
}

/** The newest posts from the RSS feed, for when no posts are picked. */
export async function getLatestSubstackPosts(count = 3): Promise<SubstackPost[]> {
  const feed = await fetchCached(`${SUBSTACK_ORIGIN}/feed`, 'application/rss+xml')
  if (!feed) return []
  const xml = await feed.text()
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []

  const posts: SubstackPost[] = []
  for (const item of items) {
    const link = clean(rssField(item, 'link'))
    const slug = substackPostSlug(link)
    const title = clean(rssField(item, 'title'))
    if (!slug || !title) continue
    const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i)
    const isImage = enclosure ? /type=["']image\//i.test(enclosure[0]) : false
    posts.push({
      url: `${SUBSTACK_ORIGIN}/p/${encodeURIComponent(slug)}`,
      title,
      subtitle: clean(rssField(item, 'description')),
      image: isImage ? allowedImage(decodeEntities(enclosure![1])) : undefined,
    })
    if (posts.length === count) break
  }
  return posts
}
