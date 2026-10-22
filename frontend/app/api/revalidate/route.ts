import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_TAG } from '@/sanity/lib/fetch';

/**
 * Sanity webhook: on any publish, unpublish or delete, clears the cached
 * Sanity content so pages, header and footer rebuild with it on their next
 * visit. The request must be signed with SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse('Missing SANITY_REVALIDATE_SECRET', { status: 500 });
  }

  try {
    // Waits for the Content Lake to catch up so the refresh sees the change.
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    revalidateTag(SANITY_TAG);
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
  } catch (error) {
    console.error('Sanity revalidate webhook failed', error);
    return new NextResponse('Could not revalidate', { status: 500 });
  }
}
