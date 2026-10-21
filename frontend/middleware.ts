import {NextResponse, type NextRequest} from 'next/server'
import {apiVersion, dataset, projectId} from '@/sanity/env'

/**
 * Serves PDF File documents from our own address, /reports/<address-name>.pdf.
 * The request is rewritten to the file on the Sanity CDN, so the address bar
 * keeps our URL and large files don't pass through a serverless function.
 */
export async function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/reports\/([a-z0-9]+(?:-[a-z0-9]+)*)\.pdf$/)
  if (!match) return NextResponse.next()

  const query = encodeURIComponent(
    '*[_type == "pdfDocument" && slug.current == $slug][0].file.asset->url',
  )
  const slug = encodeURIComponent(JSON.stringify(match[1]))
  const res = await fetch(
    `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}&$slug=${slug}`,
  )
  const url: string | null = res.ok ? (await res.json()).result : null
  if (!url) return NextResponse.next()

  return NextResponse.rewrite(new URL(url))
}

export const config = {
  matcher: '/reports/:file*',
}
