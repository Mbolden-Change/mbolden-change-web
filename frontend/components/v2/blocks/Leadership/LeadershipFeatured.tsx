'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {Leadership as LeadershipType, Person} from '@/sanity/types'
import {getPilotImage} from '../TextMedia/pilotImage'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './LeadershipFeatured.module.scss'

const DELAYS = [styles.d3, styles.d4]

function ProfileLink({person}: {person: Person}) {
  if (!person.link) return null
  const label = person.linkLabel || 'LinkedIn'
  return (
    <a
      className={styles.link}
      href={person.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${person.name}: ${label} (opens in a new tab)`}
    >
      {label} <span aria-hidden="true">↗</span>
    </a>
  )
}

/**
 * About page leadership: a large card for each featured person (headshot,
 * role, name, bio, link), then groups such as the board and advisors.
 */
export default function LeadershipFeatured({eyebrow, title, people, groups}: LeadershipType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={title || 'Leadership'}
    >
      <div className={styles.inner}>
        {(eyebrow || title) && (
          <div className={styles.head}>
            {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
            {title && <h2 className={classNames(styles.title, styles.rv, styles.d1)}>{title}</h2>}
          </div>
        )}

        {people?.map((person, index) => {
          const photo = getPilotImage(person.image)
          return (
            <article key={person._key ?? index} className={classNames(styles.featured, styles.rv, styles.d2)}>
              {photo && (
                <div className={styles.photo}>
                  <img
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes="(min-width: 900px) 280px, 100vw"
                    alt={photo.alt || person.name || ''}
                    style={{objectPosition: photo.focus} as CSSProperties}
                  />
                </div>
              )}
              <div className={styles.featuredBody}>
                {person.role && <p className={styles.overline}>{person.role}</p>}
                <h3 className={styles.featuredName}>{person.name}</h3>
                {person.bio && <p className={styles.bio}>{person.bio}</p>}
                <ProfileLink person={person} />
              </div>
            </article>
          )
        })}

        {groups?.map((group, index) =>
          group.people?.length ? (
            <div
              key={group._key}
              className={classNames(styles.group, styles.rv, DELAYS[index % DELAYS.length])}
            >
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul className={styles.row}>
                {group.people.map((person, i) => (
                  <li key={person._key ?? i} className={styles.member}>
                    <span className={styles.name}>{person.name}</span>
                    {person.role && <span className={styles.role}>{person.role}</span>}
                    <ProfileLink person={person} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </section>
  )
}
