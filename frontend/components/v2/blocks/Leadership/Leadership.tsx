import classNames from 'classnames'
import type {Leadership as LeadershipType, Person} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {shouldSectionFlushBottom} from '@/lib/pageBuilderLayout'
import Headline from '@/components/atoms/Headline'
import SanityNextImage from '@/components/SanityNextImage'
import styles from './Leadership.module.scss'

type PersonWithKey = Person & {_key?: string}

type LeadershipProps = LeadershipType &
  PageBuilderBlockLayoutProps & {
    /** Render without the outer section shell — e.g. embedded inside a tab. */
    nested?: boolean
    /** Heading level for the optional title, so nested usage keeps a valid outline. */
    headingTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }

function PersonCard({name, role, bio, image, link, linkLabel}: PersonWithKey) {
  const hasImage = Boolean(image?.asset?._ref)

  return (
    <article className={styles.card}>
      {hasImage && image && (
        <div className={styles.media}>
          <SanityNextImage
            image={image}
            fit="cover"
            className={styles.image}
            sizes="(min-width: 768px) 160px, 120px"
          />
        </div>
      )}

      <div className={styles.body}>
        <p className={styles.name}>{name}</p>
        {role && <p className={styles.role}>{role}</p>}
        {bio && <p className={styles.bio}>{bio}</p>}
        {link && (
          <a
            className={styles.link}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkLabel || 'Connect on LinkedIn'}
          </a>
        )}
      </div>
    </article>
  )
}

export default function Leadership({
  title,
  people,
  nested = false,
  headingTag = 'h2',
  isLastBlock,
}: LeadershipProps) {
  if (!people || people.length === 0) return null

  const flushBottom = !nested && shouldSectionFlushBottom(isLastBlock)

  return (
    <section
      className={classNames(
        styles.wrapper,
        nested && styles.nested,
        flushBottom && styles.flushBottom,
      )}
      aria-label={title || 'Leadership'}
    >
      <div className={styles.inner}>
        {title && <Headline tag={headingTag} text={title} className={styles.title} />}
        <div className={styles.list}>
          {people.map((person, index) => (
            <PersonCard key={person._key || index} {...person} />
          ))}
        </div>
      </div>
    </section>
  )
}
