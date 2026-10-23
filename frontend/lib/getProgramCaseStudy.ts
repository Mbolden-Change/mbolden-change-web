import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { PROGRAM_CASE_STUDY_QUERY } from '@/sanity/lib/queries';
import type { ProgramCaseStudy } from '@/sanity/types';

export type AdvancementContact = { name?: string; title?: string; email?: string } | null;

/** The query adds the PDF's address and the Advancement contact from Site Settings. */
export type ProgramCaseStudyData = Omit<ProgramCaseStudy, 'nextPhase' | 'closing'> & {
  nextPhase?: NonNullable<ProgramCaseStudy['nextPhase']> & { pdfSlug?: string | null };
  closing?: NonNullable<ProgramCaseStudy['closing']> & { pdfSlug?: string | null };
  contact?: AdvancementContact;
};

export type CaseStudySection = 'readyToGrow' | 'resources';

/** A case study in its section, so each address serves only its own section's case studies. */
export const getProgramCaseStudy = cache(async (slug: string, section: CaseStudySection = 'readyToGrow') => {
  const caseStudy = await sanityFetch<ProgramCaseStudyData | null>(PROGRAM_CASE_STUDY_QUERY, { slug, section });
  return caseStudy ?? null;
});
