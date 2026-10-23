import {defineArrayMember, defineField, defineType} from 'sanity'
import {articleBlock} from '../objects/articleBlock'

/** A section heading. It also appears in the statement's "On this page" menu. */
export const sectionHeadingType = defineType({
  name: 'sectionHeading',
  title: 'Section Heading',
  type: 'object',
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'menuLabel',
      title: 'Menu label',
      type: 'string',
      description: 'A shorter label for the "On this page" menu. Leave blank to use the heading.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Section — ${title ?? ''}`}),
  },
})

/** A large fuchsia line, such as "Then Congress let it expire." */
export const punchLineType = defineType({
  name: 'punchLine',
  title: 'Punch Line',
  type: 'object',
  fields: [defineField({name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required()})],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({title: `Punch line — ${title ?? ''}`}),
  },
})

/** A quote on a black card with a teal offset shadow. */
export const pullQuoteType = defineType({
  name: 'pullQuote',
  title: 'Pull Quote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description: 'Include the quotation marks.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
  ],
  preview: {
    select: {title: 'quote', subtitle: 'attribution'},
    prepare: ({title, subtitle}) => ({title: `Pull quote — ${title ?? ''}`, subtitle}),
  },
})

/** Two tabs, such as 2021 and 2025, each with three value tiles. */
export const thenNowType = defineType({
  name: 'thenNow',
  title: 'Then/Now Toggle',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label for screen readers',
      type: 'string',
      description: 'For example, "Compare the EITC in 2021 and 2025".',
    }),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      validation: (Rule) => Rule.length(2),
      of: [
        defineArrayMember({
          name: 'thenNowTab',
          title: 'Tab',
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Tab label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'tiles',
              title: 'Tiles',
              type: 'array',
              validation: (Rule) => Rule.max(3),
              of: [
                defineArrayMember({
                  name: 'thenNowTile',
                  title: 'Tile',
                  type: 'object',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'string'}),
                    defineField({name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'text', title: 'Text', type: 'string'}),
                  ],
                  preview: {select: {title: 'value', subtitle: 'label'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {a: 'tabs.0.label', b: 'tabs.1.label'},
    prepare: ({a, b}) => ({title: `Then/Now — ${a ?? ''} / ${b ?? ''}`}),
  },
})

/** Numbered cards with a colored left border, a bold title and text. */
export const requirementCardsType = defineType({
  name: 'requirementCards',
  title: 'Numbered Requirement Cards',
  type: 'object',
  description: 'Cards are numbered in order. Colors repeat teal, fuchsia, yellow.',
  fields: [
    defineField({
      name: 'items',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'requirement',
          title: 'Card',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'body', title: 'Text', type: 'array', of: [articleBlock]}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({title: `Numbered cards — ${items?.length ?? 0}`}),
  },
})

/** A teal band of up to three numbers that count up when they appear. */
export const statBandType = defineType({
  name: 'statBand',
  title: 'Stat Band',
  type: 'object',
  fields: [
    defineField({
      name: 'stats',
      title: 'Numbers',
      type: 'array',
      validation: (Rule) => Rule.max(3),
      of: [
        defineArrayMember({
          name: 'stat',
          title: 'Number',
          type: 'object',
          fields: [
            defineField({name: 'value', title: 'Number', type: 'number', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'from',
              title: 'Count from',
              type: 'number',
              description: 'Where the count starts. Leave blank to count up from 0. For a drop, such as 9.7% to 5.2%, enter 9.7.',
            }),
            defineField({name: 'decimals', title: 'Decimal places', type: 'number', initialValue: 0}),
            defineField({name: 'prefix', title: 'Before the number', type: 'string', description: 'For example, $.'}),
            defineField({name: 'suffix', title: 'After the number', type: 'string', description: 'For example, " million" or %.'}),
            defineField({name: 'text', title: 'Text', type: 'array', of: [articleBlock]}),
          ],
          preview: {
            select: {value: 'value', prefix: 'prefix', suffix: 'suffix'},
            prepare: ({value, prefix, suffix}) => ({title: `${prefix ?? ''}${value ?? ''}${suffix ?? ''}`}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {stats: 'stats'},
    prepare: ({stats}) => ({title: `Stat band — ${stats?.length ?? 0} numbers`}),
  },
})

/** Rows people can tick, each with a bold lead-in. */
export const checklistType = defineType({
  name: 'checklist',
  title: 'Checklist',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'checklistItem',
          title: 'Row',
          type: 'object',
          fields: [
            defineField({name: 'lead', title: 'Bold lead-in', type: 'string'}),
            defineField({name: 'text', title: 'Text', type: 'string'}),
          ],
          preview: {select: {title: 'lead', subtitle: 'text'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({title: `Checklist — ${items?.length ?? 0} rows`}),
  },
})
