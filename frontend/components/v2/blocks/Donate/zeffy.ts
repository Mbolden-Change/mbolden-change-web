import type {IframeHTMLAttributes} from 'react'

/** A Zeffy donation form as set in Studio: the last part of its address. */
export type ZeffyFormRef = {
  id?: string | null
}

/** The legacy attributes on Zeffy's own iframe, spelled as Zeffy's embed code has them. */
export const ZEFFY_IFRAME_ATTRS = {
  allowpaymentrequest: 'true',
  allowtransparency: 'true',
} as unknown as IframeHTMLAttributes<HTMLIFrameElement>

export const ZEFFY_SCRIPT_SRC = 'https://www.zeffy.com/embed/v2/zeffy-embed.js'

function formId(form?: ZeffyFormRef | null) {
  const id = form?.id?.trim()
  return id && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ? id : null
}

/** The form's own page on Zeffy, for “Form not loading? Give on Zeffy”. */
export function zeffyPageUrl(form?: ZeffyFormRef | null) {
  const id = formId(form)
  return id ? `https://www.zeffy.com/en-US/donation-form/${id}` : null
}

/** The path Zeffy's embed script reads from data-form-url. */
export function zeffyEmbedPath(form?: ZeffyFormRef | null) {
  const id = formId(form)
  return id ? `/embed/donation-form/${id}` : null
}

/** The embed address, for an iframe without the script. */
export function zeffyEmbedSrc(form?: ZeffyFormRef | null) {
  const path = zeffyEmbedPath(form)
  return path ? `https://www.zeffy.com${path}` : null
}
