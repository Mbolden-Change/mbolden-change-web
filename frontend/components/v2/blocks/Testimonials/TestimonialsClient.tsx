'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import classNames from 'classnames'
import {useCallback, useEffect, useRef, useState} from 'react'
import {PortableText} from '@portabletext/react'
import type {PortableTextBlock} from 'sanity'
import type {
  InternalOrExternalLink,
  TestimonialCard as TestimonialCardType,
} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {
  shouldTestimonialsFlushBottom,
  shouldTestimonialsFlushTop,
} from '@/lib/pageBuilderLayout'
import ButtonComponent from '@/components/atoms/ButtonComponent'
import TestimonialSlide from './TestimonialSlide'
import styles from './Testimonials.module.scss'

type SlideWithKey = TestimonialCardType & {_key?: string}

export type TestimonialsClientProps = PageBuilderBlockLayoutProps & {
  title?: string
  text?: PortableTextBlock[]
  link?: InternalOrExternalLink
  hasButton?: boolean
  slides: SlideWithKey[]
}

const DESKTOP_MQ = '(min-width: 768px)'

export default function TestimonialsClient({
  title,
  text,
  link,
  hasButton,
  slides,
  prevBlockType,
  nextBlockType,
  isLastBlock,
}: TestimonialsClientProps) {
  const autoplay = useRef(
    Autoplay({delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true}),
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({loop: slides.length > 1}, [
    autoplay.current,
  ])

  const [carouselHeight, setCarouselHeight] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const syncCarouselHeight = useCallback(() => {
    if (!emblaApi) return

    // Mobile stacks quote + image — let the section size naturally so it
    // doesn't get locked short and sit under the footer.
    if (!window.matchMedia(DESKTOP_MQ).matches) {
      setCarouselHeight(null)
      return
    }

    const shells = emblaApi.slideNodes()
    if (!shells.length) return

    const viewport = emblaApi.rootNode()
    const previousViewportHeight = viewport.style.height
    viewport.style.height = 'auto'

    let maxHeight = 0
    const previousMinHeights = shells.map((shell) => shell.style.minHeight)

    shells.forEach((shell) => {
      shell.style.minHeight = 'auto'
      maxHeight = Math.max(maxHeight, shell.scrollHeight)
    })

    shells.forEach((shell, index) => {
      shell.style.minHeight = previousMinHeights[index] ?? ''
    })

    viewport.style.height = previousViewportHeight

    if (maxHeight > 0) {
      setCarouselHeight(maxHeight)
    }
  }, [emblaApi])

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ)
    const onChange = () => {
      setIsDesktop(media.matches)
      syncCarouselHeight()
    }

    setIsDesktop(media.matches)
    onChange()

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [syncCarouselHeight])

  useEffect(() => {
    if (!emblaApi) return

    syncCarouselHeight()

    const shells = emblaApi.slideNodes()
    const resizeObserver = new ResizeObserver(syncCarouselHeight)
    shells.forEach((shell) => resizeObserver.observe(shell))

    const images = shells.flatMap((shell) =>
      Array.from(shell.querySelectorAll('img')),
    )
    images.forEach((img) => {
      img.addEventListener('load', syncCarouselHeight)
    })

    emblaApi.on('reInit', syncCarouselHeight)

    return () => {
      resizeObserver.disconnect()
      images.forEach((img) => {
        img.removeEventListener('load', syncCarouselHeight)
      })
      emblaApi.off('reInit', syncCarouselHeight)
    }
  }, [emblaApi, slides.length, syncCarouselHeight])

  if (!slides.length) return null

  const hasIntro = Boolean(title || text || (hasButton && link))
  const flushTop = shouldTestimonialsFlushTop(prevBlockType)
  const flushBottom = shouldTestimonialsFlushBottom(nextBlockType, isLastBlock)
  const equalizedHeight = isDesktop ? carouselHeight : null

  return (
    <section
      className={classNames(
        styles.wrapper,
        flushTop && styles.flushTop,
        flushBottom && styles.flushBottom,
        !hasIntro && flushTop && styles.flushTopNoIntro,
      )}
      aria-label="Testimonials"
    >
      {(title || text || (hasButton && link)) && (
        <div className={styles.intro}>
          {title && <h2 className={styles.introTitle}>{title}</h2>}
          {text && (
            <div className={styles.introBody}>
              <PortableText value={text} />
            </div>
          )}
          {hasButton && link && (
            <ButtonComponent variant="secondary" link={link} className={styles.introCta} />
          )}
        </div>
      )}

      <div
        className={styles.carousel}
        style={equalizedHeight ? {minHeight: equalizedHeight} : undefined}
      >
        <div
          className={styles.viewport}
          ref={emblaRef}
          style={equalizedHeight ? {height: equalizedHeight} : undefined}
        >
          <div className={styles.track}>
            {slides.map((slide, index) => (
              <div
                className={styles.slideShell}
                key={slide._key ?? index}
                style={equalizedHeight ? {minHeight: equalizedHeight} : undefined}
              >
                <TestimonialSlide {...slide} />
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className={styles.controls} aria-label="Testimonial navigation">
            <button
              type="button"
              className={styles.controlButton}
              onClick={scrollPrev}
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={scrollNext}
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
