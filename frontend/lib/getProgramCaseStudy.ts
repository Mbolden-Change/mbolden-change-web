import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { PROGRAM_CASE_STUDY_QUERY } from '@/sanity/lib/queries';
import type { ProgramCaseStudy } from '@/sanity/types';

export type AdvancementContact = { name?: string; title?: string; email?: string } | null;

/** The query adds the PDF's address and the Advancement contact from Site Settings. */
export type ProgramCaseStudyData = Omit<ProgramCaseStudy, 'nextPhase'> & {
  nextPhase?: NonNullable<ProgramCaseStudy['nextPhase']> & { pdfSlug?: string | null };
  contact?: AdvancementContact;
};

export const getProgramCaseStudy = cache(async (slug: string) => {
  const caseStudy = await sanityFetch<ProgramCaseStudyData | null>(PROGRAM_CASE_STUDY_QUERY, { slug });
  return caseStudy ?? null;
});
