'use client'

import {useEffect, useRef, useState} from 'react'

export type RevealPhase = 'static' | 'armed' | 'in'

/**
 * Scroll-in motion for a section. The page renders the finished state
 * ('static'). Once hydrated, a section that is still below the screen is
 * rewound ('armed') and plays ('in') when it scrolls into view. With reduced
 * motion, or without IntersectionObserver, it stays finished.
 */
export function useScrollReveal<T extends Element = HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [phase, setPhase] = useState<RevealPhase>('static')

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setPhase('armed')
    // Play when enough of the section shows, or when it fills 40% of the
    // screen (tall stacked sections on phones).
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.some(
          (entry) =>
            entry.isIntersecting &&
            (entry.intersectionRatio >= threshold ||
              entry.intersectionRect.height >= window.innerHeight * 0.4),
        )
        if (inView) {
          setPhase('in')
          observer.disconnect()
        }
      },
      {threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1]},
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return {ref, phase}
}
