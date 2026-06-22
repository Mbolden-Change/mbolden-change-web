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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const syncCarouselHeight = useCallback(() => {
    if (!emblaApi) return

    const shells = emblaApi.slideNodes()
    if (!shells.length) return

    let maxHeight = 0

    shells.forEach((shell) => {
      const previousMinHeight = shell.style.minHeight
      shell.style.minHeight = 'auto'
      maxHeight = Math.max(maxHeight, shell.offsetHeight)
      shell.style.minHeight = previousMinHeight
    })

    if (maxHeight > 0) {
      setCarouselHeight(maxHeight)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    syncCarouselHeight()

    const resizeObserver = new ResizeObserver(syncCarouselHeight)
    emblaApi.slideNodes().forEach((shell) => resizeObserver.observe(shell))

    emblaApi.on('reInit', syncCarouselHeight)

    return () => {
      resizeObserver.disconnect()
      emblaApi.off('reInit', syncCarouselHeight)
    }
  }, [emblaApi, slides.length, syncCarouselHeight])

  if (!slides.length) return null

  const hasIntro = Boolean(title || text || (hasButton && link))
  const flushTop = shouldTestimonialsFlushTop(prevBlockType)
  const flushBottom = shouldTestimonialsFlushBottom(nextBlockType, isLastBlock)

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
        style={carouselHeight ? {minHeight: carouselHeight} : undefined}
      >
        <div
          className={styles.viewport}
          ref={emblaRef}
          style={carouselHeight ? {height: carouselHeight} : undefined}
        >
          <div className={styles.track}>
            {slides.map((slide, index) => (
              <div
                className={styles.slideShell}
                key={slide._key ?? index}
                style={carouselHeight ? {minHeight: carouselHeight} : undefined}
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
