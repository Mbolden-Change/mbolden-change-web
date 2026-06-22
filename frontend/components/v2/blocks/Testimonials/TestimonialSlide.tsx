import {PortableText} from '@portabletext/react'
import type {PortableTextBlock} from 'sanity'
import type {TestimonialCard as TestimonialCardType} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import ButtonComponent from '@/components/atoms/ButtonComponent'
import {QUOTE_MARKS} from './quoteMarks'
import styles from './Testimonials.module.scss'

export default function TestimonialSlide({
  title,
  text,
  quoteMarksColor,
  author,
  credentials,
  image,
  link,
  hasButton,
}: TestimonialCardType) {
  const quoteSrc =
    quoteMarksColor && QUOTE_MARKS[quoteMarksColor]
      ? QUOTE_MARKS[quoteMarksColor]
      : QUOTE_MARKS.fuchsia

  return (
    <div className={styles.slide} data-testimonial-slide>
      <div className={styles.slideGrid}>
        {image && (
          <div className={styles.polaroidWrap}>
            <figure className={styles.polaroid}>
              <div className={styles.polaroidMedia}>
                <SanityNextImage
                  image={image}
                  fit="cover"
                  className={styles.polaroidImage}
                  sizes="(min-width: 768px) 40vw, 90vw"
                />
              </div>
              {image.alt && (
                <figcaption className={styles.polaroidCaption}>{image.alt}</figcaption>
              )}
            </figure>
          </div>
        )}

        <div className={styles.quotePanel}>
          {title && <h2 className={styles.slideTitle}>{title}</h2>}

          {text && (
            <blockquote className={styles.quoteCard}>
              <img src={quoteSrc} alt="" className={styles.quoteMark} aria-hidden="true" />
              <div className={styles.quoteBody}>
                <PortableText value={text as PortableTextBlock[]} />
              </div>
            </blockquote>
          )}

          {(author || credentials || (hasButton && link)) && (
            <div className={styles.slideMeta}>
              {(author || credentials) && (
                <div className={styles.credit}>
                  {author && <p className={styles.author}>{author}</p>}
                  {credentials && <p className={styles.credentials}>{credentials}</p>}
                </div>
              )}

              {hasButton && link && (
                <ButtonComponent variant="secondary" link={link} className={styles.cta} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
