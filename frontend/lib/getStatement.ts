import { cache } from 'react';
import { sanityFetch } from '@/sanity/lib/fetch';
import { STATEMENT_QUERY } from '@/sanity/lib/queries';
import type { StatementPageData } from '@/components/v2/news/StatementPage';

export type StatementData = StatementPageData & {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  description?: string | null;
};

export const getStatement = cache(async (slug: string) => {
  const statement = await sanityFetch<StatementData | null>(STATEMENT_QUERY, { slug });
  return statement ?? null;
});
