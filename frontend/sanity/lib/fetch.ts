import type { QueryParams } from 'next-sanity';
import { client } from './client';
import { protectEins } from '@/lib/ein';

/** Tag on every cached Sanity fetch; /api/revalidate clears it on publish. */
export const SANITY_TAG = 'sanity';

// Safety net if the publish webhook is missing or fails.
const REVALIDATE_SECONDS = 60;

// Cached results are refreshed from the live API rather than the CDN, so a
// refresh straight after a publish can't pick up the previous version.
const liveClient = client.withConfig({ useCdn: false });

/**
 * Fetch for content the site caches between requests (pages, header,
 * footer): cached by Next.js, refreshed as soon as anything is published in
 * Studio, and at most every minute otherwise.
 */
export async function sanityFetch<T = unknown>(query: string, params: QueryParams = {}) {
  const result = await liveClient.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG] },
  });
  // EINs can't be turned into phone links on iPhones (see lib/ein.ts).
  return protectEins(result);
}
