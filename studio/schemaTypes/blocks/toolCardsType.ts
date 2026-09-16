import {defineArrayMember, defineField, defineType} from 'sanity'

export const toolCardType = defineType({
  name: 'toolCard',
  title: 'Tool Card',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Optional short label (e.g. Interactive, Campaign, Tool).',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('Title is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().error('Body is required.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Optional. Without an image, the card is text-only (no placeholder).',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              if (parent?.asset && !alt) {
                return 'Alt text is required when an image is set.'
              }
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description: 'Required. Tool Cards are destinations people open — not informational topics.',
      validation: (Rule) =>
        Rule.required().error('Each tool card needs a link.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      label: 'label',
      media: 'image',
      linkTitle: 'link.title',
    },
    prepare({title, label, media, linkTitle}) {
      return {
        title: title || 'Tool Card',
        subtitle: [label, linkTitle ? `CTA: ${linkTitle}` : null]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})

export const toolCardsType = defineType({
  name: 'toolCards',
  title: 'Tool Cards',
  type: 'object',
  description:
    'Dark band of linked cards for tools, products, or interactive resources people can open and use.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional short label (e.g. “mBOLDen Action”).',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('Title is required.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional intro under the title.',
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [defineArrayMember({type: 'toolCard'})],
      validation: (Rule) =>
        Rule.required().min(2).max(4).error('Add 2–4 tool cards.'),
    }),
  ],
  preview: {
    select: {title: 'title', cards: 'cards'},
    prepare({title, cards}) {
      const count = cards?.length ?? 0
      return {
        title: title ? `Tool Cards — ${title}` : 'Tool Cards',
        subtitle: count
          ? `${count} card${count === 1 ? '' : 's'}`
          : 'No cards',
      }
    },
  },
})
