import {defineField, defineType} from 'sanity'

export const pageHeaderType = defineType({
  name: 'pageHeader',
  title: 'Page Header',
  type: 'object',
  description:
    'Lightweight page intro — eyebrow, main heading (h1), and an optional supporting line. Use at the top of content pages that do not need a full hero.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description:
        'Optional short label above the heading. A category, not a second headline. Example: “Our work”.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description:
        'The main page title. Required. This is the only page title. Clear and specific, such as “What we\'re tackling”.',
      validation: (Rule) => Rule.required().max(120).error('Heading is required.'),
    }),
    defineField({
      name: 'dek',
      title: 'Supporting line',
      type: 'text',
      rows: 3,
      description:
        'Optional one or two sentences under the heading. Add context. Do not repeat the heading.',
    }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      description: 'Left for most pages. Center for a short, statement-style page.',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Center', value: 'center'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'eyebrow',
    },
    prepare({title, subtitle}) {
      return {
        title: title ? `Page Header — ${title}` : 'Page Header',
        subtitle,
      }
    },
  },
})
