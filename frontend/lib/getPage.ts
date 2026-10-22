import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { PAGE_QUERY } from '@/sanity/lib/queries';
import { Page } from '@/sanity/types';

export const getPage = cache(async (slug: string) => {
  const page = await sanityFetch(PAGE_QUERY, { slug });

  if (!page) {
    return null;
  }
  return page as Page;
});
