import {NextResponse} from 'next/server'
import {getSearchIndex} from '@/lib/search/getSearchIndex'

// Built once and kept. The Studio part carries the Sanity cache tag, so the
// publish webhook (/api/revalidate) rebuilds it. Substack and mBOLDen Action
// are looked at again at least hourly.
export const dynamic = 'force-static'
export const revalidate = 3600

/** The search index, as JSON. The browser fetches it the first time someone opens search. */
export async function GET() {
  return NextResponse.json(await getSearchIndex())
}
