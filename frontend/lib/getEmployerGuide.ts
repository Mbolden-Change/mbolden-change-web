import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { EMPLOYER_GUIDE_QUERY } from '@/sanity/lib/queries';
import type { EmployerGuideData } from '@/components/v2/resources/EmployerGuide';

export const getEmployerGuide = cache(async (slug: string) => {
  const guide = await sanityFetch<EmployerGuideData | null>(EMPLOYER_GUIDE_QUERY, { slug });
  return guide ?? null;
});
