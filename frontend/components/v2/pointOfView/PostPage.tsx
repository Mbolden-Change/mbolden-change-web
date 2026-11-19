import Image from 'next/image'
import Link from 'next/link'
import {SUBSCRIBE_EMBED_URL} from '@/lib/substackPosts/config'
import {POSTS_PATH, substackPostUrl} from '@/lib/substackPosts/core'
import {formatPostDate, optimizeImages, type PostCard, type SubstackPost} from '@/lib/substackPosts/posts'
import PostCards from './PostCards'
import styles from './pointOfView.module.scss'

/** Substack names cover files "<id>_<width>x<height>.jpeg". */
function coverSize(url: string) {
  let name = url
  try {
    name = decodeURIComponent(url)
  } catch {
    // Keep the raw address.
  }
  const match = name.match(/_(\d{2,5})x(\d{2,5})\.[a-z]+$/i)
  return match ? {width: Number(match[1]), height: Number(match[2])} : {width: 1456, height: 819}
}

/** One Substack post, read on this site: header, the post, sign-up form and more posts. */
export default function PostPage({post, more}: {post: SubstackPost; more: PostCard[]}) {
  const dateLabel = formatPostDate(post.date)
  const substackUrl = substackPostUrl(post.slug)

  return (
    <main id="as-main" className={styles.page}>
      <article>
        <header className={`${styles.column} ${styles.header}`}>
          <p className={styles.eyebrow}>
            <Link href={POSTS_PATH} className={styles.eyebrowLink}>
              Our Point of View
            </Link>
          </p>
          <h1 className={styles.postTitle}>{post.title}</h1>
          {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
          <p className={styles.byline}>
            {post.author}
            {dateLabel && (
              <>
                {' · '}
                <time dateTime={post.date}>{dateLabel}</time>
              </>
            )}
          </p>
        </header>

        {post.coverImage && (
          <div className={styles.column}>
            <figure className={styles.cover}>
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt ?? ''}
                {...coverSize(post.coverImage.url)}
                sizes="(max-width: 760px) 100vw, 680px"
                priority
              />
            </figure>
          </div>
        )}

        {/* Cleaned to an allowlist by lib/substackPosts/core.ts; the words are Substack's, untouched. */}
        <div className={`${styles.column} ${styles.body}`} dangerouslySetInnerHTML={{__html: optimizeImages(post.html)}} />
      </article>

      <section className={`${styles.column} ${styles.after}`} aria-labelledby="pov-subscribe">
        <hr className={styles.rule} />
        <h2 id="pov-subscribe" className={styles.afterTitle}>
          Get new posts by email
        </h2>
        <iframe
          className={styles.subscribe}
          src={SUBSCRIBE_EMBED_URL}
          title="Subscribe on Substack"
          loading="lazy"
          scrolling="no"
        />
        <p className={styles.conversation}>
          <a href={substackUrl} target="_blank" rel="noopener noreferrer">
            Join the conversation on Substack <span aria-hidden="true">↗</span>
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </p>
      </section>

      <PostCards cards={more} heading="More from Our Point of View" />
    </main>
  )
}
