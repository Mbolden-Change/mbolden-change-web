import { track } from '@vercel/analytics';
import { gaEvent } from './ga';

export type AnalyticsLocation =
  | 'header'
  | 'hero'
  | 'impact-hero'
  | 'footer'
  | 'popup'
  | 'text-media'
  | string;

type LinkLike = {
  title?: string | null;
  url?: string | null;
  text?: string | null;
};

/** Heuristic for CMS CTAs that point at donate without a dedicated donate field. */
export function isDonateCta(link?: LinkLike | null): boolean {
  if (!link) return false;
  const haystack = `${link.title ?? ''} ${link.url ?? ''} ${link.text ?? ''}`.toLowerCase();
  return haystack.includes('donate');
}

/** `placement` tells apart two buttons in the same location, such as the phone header's Donate. */
export function trackDonateClick(location: AnalyticsLocation, extra?: { placement: string }) {
  track('Donate Click', { location, ...extra });
  // Google Analytics gets the same click: the placement, or the location where there is none.
  gaEvent('donate_click', { placement: extra?.placement ?? location });
}

export function trackNewsletterSignup(location: AnalyticsLocation) {
  track('Newsletter Signup', { location });
}

// Site search. The query is sent only when a search finds nothing, so we can
// see what people look for and don't find. Clicks never carry the query.
const reportedQueries = new Set<string>();

/** Lowercased, trimmed and cut to 60 characters. */
export function normalizeSearchQuery(query: string) {
  return query.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** Once per query per visit. */
export function trackSearchNoResults(query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized || reportedQueries.has(normalized)) return;
  reportedQueries.add(normalized);
  track('Search No Results', { query: normalized });
}

export function trackSearchResultClick(group: string) {
  track('Search Result Click', { group });
}
