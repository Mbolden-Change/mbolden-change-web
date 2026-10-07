import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const resourceListItemType = defineType({
  name: 'resourceListItem',
  title: 'Resource',
  type: 'object',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      description: 'Year or date, such as 2022. Leave blank when there is no date. Do not invent one.',
    }),
    defineField({
      name: 'label',
      title: 'Type',
      type: 'string',
      description: 'Short type, such as Toolkit, Briefing, or Evaluation.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'The name of the resource. Required. The summary is a separate line, not a second title.',
      validation: (Rule) => Rule.required().error('Title is required.'),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Optional line under the title. One line of context, not a second title.',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description:
        'Optional. Add it when the destination page exists. The whole row becomes the link, and the label can match the title. Leave it empty and the row stays on the page.',
    }),
  ],
  preview: {
    select: {title: 'title', date: 'date', label: 'label'},
    prepare({title, date, label}) {
      const meta = [date, label].filter(Boolean).join(' · ')
      return {
        title: title || 'Resource',
        subtitle: meta || undefined,
      }
    },
  },
})

export const resourceListType = defineType({
  name: 'resourceList',
  title: 'Resource List',
  type: 'object',
  icon: DocumentsIcon,
  description:
    'A dated list of toolkits, briefings, and evaluations. Each row is one resource. The date can be left blank.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional label above the heading (e.g. “Resources”).',
    }),
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      description: 'Section title. Required.',
      validation: (Rule) => Rule.required().error('Heading is required.'),
    }),
    defineField({
      name: 'description',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      description: 'Optional line under the heading.',
    }),
    defineField({
      name: 'items',
      title: 'Resources',
      type: 'array',
      description:
        '1–12 resources. On a wide screen the date sits on the left. On a phone it sits above the title, and a blank date is hidden.',
      of: [defineArrayMember({type: 'resourceListItem'})],
      validation: (Rule) =>
        Rule.required().min(1).max(12).error('Add 1–12 resources.'),
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare({title, items}) {
      const count = items?.length ?? 0
      return {
        title: title ? `Resource List — ${title}` : 'Resource List',
        subtitle: count
          ? `${count} resource${count === 1 ? '' : 's'}`
          : 'No resources',
      }
    },
  },
})
