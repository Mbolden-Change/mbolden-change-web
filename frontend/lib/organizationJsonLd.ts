import type { Footer } from '@/sanity/types'

export const SITE_ORIGIN = 'https://www.mboldenchange.org'

export const SITE_DESCRIPTION =
  'mBOLDen CHANGE is a nonprofit organization based in Palo Alto, California, formerly known as My New Red Shoes. We focus on economic support, public education, and systemic equity—through direct cash transfers, public education campaigns, and systems-change initiatives.'

type JsonLd = Record<string, unknown>

/** Fallbacks aligned with production footer CMS (Jul 2026). */
const FALLBACK = {
  email: 'info@mboldenchange.org',
  telephone: '+1-650-241-3911',
  streetAddress: '3790 El Camino Real #1098',
  addressLocality: 'Palo Alto',
  addressRegion: 'CA',
  postalCode: '94306',
  /** Confirmed on live footer disclaimer */
  taxID: '20-4683289',
} as const

function parseUsCityStateZip(line: string) {
  const match = line
    .trim()
    .match(/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  if (!match) return null
  return {
    addressLocality: match[1].trim(),
    addressRegion: match[2],
    postalCode: match[3],
  }
}

function parseAddressFromFooter(address?: string) {
  const lines =
    address
      ?.split('\n')
      .map((line) => line.trim())
      .filter(Boolean) ?? []

  if (lines.length >= 2) {
    const cityStateZip = parseUsCityStateZip(lines[lines.length - 1] ?? '')
    if (cityStateZip) {
      return {
        streetAddress: lines.slice(0, -1).join(', '),
        ...cityStateZip,
      }
    }
  }

  return {
    streetAddress: FALLBACK.streetAddress,
    addressLocality: FALLBACK.addressLocality,
    addressRegion: FALLBACK.addressRegion,
    postalCode: FALLBACK.postalCode,
  }
}

function normalizeTelephone(raw?: string) {
  if (!raw) return FALLBACK.telephone
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return raw.trim()
}

/**
 * Nonprofit / NGO Organization structured data for Google (knowledge panel /
 * organization rich results). Prefer the most specific type: NGO + 501(c)(3).
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function buildOrganizationJsonLd(
  footerData?: Footer | Footer[] | null,
): JsonLd {
  const footer = Array.isArray(footerData) ? undefined : footerData ?? undefined

  const sameAs =
    footer?.socialLinks
      ?.map((link) => link.url)
      .filter((url): url is string => Boolean(url)) ?? []

  const contactLines =
    footer?.organizationInfo?.contact
      ?.split('\n')
      .map((line) => line.trim())
      .filter(Boolean) ?? []

  const email =
    contactLines.find((line) => line.includes('@')) ?? FALLBACK.email
  const telephone = normalizeTelephone(
    contactLines.find((line) => !line.includes('@')),
  )
  const address = parseAddressFromFooter(footer?.organizationInfo?.address)

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: 'mBOLDen CHANGE',
    alternateName: [
      'mBOLDen Change',
      'mboldenchange',
      'My New Red Shoes',
    ],
    url: SITE_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_ORIGIN}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_ORIGIN}/og-image.png`,
    description: SITE_DESCRIPTION,
    email,
    telephone,
    taxID: FALLBACK.taxID,
    address: {
      '@type': 'PostalAddress',
      ...address,
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email,
      telephone,
      areaServed: 'US',
      availableLanguage: ['English'],
    },
    nonprofitStatus: 'https://schema.org/Nonprofit501c3',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    ...(sameAs.length > 0 ? {sameAs} : {}),
  }

  return jsonLd
}
