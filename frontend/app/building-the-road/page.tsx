import type {Metadata} from 'next'
import Journey from '@/components/v2/journey/Journey'
import {JOURNEY} from '@/components/v2/journey/journeyData'
import {SITE_ORIGIN} from '@/lib/organizationJsonLd'

const description =
  'Build the road to systemic equity with mBOLDen Change, from where we are today to the future we envision together.'
const shareTitle = `${JOURNEY.title} | mBOLDen Change`
// Stop 1's painting, cropped to the link-preview shape.
const shareImage = {url: '/journey/share.jpg', width: 1200, height: 630, alt: JOURNEY.stops[0].alt}

export const metadata: Metadata = {
  title: JOURNEY.title,
  description,
  openGraph: {
    title: shareTitle,
    description,
    url: `${SITE_ORIGIN}/building-the-road`,
    siteName: 'mBOLDen Change',
    images: [shareImage],
    type: 'website',
  },
  twitter: {card: 'summary_large_image', title: shareTitle, description, images: [shareImage.url]},
}

export default function BuildingTheRoadPage() {
  return (
    <main>
      <Journey />
    </main>
  )
}
