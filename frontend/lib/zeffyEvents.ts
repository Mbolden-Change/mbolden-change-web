/**
 * Donation steps from Zeffy's forms. Each form's iframe posts messages to the
 * page; two of them are counted: reaching the payment step, and the thank-you
 * page after a completed donation. Only the fund goes out. Nothing else from
 * a message (amount, name, email or any other field) is ever read or sent.
 */
import {trackDonationComplete} from './analytics'
import {gaEvent} from './ga'

/** On the element around a Zeffy form: which fund the form is for. */
export const ZEFFY_FUND_ATTR = 'data-zeffy-fund'
/** On the same element: changes each time the form is opened again. */
export const ZEFFY_OPEN_ATTR = 'data-zeffy-open'
/** The main form on the Donate page. */
export const MAIN_FORM_FUND = 'where-needed-most'

type Step = 'payment' | 'complete'

function isZeffyOrigin(origin: string): boolean {
  try {
    const {protocol, hostname} = new URL(origin)
    return protocol === 'https:' && (hostname === 'zeffy.com' || hostname.endsWith('.zeffy.com'))
  } catch {
    return false
  }
}

/** The one step a message stands for, if any. Reads `type` and `step` only. */
function readStep(data: unknown): Step | null {
  let message = data
  if (typeof message === 'string') {
    try {
      message = JSON.parse(message)
    } catch {
      return null
    }
  }
  if (!message || typeof message !== 'object') return null
  const {type, step} = message as {type?: unknown; step?: unknown}
  if (type === 'zeffy-embed:step-changed' && step === 'payment') return 'payment'
  if (type === 'zeffy-embed:thank-you-page-shown') return 'complete'
  return null
}

/** The form a message came from: the Zeffy iframe whose window sent it. */
function findForm(source: MessageEventSource | null) {
  if (!source) return null
  for (const holder of Array.from(document.querySelectorAll<HTMLElement>(`[${ZEFFY_FUND_ATTR}]`))) {
    for (const frame of Array.from(holder.querySelectorAll('iframe'))) {
      if (frame.contentWindow !== source) continue
      const fund = holder.getAttribute(ZEFFY_FUND_ATTR)
      if (!fund) return null
      return {frame, fund, opening: `${fund}:${holder.getAttribute(ZEFFY_OPEN_ATTR) ?? ''}`}
    }
  }
  return null
}

// What each form has already reported since it was last opened.
let reported = new WeakMap<HTMLIFrameElement, {opening: string; steps: Set<Step>}>()

export function handleZeffyMessage(event: MessageEvent) {
  if (!isZeffyOrigin(event.origin)) return
  const step = readStep(event.data)
  if (!step) return
  const form = findForm(event.source)
  if (!form) return

  let record = reported.get(form.frame)
  if (!record || record.opening !== form.opening) {
    record = {opening: form.opening, steps: new Set()}
    reported.set(form.frame, record)
  }
  if (record.steps.has(step)) return
  record.steps.add(step)

  const fund = form.fund
  // gaEvent sends nothing without consent or with Global Privacy Control on.
  if (step === 'payment') {
    gaEvent('zeffy_payment_step', {fund})
    return
  }
  gaEvent('donation_complete', {fund})
  trackDonationComplete(fund)
}

let listeners = 0

/** One listener for the page, however many forms ask for it. Returns the cleanup. */
export function listenForZeffy(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (listeners === 0) window.addEventListener('message', handleZeffyMessage)
  listeners += 1
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    listeners -= 1
    if (listeners === 0) window.removeEventListener('message', handleZeffyMessage)
  }
}

/** For tests. */
export function resetZeffyEventsForTests() {
  if (listeners > 0 && typeof window !== 'undefined') window.removeEventListener('message', handleZeffyMessage)
  listeners = 0
  reported = new WeakMap()
}
