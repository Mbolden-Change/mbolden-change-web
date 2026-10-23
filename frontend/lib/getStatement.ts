import { cache } from 'react';
import { client } from '@/sanity/lib/client';
import { STATEMENT_QUERY } from '@/sanity/lib/queries';
import { Statement } from '@/sanity/types';
import { protectEins } from '@/lib/ein';

export const getStatement = cache(async (slug: string) => {
  const statement = protectEins(await client.fetch(STATEMENT_QUERY, { slug }));
  if (!statement) return null;
  return statement as Statement;
});
