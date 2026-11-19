import {defineField, defineType} from 'sanity'

/**
 * Every post from our Substack as cards, newest first, as on Our Point of View.
 * The posts come from Substack automatically; nothing is picked here.
 */
export const substackPostListType = defineType({
  name: 'substackPostList',
  title: 'Substack Post List',
  type: 'object',
  description:
    'Every post from our Substack as cards, newest first. Each card opens the post on this site. New posts appear on their own within about an hour.',
  fields: [
    defineField({
      name: 'initialCount',
      title: 'Posts shown at first',
      type: 'number',
      description: 'The rest appear when a visitor selects the button.',
      initialValue: 12,
      validation: (Rule) => Rule.integer().min(3).max(60),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button text',
      type: 'string',
      initialValue: 'Show more',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Substack Post List', subtitle: 'Every post, newest first'}),
  },
})
