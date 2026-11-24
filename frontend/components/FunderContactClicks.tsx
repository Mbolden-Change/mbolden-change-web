'use client'

import {useEffect} from 'react'
import {funderContactLocation, trackFunderContactClick} from '@/lib/analytics'

/** Site-wide: reports a click on any link marked as a funder contact link. The link itself is untouched. */
export default function FunderContactClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const location = funderContactLocation(event.target)
      if (location) trackFunderContactClick(location)
    }
    // Capture phase, so a handler that stops the click further down can't hide it.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
