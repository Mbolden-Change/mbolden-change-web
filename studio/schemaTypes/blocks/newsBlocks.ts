import {defineArrayMember, defineField, defineType} from 'sanity'

/** Where We Stand: statements as large cards on black. */
export const statementCardsType = defineType({
  name: 'statementCards',
  title: 'Statement Cards',
  type: 'object',
  description: 'On black: a large card for each statement, linking to its page.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'statementCard',
          title: 'Card',
          type: 'object',
          fields: [
            defineField({
              name: 'statement',
              title: 'Statement',
              type: 'reference',
              to: [{type: 'statement'}],
              description: 'The card shows the statement’s issue and title.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({name: 'linkLabel', title: 'Link label', type: 'string', initialValue: 'Read the statement →'}),
            defineField({
              name: 'color',
              title: 'Color',
              type: 'string',
              options: {
                list: [
                  {title: 'Yellow', value: 'yellow'},
                  {title: 'Teal', value: 'teal'},
                  {title: 'Fuchsia', value: 'fuchsia'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'yellow',
            }),
          ],
          preview: {select: {title: 'statement.title', subtitle: 'statement.issue'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Statement Cards — ${title ?? ''}`}),
  },
})

/** The Full Record: every News Item, newest first, with type and issue filters. */
export const newsRecordType = defineType({
  name: 'newsRecord',
  title: 'News Record',
  type: 'object',
  description: 'Lists every News Item, newest first and grouped by year. Add rows under News Items.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'emptyText',
      title: 'When nothing matches',
      type: 'string',
      initialValue: 'Nothing matches that combination yet.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `News Record — ${title ?? ''}`}),
  },
})

/** Media contact on teal, with a newsletter button. */
export const mediaContactType = defineType({
  name: 'mediaContact',
  title: 'Media Contact',
  type: 'object',
  description: 'On teal: a heading and a line with an email address, plus a newsletter button.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      description: 'Email addresses in the text become links.',
    }),
    defineField({
      name: 'newsletterLabel',
      title: 'Newsletter button',
      type: 'string',
      description: 'Opens the newsletter sign-up. Leave blank to hide it.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Media Contact — ${title ?? ''}`}),
  },
})
