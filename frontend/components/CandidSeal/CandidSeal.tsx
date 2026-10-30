'use client'

import {useEffect, useRef, useState} from 'react'
import classNames from 'classnames'
import type {SiteSettings} from '@/sanity/types'
import styles from './CandidSeal.module.scss'

export type CandidSealData = SiteSettings['candidSeal']

// Candid's Dynamic Seal widget, used until Site Settings has its own values.
const DEFAULT_SEAL: NonNullable<CandidSealData> = {
  url: 'https://app.candid.org/profile/7036208/mbolden-change-20-4683289/?pkId=339d01ce-5387-423e-bf06-4dafa481b05d',
  sealSrc: 'https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/7036208/svg',
  alt: 'Candid Platinum Seal of Transparency',
}

type CandidSealProps = {
  seal?: CandidSealData | null
  className?: string
}

/**
 * Candid's Seal of Transparency as a plain image link. The image is Candid's
 * live widget SVG (not next/image), so a new year's seal swaps in on its own.
 * If Candid's image fails to load, the link is hidden rather than showing a
 * broken image.
 */
export default function CandidSeal({seal, className}: CandidSealProps) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const {enabled, url, sealSrc, alt} = seal ?? DEFAULT_SEAL

  // An error before hydration never reaches onError, so check once mounted.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth === 0) setFailed(true)
  }, [sealSrc])

  if (enabled === false || !sealSrc || failed) return null
  const altText = alt || DEFAULT_SEAL.alt

  return (
    <a
      href={url || DEFAULT_SEAL.url}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(styles.seal, className)}
      aria-label={`${altText} (opens in a new tab)`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Candid's live SVG */}
      <img
        ref={imgRef}
        src={sealSrc}
        alt={altText}
        width={80}
        height={80}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </a>
  )
}
