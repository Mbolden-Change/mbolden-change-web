/**
 * iPhones turn an EIN such as 20-4683289 into a phone link, even with
 * format-detection off. A non-breaking hyphen (U+2011) looks the same but
 * isn't read as a phone number, so every EIN in our content is shown with one.
 */
const EIN = /(?<![\d\-‑])(\d{2})-(\d{7})(?![\d\-‑])/g
const NON_BREAKING_HYPHEN = '‑'

/**
 * Bill numbers such as "SB 33" or "AB 1357" stay on one line: the space
 * becomes a non-breaking space. Covers California bills and resolutions
 * (AB, SB, ACA, SCA, ACR, SCR, AJR, SJR) and federal ones (HR, H.R., S.).
 */
const BILL = /(?<![\w.])(AB|SB|ACA|SCA|ACR|SCR|AJR|SJR|HR|H\.R\.|S\.)[ \t]+(\d{1,5})\b/g
const NO_BREAK_SPACE = '\u00a0'

// Identifiers, links and addresses keep their exact characters.
const SKIP_KEYS = new Set(['_id', '_ref', '_key', '_type', '_rev', 'current', 'url', 'href', 'link'])
const LINKISH = /^(https?:|mailto:|tel:|\/)/i

export function protectEinText(text: string) {
  return text.replace(EIN, `$1${NON_BREAKING_HYPHEN}$2`)
}

export function keepBillNumbersTogether(text: string) {
  return text.replace(BILL, `$1${NO_BREAK_SPACE}$2`)
}

/** Returns a copy of fetched content with every EIN protected and every bill number kept on one line. */
export function protectEins<T>(value: T): T {
  return walk(value) as T
}

function walk(value: unknown): unknown {
  if (typeof value === 'string') return LINKISH.test(value) ? value : keepBillNumbersTogether(protectEinText(value))
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, SKIP_KEYS.has(key) && typeof entry === 'string' ? entry : walk(entry)]),
    )
  }
  return value
}
