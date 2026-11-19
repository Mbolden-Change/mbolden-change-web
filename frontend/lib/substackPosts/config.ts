import {SITE_ORIGIN} from '@/lib/organizationJsonLd'
import {sitePostPath, substackPostUrl} from './core'

/**
 * Which copy of a post search engines should treat as the original.
 *
 * 'substack': each post page's canonical link and JSON-LD point to the post
 * on Substack, and post pages stay out of our sitemap.
 * 'site': they point to mboldenchange.org, and post pages join the sitemap.
 *
 * Change this one line to switch.
 */
export const POST_CANONICAL = 'substack' as 'substack' | 'site'

/** The address search engines are told is the original of a post. */
export function canonicalPostUrl(slug: string) {
  return POST_CANONICAL === 'site' ? `${SITE_ORIGIN}${sitePostPath(slug)}` : substackPostUrl(slug)
}

/** Substack's own sign-up form, shown at the end of each post. */
export const SUBSCRIBE_EMBED_URL = 'https://mboldenchange.substack.com/embed'

/** How often the site looks at the feed for new posts, in seconds. */
export const FEED_REVALIDATE_SECONDS = 60 * 60
