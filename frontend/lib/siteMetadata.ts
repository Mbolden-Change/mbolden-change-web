import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_ORIGIN } from './organizationJsonLd';

// Link-preview defaults. A page that sets its own description repeats these
// with its own text, since Next.js replaces openGraph and twitter whole.
const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'mBOLDen Change social banner',
};

export function openGraphFor({
  title = 'mBOLDen Change',
  description = SITE_DESCRIPTION,
  path = '',
}: { title?: string; description?: string; path?: string } = {}): Metadata['openGraph'] {
  return {
    title,
    description,
    url: `${SITE_ORIGIN}${path}`,
    siteName: 'mBOLDen Change',
    images: [OG_IMAGE],
    type: 'website',
  };
}

export function twitterFor({
  title = 'mBOLDen Change',
  description = SITE_DESCRIPTION,
}: { title?: string; description?: string } = {}): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title,
    description,
    images: [OG_IMAGE.url],
  };
}

/** Tab title, description and link previews for a page with its own description, matching app/[slug]. */
export function shareMetadata(title: string, description: string | undefined, path: string): Metadata {
  if (!description) return { title };
  const shareTitle = `${title} | mBOLDen Change`;
  return {
    title,
    description,
    openGraph: openGraphFor({ title: shareTitle, description, path }),
    twitter: twitterFor({ title: shareTitle, description }),
  };
}
