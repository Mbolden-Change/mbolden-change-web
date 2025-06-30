import { cache } from 'react';
import { client } from '@/sanity/lib/client';
import { CASESTUDY_QUERY } from '@/sanity/lib/queries';
import { CaseStudy } from '@/sanity/types';

export const getCaseStudy = cache(async (slug: string) => {
    const caseStudy = await client.fetch(CASESTUDY_QUERY, { slug });
    if (!caseStudy) return null;
    return caseStudy as CaseStudy;
})