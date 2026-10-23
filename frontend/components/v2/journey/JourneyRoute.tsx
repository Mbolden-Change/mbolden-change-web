'use client'

import type {ReactNode} from 'react'
import {JourneyRouteContext} from './JourneyOverlay'

/** Tells the Our Vision card to open the journey straight away (on /building-the-road). */
export default function JourneyRoute({children}: {children: ReactNode}) {
  return <JourneyRouteContext.Provider value>{children}</JourneyRouteContext.Provider>
}
