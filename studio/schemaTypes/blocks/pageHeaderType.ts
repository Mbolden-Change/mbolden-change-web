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
      description: 'Short label above the heading (optional). Use sentence case.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The page headline. Renders as the page h1. Keep to one strong line.',
      validation: (Rule) => Rule.required().max(120).error('Heading is required.'),
    }),
    defineField({
      name: 'dek',
      title: 'Supporting line',
      type: 'text',
      rows: 3,
      description: 'One or two sentences below the heading (optional).',
    }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      description: 'Left-aligned or centered.',
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
