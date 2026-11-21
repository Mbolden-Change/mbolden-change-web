'use client'

import {Analytics, type BeforeSendEvent} from '@vercel/analytics/next'

/** What someone typed into /search?q=… stays out of page-view records. */
export function withoutSearchQuery(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url)
    if (url.pathname !== '/search' || !url.search) return event
    url.search = ''
    return {...event, url: url.toString()}
  } catch {
    return event
  }
}

/** Vercel Web Analytics, with search queries removed from page addresses. */
export default function SiteAnalytics() {
  return <Analytics beforeSend={withoutSearchQuery} />
}
