import { track } from '@vercel/analytics';

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

export function trackDonateClick(location: AnalyticsLocation) {
  track('Donate Click', { location });
}

export function trackNewsletterSignup(location: AnalyticsLocation) {
  track('Newsletter Signup', { location });
}
