import {defineField, defineType} from 'sanity'
import {OlistIcon} from '@sanity/icons'

export const NEWS_KINDS = [
  {title: 'Statement', value: 'statement'},
  {title: 'Our letter', value: 'ourLetter'},
  {title: 'Coalition letter', value: 'coalitionLetter'},
  {title: 'Announcement', value: 'announcement'},
]

/** One row in The Full Record on News & Statements. */
export const newsItemType = defineType({
  name: 'newsItem',
  title: 'News Item',
  type: 'document',
  icon: OlistIcon,
  description: 'A row in The Full Record on News & Statements. Rows are listed newest first and grouped by year.',
  fields: [
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {list: NEWS_KINDS, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'date', title: 'Date', type: 'date', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'datePrecision',
      title: 'Show the date as',
      type: 'string',
      options: {
        list: [
          {title: 'Full date (May 5, 2026)', value: 'day'},
          {title: 'Month and year (Oct 2026)', value: 'month'},
        ],
        layout: 'radio',
      },
      initialValue: 'day',
      description: 'Use month and year when there is no exact day. Choose any day in that month above.',
    }),
    defineField({
      name: 'issue',
      title: 'Issue',
      type: 'string',
      description:
        'Used by the issue filter. Spell it the same way as other rows, such as Civil Rights, Economic Security, Environment, Health Access, Immigration, Nonprofits, Philanthropy or Tax Justice.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({
      name: 'details',
      title: 'Details line',
      type: 'string',
      description: 'Small text under the summary, such as "Led by Economic Security Project · To House and Senate leaders".',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link label',
      type: 'string',
      description:
        'For example "Read the statement →", "Read the letter →", "Read about the letter ↗", "Sign on to the letter ↗" or "Read the release ↗".',
    }),
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'url',
      description:
        'A page on this site, such as /letter/ab-1357, opens in the same tab. A full address opens in a new tab. Leave blank to show no link.',
      validation: (Rule) => Rule.uri({allowRelative: true, scheme: ['http', 'https']}),
    }),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', kind: 'kind', date: 'date'},
    prepare: ({title, kind, date}) => ({
      title,
      subtitle: [NEWS_KINDS.find((k) => k.value === kind)?.title, date].filter(Boolean).join(' · '),
    }),
  },
})
