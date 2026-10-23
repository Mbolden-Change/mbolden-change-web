'use client'

import {useEffect, useState} from 'react'
import type {RevealPhase} from '../motion/useScrollReveal'
import {formatStat, parseStat} from './lanes'
import shared from './shared.module.scss'

const DURATION = 1600

type CountUpProps = {
  value: string
  phase: RevealPhase
  className?: string
}

/**
 * A stat such as “100%” that counts up from zero when its section plays. The
 * page renders the final value; screen readers always get the final value.
 */
export default function CountUp({value, phase, className}: CountUpProps) {
  const stat = parseStat(value)
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (!stat) return
    if (phase === 'armed') {
      setShown(formatStat(stat, 0))
      return
    }
    if (phase !== 'in') return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(formatStat(stat, stat.number * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setShown(null)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // Re-run only when the phase or the value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, value])

  return (
    <span className={className}>
      <span aria-hidden="true">{shown ?? value}</span>
      <span className={shared.srOnly}>{value}</span>
    </span>
  )
}
