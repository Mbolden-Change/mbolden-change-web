import {client} from '@/sanity/lib/client'
import {PDF_FILE_URL_QUERY} from '@/sanity/lib/queries'

/**
 * Serves PDF File documents from our own address, /reports/<address-name>.pdf,
 * by streaming the file from the Sanity CDN.
 */
export async function GET(_request: Request, {params}: {params: Promise<{file: string}>}) {
  const {file} = await params
  const match = file.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)\.pdf$/)
  if (!match) return new Response('Not found', {status: 404})

  const slug = match[1]
  const url = await client.fetch<string | null>(PDF_FILE_URL_QUERY, {slug})
  if (!url) return new Response('Not found', {status: 404})

  const upstream = await fetch(url)
  if (!upstream.ok || !upstream.body) return new Response('Not found', {status: 404})

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${slug}.pdf"`,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
