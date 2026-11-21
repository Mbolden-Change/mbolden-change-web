import {sectionAnchor} from './text'

/**
 * Gives a page section an address, such as /about#our-history, so a search
 * result can open it. The id comes from the section's heading; the search
 * index (sanitySource.ts) builds the same one.
 */
export function sectionAnchorProps(heading: string | null | undefined) {
  const id = sectionAnchor(heading)
  return id ? {id, 'data-section-anchor': ''} : {}
}
