import type {IframeHTMLAttributes} from 'react'

/** A Zeffy form as set in Studio: its kind and the last part of its address. */
export type ZeffyFormRef = {
  kind?: 'donation-form' | 'peer-to-peer' | string | null
  id?: string | null
}

/** The legacy attributes on Zeffy's own iframe, spelled as Zeffy's embed code has them. */
export const ZEFFY_IFRAME_ATTRS = {
  allowpaymentrequest: 'true',
  allowtransparency: 'true',
} as unknown as IframeHTMLAttributes<HTMLIFrameElement>

export const ZEFFY_SCRIPT_SRC = 'https://www.zeffy.com/embed/v2/zeffy-embed.js'

function parts(form?: ZeffyFormRef | null) {
  const id = form?.id?.trim()
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return null
  const kind = form?.kind === 'peer-to-peer' ? 'peer-to-peer' : 'donation-form'
  return {kind, id}
}

/** The form's own page on Zeffy, for “Form not loading? Give on Zeffy”. */
export function zeffyPageUrl(form?: ZeffyFormRef | null) {
  const p = parts(form)
  return p ? `https://www.zeffy.com/en-US/${p.kind}/${p.id}` : null
}

/** The path Zeffy's embed script reads from data-form-url. */
export function zeffyEmbedPath(form?: ZeffyFormRef | null) {
  const p = parts(form)
  return p ? `/embed/${p.kind}/${p.id}` : null
}

/** The embed address, for an iframe without the script. */
export function zeffyEmbedSrc(form?: ZeffyFormRef | null) {
  const path = zeffyEmbedPath(form)
  return path ? `https://www.zeffy.com${path}` : null
}
