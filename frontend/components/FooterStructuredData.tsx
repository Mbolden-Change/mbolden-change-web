import React from 'react';
import type { Footer as FooterType } from '@/sanity/types';

type Props = {
  footer?: FooterType | null;
  siteUrl: string;
};

function toAbsolute(path?: string, siteUrl?: string) {
  if (!path || !siteUrl) return path || undefined;
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return path;
  }
}

// normalize link input:
// - collapse multiple leading slashes to a single leading slash for relative paths
// - preserve protocol-relative (//host) and absolute (http/https) URLs
// - if a slug like "about" is provided, prepend a single "/"
function normalizeRaw(raw?: string) {
  if (!raw) return '';
  const r = raw.trim();

  // absolute http(s) URL -> keep as-is
  if (/^https?:\/\//i.test(r)) return r;

  // protocol-relative, collapse any extra slashes to exactly two
  if (/^\/\//.test(r)) {
    const trimmed = r.replace(/^\/+/, ''); // remove all leading slashes
    return '//' + trimmed;
  }

  // relative path starting with one or more slashes -> ensure single leading slash
  if (/^\/+/.test(r)) {
    return '/' + r.replace(/^\/+/, '');
  }

  // bare slug (e.g. 'about') -> prepend single slash
  return '/' + r;
}

// safe extractor: accept string, object with slug/slug.current, object with url, or other shapes
function safeString(value: unknown): string {
  if (!value && value !== '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const v: any = value;
    if (typeof v === 'object' && typeof v.slug === 'object' && typeof v.slug?.current === 'string') {
      return v.slug.current;
    }
    if (typeof v.slug === 'string') return v.slug;
    if (typeof v.url === 'string') return v.url;
    if (typeof v._ref === 'string') return ''; // reference only -> nothing resolvable here
  }
  return '';
}

// Normalize a phone string to E.164 when possible (assumes US default if 10 digits)
function normalizePhone(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  // If already starts with a plus and digits, return raw trimmed
  const plusNormalized = raw.trim();
  if (/^\+\d{7,}$/.test(plusNormalized)) return plusNormalized;
  // otherwise return undefined to avoid emitting malformed numbers
  return undefined;
}

export default function FooterStructuredData({ footer, siteUrl }: Props) {
  if (!footer || !siteUrl) return null;

  const navItems = (footer.columnCategories || []).flatMap((cat) =>
    (cat.links || []).map((l: any) => {
      // use safeString to avoid TS errors for various shapes (string, object, reference)
      const raw =
        safeString(l.resolvedUrl) ||
        safeString(l.url) ||
        safeString(l.reference?.slug) ||
        safeString(l.reference);
      const path = normalizeRaw(raw);
      return {
        "@type": "SiteNavigationElement",
        name: safeString(l.title),
        url: toAbsolute(path, siteUrl) || siteUrl
      };
    })
  );

  const sameAs = (footer.socialLinks || [])
    .map((s: any) => safeString(s.resolvedUrl) || safeString(s.url) || safeString(s))
    .filter(Boolean)
    .map((u: string) => {
      const normalized = normalizeRaw(u);
      return toAbsolute(normalized, siteUrl) || normalized;
    });

  // Use primaryLogoUrl (queried as primaryLogo.asset->url) as the canonical logo source.
  // We intentionally drop the `.asset` fallback because the GROQ query should return
  // `primaryLogoUrl` when available. This keeps the structured data predictable.
  const logo = safeString((footer as any).primaryLogoUrl);

  const orgName = safeString((footer as any).organizationInfo?.name) || safeString((footer as any).title);

  // parse organization info for richer JSON-LD
  const orgInfo = (footer as any).organizationInfo || {};
  const addressRaw = safeString(orgInfo.address);
  const contactRaw = safeString(orgInfo.contact);
  const nonProfitDisclaimer = safeString(orgInfo.nonProfitDisclaimer);

  const phoneMatch = contactRaw.match(/(\+?\d[\d\s().-]{6,}\d)/);
  const emailMatch = contactRaw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const einMatch = nonProfitDisclaimer.match(/EIN[:\s]*([0-9-]+)/i);

  let postalAddress: Record<string, unknown> | undefined;
  if (addressRaw) {
    const lines = addressRaw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
    const streetAddress = lines[0] || addressRaw;
    let addressLocality: string | undefined;
    let addressRegion: string | undefined;
    let postalCode: string | undefined;

    if (lines[1]) {
      // Try to parse "City, ST ZIP"
      const m = lines[1].match(/^(.+?),\s*([A-Za-z]{2})\s*(\d{5}(?:-\d{4})?)?/);
      if (m) {
        addressLocality = m[1].trim();
        addressRegion = m[2].trim();
        postalCode = m[3] ? m[3].trim() : undefined;
      }
    }

    postalAddress = {
      "@type": "PostalAddress",
      streetAddress,
      ...(addressLocality ? { addressLocality } : {}),
      ...(addressRegion ? { addressRegion } : {}),
      ...(postalCode ? { postalCode } : {})
    };
  }

  const contactPoint: Array<Record<string, unknown>> = [];
  if (phoneMatch) {
    const normalized = normalizePhone(phoneMatch[0]);
    if (normalized) {
      contactPoint.push({
        "@type": "ContactPoint",
        telephone: normalized,
        contactType: "customer support"
      });
    } else {
      // fallback: include raw phone if normalization failed
      contactPoint.push({
        "@type": "ContactPoint",
        telephone: phoneMatch[0].replace(/\s+/g, ' ').trim(),
        contactType: "customer support"
      });
    }
  }
  if (emailMatch) {
    contactPoint.push({
      "@type": "ContactPoint",
      email: emailMatch[0].toLowerCase(),
      contactType: "customer support"
    });
  }

  const additionalProperty = einMatch
    ? [
        {
          "@type": "PropertyValue",
          name: "EIN",
          value: einMatch[1]
        }
      ]
    : undefined;

  // Prefer using `identifier` for official identifiers like EIN. Keep additionalProperty for compatibility.
  const identifier = einMatch
    ? {
        "@type": "PropertyValue",
        propertyID: "EIN",
        value: einMatch[1]
      }
    : undefined;

  // If disclaimer mentions 501(c), set nonprofitStatus to the schema.org enum string
  // e.g. "Nonprofit501c3" which is a common value used to indicate 501(c)(3) status.
  let nonprofitStatus: string | undefined;
  if (/501\s*\(?c\)?/i.test(nonProfitDisclaimer)) {
    nonprofitStatus = 'Nonprofit501c3';
  }

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: orgName || "mBOLDen Change", // Fallback to brand name if orgName not available
    url: siteUrl,
    logo: logo ? toAbsolute(logo, siteUrl) : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    address: postalAddress,
    contactPoint: contactPoint.length ? contactPoint : undefined,
    description: nonProfitDisclaimer || undefined,
    identifier: identifier,
    additionalProperty: additionalProperty,
    nonprofitStatus: nonprofitStatus,
    // areaServed: if we parsed a city/locality, include it as an AdministrativeArea
    ...(postalAddress && (postalAddress as any).addressLocality
      ? { areaServed: { "@type": "AdministrativeArea", name: (postalAddress as any).addressLocality } }
      : {})
  };

  const nav = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Footer",
    url: `${siteUrl}footer`,
    hasPart: navItems
  };

  const graph = [org, nav];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
