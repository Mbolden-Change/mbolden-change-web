'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

const CLOSE_DURATION = 200

export type DialogPhase = 'closed' | 'open' | 'closing'

/**
 * A native modal dialog tied to a Section ID: any link to #section-id opens
 * it, the address with that hash opens it on load, and back and forward open
 * and close it. Escape, the X and a click outside play a short close motion
 * (skipped with reduced motion). Focus goes back to whatever opened it.
 */
export function useHashDialog(sectionId?: string, onClosed?: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed
  const [phase, setPhase] = useState<DialogPhase>('closed')
  const hash = sectionId ? `#${sectionId}` : ''

  const open = useCallback(
    (opener?: HTMLElement | null) => {
      const dialog = dialogRef.current
      if (!dialog || dialog.open) return
      openerRef.current =
        opener ?? (hash ? document.querySelector<HTMLElement>(`a[href="${hash}"]`) : null)
      window.clearTimeout(closeTimer.current)
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
      setPhase('open')
    },
    [hash],
  )

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      dialog.close()
      return
    }
    setPhase('closing')
    closeTimer.current = window.setTimeout(() => dialog.close(), CLOSE_DURATION)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const onClose = () => {
      window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
      setPhase('closed')
      onClosedRef.current?.()
      if (hash && window.location.hash === hash) {
        window.history.replaceState(
          window.history.state,
          '',
          window.location.pathname + window.location.search,
        )
      }
      openerRef.current?.focus()
    }

    // Escape: play the close motion instead of closing at once.
    const onCancel = (event: Event) => {
      event.preventDefault()
      requestClose()
    }

    dialog.addEventListener('close', onClose)
    dialog.addEventListener('cancel', onCancel)

    if (!sectionId) {
      return () => {
        dialog.removeEventListener('close', onClose)
        dialog.removeEventListener('cancel', onCancel)
        window.clearTimeout(closeTimer.current)
        document.documentElement.style.overflow = ''
      }
    }

    // Links that open this dialog announce it.
    const links = document.querySelectorAll<HTMLAnchorElement>(`a[href="${hash}"]`)
    links.forEach((link) => {
      link.setAttribute('aria-haspopup', 'dialog')
      link.setAttribute('aria-controls', sectionId)
    })

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest?.(`a[href="${hash}"]`)
      if (!link) return
      event.preventDefault()
      if (window.location.hash !== hash) {
        window.history.pushState(window.history.state, '', hash)
      }
      open(link as HTMLElement)
    }

    // Back and forward buttons open and close it with the address.
    const onHashChange = () => {
      if (window.location.hash === hash) open()
      else requestClose()
    }

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('hashchange', onHashChange)

    if (window.location.hash === hash) open()

    return () => {
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('hashchange', onHashChange)
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('cancel', onCancel)
      window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
    }
  }, [hash, sectionId, open, requestClose])

  return {dialogRef, phase, open, requestClose, hash}
}
