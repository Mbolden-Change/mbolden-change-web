'use client'

import {useEffect} from 'react'
import {gaEvent} from '@/lib/ga'

/** Sends one Google Analytics event when the page it sits on is viewed. */
export default function GaEvent({name}: {name: string}) {
  useEffect(() => {
    gaEvent(name)
  }, [name])
  return null
}
