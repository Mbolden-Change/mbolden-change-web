import { cache } from 'react';
import { client } from '@/sanity/lib/client';
import { REPORT_QUERY } from '@/sanity/lib/queries';
import { Report } from '@/sanity/types';

export const getReport = cache(async (slug: string) => {
  const report = await client.fetch(REPORT_QUERY, { slug });
  if (!report) return null;
  return report as Report;
});