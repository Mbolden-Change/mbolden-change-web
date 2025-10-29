import React from 'react';
import type { Header as HeaderType } from '@/sanity/types';

type Props = { header?: HeaderType | null; siteUrl: string };

function toAbsolute(path?: string, siteUrl?: string) {
  if (!path || !siteUrl) return path || undefined;
  try { return new URL(path, siteUrl).toString(); } catch { return path; }
}

function normalizeRaw(raw?: string) {
  if (!raw) return '';
  const r = raw.trim();
  if (/^https?:\/\//i.test(r)) return r;
  if (/^\/\//.test(r)) { const trimmed = r.replace(/^\/+/, ''); return '//' + trimmed; }
  if (/^\/+/.test(r)) return '/' + r.replace(/^\/+/, '');
  return '/' + r;
}

function safeString(value: unknown): string {
  if (!value && value !== '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const v: any = value;
    if (typeof v.slug === 'object' && typeof v.slug?.current === 'string') return v.slug.current;
    if (typeof v.slug === 'string') return v.slug;
    if (typeof v.url === 'string') return v.url;
    if (typeof v._ref === 'string') return '';
  }
  return '';
}

export default function HeaderStructuredData({ header, siteUrl }: Props) {
  if (!header || !siteUrl) return null;

  // const navItems = (header.navigationLinks || []).map((l: any) => {
  //   const raw = safeString(l.resolvedUrl) || safeString(l.url) || safeString(l.reference?.slug) || safeString(l.reference);
  //   const path = normalizeRaw(raw);
  //   return { "@type": "SiteNavigationElement", name: safeString(l.title), url: toAbsolute(path, siteUrl) || siteUrl };
  // });
  const navItems = (header.navigationLinks || []).map((l: any) => {
    const raw = safeString(l.url) || safeString(l.reference?.slug) || safeString(l.reference);
    const path = normalizeRaw(raw);
    return { "@type": "SiteNavigationElement", name: safeString(l.title), url: toAbsolute(path, siteUrl) || siteUrl };
  });

  if (header.donateCTA && header.donateCTA.buttonLink) {
    const donateLink = header.donateCTA.buttonLink as any;
    //const raw = safeString(donateLink.resolvedUrl) || safeString(donateLink.url) || safeString(donateLink.reference?.slug) || safeString(donateLink.reference);
       const raw = safeString(donateLink.url) || safeString(donateLink.reference?.slug) || safeString(donateLink.reference);

    const path = normalizeRaw(raw);
    navItems.push({ "@type": "SiteNavigationElement", name: safeString(header.donateCTA.text) || "Donate", url: toAbsolute(path, siteUrl) || siteUrl });
  }

  const nav = { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Primary Navigation", url: `${siteUrl}header`, hasPart: navItems };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nav) }} />
  );
}