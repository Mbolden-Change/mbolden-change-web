import {defineArrayMember, defineField, defineType} from 'sanity'

export const timelineMilestoneType = defineType({
  name: 'timelineMilestone',
  title: 'Milestone',
  type: 'object',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'A year, or a word such as “Today”.',
      validation: (Rule) => Rule.required().max(12),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {year: 'year', title: 'title'},
    prepare({year, title}) {
      return {title: `${year ?? ''} · ${title ?? ''}`}
    },
  },
})

/** A vertical timeline whose line fills as you scroll; milestones rise in as they're reached. */
export const timelineType = defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'For example “Since 2006”.'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'milestones',
      title: 'Milestones',
      type: 'array',
      description: 'In order, oldest first.',
      of: [defineArrayMember({type: 'timelineMilestone'})],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'cta',
      title: 'Button',
      type: 'internalOrExternalLink',
      description: 'Optional outline button after the last milestone.',
    }),
  ],
  preview: {
    select: {title: 'heading', milestones: 'milestones'},
    prepare({title, milestones}) {
      return {title: title || 'Timeline', subtitle: `Timeline · ${milestones?.length ?? 0} milestones`}
    },
  },
})
