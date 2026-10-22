import {defineField, defineType} from 'sanity'

/**
 * Shows the focus areas from another page's “Focus area index” Topic List,
 * so the homepage and What We're Tackling stay in sync. Edit the copy on that
 * page; each card links to its pilot there.
 */
export const focusAreasType = defineType({
  name: 'focusAreas',
  title: 'Focus Areas',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'For example “Strategic Priorities”.'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'page',
      title: 'Focus areas from',
      type: 'reference',
      to: [{type: 'page'}],
      description:
        'The page whose Topic List (Focus area index) supplies the cards: What We’re Tackling. Edit the focus area copy there; this block updates with it. Each card’s “See it in action” link opens that page at the card’s section.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Card link text',
      type: 'string',
      initialValue: 'See it in action',
      description: 'The ↗ is added for you.',
    }),
  ],
  preview: {
    select: {heading: 'heading', page: 'page.title'},
    prepare({heading, page}) {
      return {title: heading || 'Focus Areas', subtitle: page ? `Focus Areas · from ${page}` : 'Focus Areas'}
    },
  },
})
