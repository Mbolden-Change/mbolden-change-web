import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { PAGE_QUERY } from '@/sanity/lib/queries';
import { Page } from '@/sanity/types';
import { resolvePointOfViewBlocks } from './pointOfView';

export const getPage = cache(async (slug: string) => {
  const page = await sanityFetch(PAGE_QUERY, { slug });

  if (!page) {
    return null;
  }
  // Point of View cards are looked up on Substack here, on the server.
  const content = await resolvePointOfViewBlocks((page as Page).content);
  return { ...(page as Page), content } as Page;
});
