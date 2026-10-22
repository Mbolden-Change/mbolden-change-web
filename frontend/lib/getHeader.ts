import { cache } from 'react';
import { Header } from '@/sanity/types';
import { HEADER_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/fetch';

export const getHeader = cache(async () => {
  const header = await sanityFetch<Header>(HEADER_QUERY);

  if (!header) return [];

  return header;
});
