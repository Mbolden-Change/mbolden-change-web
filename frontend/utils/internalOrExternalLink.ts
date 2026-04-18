import type { ReferenceType } from '@/components/atoms/Link';
import type { InternalOrExternalLink } from '@/sanity/types';

/**
 * Internal link references from GROQ include `slug` when expanded; this narrows the union.
 */
export function getReferenceWithSlug(
  link?: InternalOrExternalLink,
): ReferenceType | undefined {
  if (!link?.reference || !('slug' in link.reference)) return undefined;
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
  return !!(link.isExternalLink ? link.url : getReferenceWithSlug(link));
}
