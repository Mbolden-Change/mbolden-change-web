import type { ReferenceType } from "@/components/atoms/Link";
import type { InternalOrExternalLink } from "@/sanity/types";

/**
 * Internal link references from GROQ include `slug` when expanded; this narrows the union.
 */
export function getReferenceWithSlug(
  link?: InternalOrExternalLink,
): ReferenceType | undefined {
  if (!link?.reference || !("slug" in link.reference)) return undefined;
  return link.reference as ReferenceType;
}

/**
 * True when a link has a label and a usable destination: external URL, or internal
 * reference with slug. Same condition `ButtonComponent` uses to render `LinkAtom`
 * instead of a plain `<button>`.
 */
export function isRenderableInternalOrExternalLink(
  link?: InternalOrExternalLink,
): boolean {
  if (!link?.title) return false;
  if (link.anchor?.trim() || link.url?.startsWith("#")) return true;
  return !!(link.isExternalLink ? link.url : getReferenceWithSlug(link));
}

/** A path on this site, such as /donate#gateway-fund (not //example.com). */
export function isSitePath(url?: string | null): boolean {
  return Boolean(url?.startsWith("/") && !url.startsWith("//"));
}

/** The Donate page, with or without a fund's link ID, such as /donate#gateway-fund. */
export function isDonatePath(url?: string | null): boolean {
  return /^\/donate(?:[/?#]|$)/.test(url ?? "");
}

/**
 * New tab only for an external link set to open in one. Links to the Donate
 * page stay in the same tab, so a fund's form opens there.
 */
export function opensInNewTab(
  link?: Pick<InternalOrExternalLink, "isExternalLink" | "target" | "url"> | null,
): boolean {
  return Boolean(link?.isExternalLink && link.target === "_blank" && !isDonatePath(link.url));
}
