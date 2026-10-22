import { cache } from 'react';
import { Footer } from '@/sanity/types';
import { FOOTER_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/fetch';

export const getFooter = cache(async () => {
  const footer = await sanityFetch<Footer>(FOOTER_QUERY);

  if (!footer) return [];

  return footer;
});
