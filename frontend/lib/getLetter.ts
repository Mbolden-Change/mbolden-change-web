import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { LETTER_QUERY } from '@/sanity/lib/queries';
import type { LetterPageData } from '@/components/v2/news/LetterPage';

export type LetterData = LetterPageData & { _id: string; _updatedAt?: string };

export const getLetter = cache(async (slug: string) => {
  const letter = await sanityFetch<LetterData | null>(LETTER_QUERY, { slug });
  return letter ?? null;
});
