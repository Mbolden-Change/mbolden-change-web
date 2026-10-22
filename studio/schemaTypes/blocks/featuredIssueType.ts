import {defineArrayMember, defineField, defineType} from 'sanity'

export const featuredIssueStatType = defineType({
  name: 'featuredIssueStat',
  title: 'Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'prefix',
      title: 'Prefix',
      type: 'string',
      description: 'Optional, shown before the number, such as $.',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'number',
      title: 'Number',
      type: 'number',
      description: 'Whole number. It counts up from 0 when the block scrolls into view.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'What the number means, in a short phrase.',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Optional source line in small text, such as “USCIS, fiscal year 2022”.',
    }),
  ],
  preview: {
    select: {prefix: 'prefix', number: 'number', label: 'label'},
    prepare({prefix, number, label}) {
      return {title: `${prefix ?? ''}${number ?? ''}`, subtitle: label}
    },
  },
})

/**
 * One issue at a time, on a full-width lane color: heading, three stats that
 * count up and the story in a white panel. Swap the content to feature a
 * different issue.
 */
export const featuredIssueType = defineType({
  name: 'featuredIssue',
  title: 'Featured Issue',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'For example “Why it matters”.'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      description: 'Exactly three, left to right.',
      of: [defineArrayMember({type: 'featuredIssueStat'})],
      validation: (Rule) => Rule.required().length(3).error('Add exactly three stats.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The story, shown in a white panel below the stats.',
      of: [defineArrayMember({type: 'block', styles: [{title: 'Normal', value: 'normal'}], lists: []})],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Background color for the block.',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Fuchsia', value: 'fuchsia'},
          {title: 'Yellow', value: 'yellow'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {heading: 'heading', color: 'color'},
    prepare({heading, color}) {
      return {title: heading || 'Featured Issue', subtitle: `Featured Issue · ${color ?? 'teal'}`}
    },
  },
})
