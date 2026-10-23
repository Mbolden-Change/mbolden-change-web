import {defineArrayMember, defineField, defineType} from 'sanity'

const SUBSTACK_HOST = 'mboldenchange.substack.com'

/** Only posts on our own Substack: https://mboldenchange.substack.com/p/… */
function checkSubstackUrl(value: string | undefined, {postOnly}: {postOnly: boolean}) {
  if (!value) return true
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Enter a full web address.'
  }
  if (url.protocol !== 'https:' || url.hostname !== SUBSTACK_HOST) {
    return `Use a ${SUBSTACK_HOST} address.`
  }
  if (postOnly && !/^\/p\/[^/]+\/?$/.test(url.pathname)) {
    return `Use a post address, such as https://${SUBSTACK_HOST}/p/the-philanthropic-retreat.`
  }
  return true
}

export const pointOfViewPostType = defineType({
  name: 'pointOfViewPost',
  title: 'Substack post',
  type: 'object',
  description:
    'The title, subtitle and cover photo come from Substack and refresh daily. Fill in the fields below only to replace them.',
  fields: [
    defineField({
      name: 'url',
      title: 'Post URL',
      type: 'url',
      validation: (Rule) =>
        Rule.required().custom((value) => checkSubstackUrl(value as string | undefined, {postOnly: true})),
    }),
    defineField({
      name: 'alt',
      title: 'Photo alt text',
      type: 'string',
      description: 'Describes the cover photo (or the replacement image) for screen readers.',
    }),
    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'Replaces the Substack title.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary (optional)',
      type: 'text',
      rows: 2,
      description: 'Replaces the Substack subtitle.',
    }),
    defineField({
      name: 'image',
      title: 'Image (optional)',
      type: 'image',
      description: 'Replaces the Substack cover photo. Shown in black and white, 16:9, cropped from the center.',
    }),
  ],
  preview: {
    select: {url: 'url', title: 'title', media: 'image'},
    prepare({url, title, media}) {
      const slug = typeof url === 'string' ? url.replace(/^.*\/p\//, '').replace(/\/$/, '') : ''
      return {title: title || slug || 'Substack post', subtitle: url, media}
    },
  },
})

/**
 * “We Said What We Said”: three Substack posts as cards, curated in Studio.
 * With no posts picked, the three latest are shown automatically.
 */
export const pointOfViewType = defineType({
  name: 'pointOfView',
  title: 'Point of View',
  type: 'object',
  description:
    'Three Substack posts as cards on white, with a button to the Substack. Pick up to three posts; with none picked, the three latest show automatically.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Our Point of View',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'We Said What We Said',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'posts',
      title: 'Posts',
      type: 'array',
      description: 'Up to three, in order; drag to reorder. Leave empty to show the three latest posts.',
      of: [defineArrayMember({type: 'pointOfViewPost'})],
      validation: (Rule) =>
        Rule.max(3).custom((posts) => {
          const urls = ((posts ?? []) as Array<{url?: string}>)
            .map((post) => post.url?.replace(/\/$/, ''))
            .filter(Boolean)
          return new Set(urls).size === urls.length ? true : 'Each post can only be picked once.'
        }),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button text',
      type: 'string',
      initialValue: 'Read more on Substack',
      description: 'An ↗ is added after it.',
    }),
    defineField({
      name: 'buttonUrl',
      title: 'Button link',
      type: 'url',
      initialValue: `https://${SUBSTACK_HOST}/`,
      validation: (Rule) => Rule.custom((value) => checkSubstackUrl(value as string | undefined, {postOnly: false})),
    }),
  ],
  preview: {
    select: {heading: 'heading', posts: 'posts'},
    prepare({heading, posts}) {
      const count = posts?.length ?? 0
      return {
        title: `Point of View — ${heading ?? ''}`,
        subtitle: count ? `${count} picked post${count === 1 ? '' : 's'}` : 'Three latest posts',
      }
    },
  },
})
