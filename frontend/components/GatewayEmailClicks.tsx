'use client'

import {useEffect} from 'react'
import {gatewayEmailLink, trackGatewayEmailClick} from '@/lib/analytics'

/** Site-wide: reports a click on any link to the Gateway Fund email address. The link itself is untouched. */
export default function GatewayEmailClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (gatewayEmailLink(event.target)) trackGatewayEmailClick(window.location.pathname)
    }
    // Capture phase, so a handler that stops the click further down can't hide it.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
