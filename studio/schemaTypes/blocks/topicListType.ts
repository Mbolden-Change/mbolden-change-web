import {defineArrayMember, defineField, defineType} from 'sanity'

export const topicListItemType = defineType({
  name: 'topicListItem',
  title: 'Topic',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('Topic title is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().error('Topic body is required.'),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description:
        'Optional. Leave empty for informational topics; add when a destination exists.',
    }),
  ],
  preview: {
    select: {title: 'title', body: 'body'},
    prepare({title, body}) {
      return {
        title: title || 'Topic',
        subtitle: body
          ? `${String(body).slice(0, 72)}${String(body).length > 72 ? '…' : ''}`
          : undefined,
      }
    },
  },
})

export const topicListType = defineType({
  name: 'topicList',
  title: 'Topic List',
  type: 'object',
  description:
    'Compact informational band of named themes — definitions, not destination cards. Best under Pillars (e.g. focus areas).',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional short label above the title (e.g. “Our focus”).',
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
      name: 'items',
      title: 'Topics',
      type: 'array',
      of: [defineArrayMember({type: 'topicListItem'})],
      validation: (Rule) =>
        Rule.required().min(2).max(4).error('Add 2–4 topics.'),
    }),
    defineField({
      name: 'closingEyebrow',
      title: 'Closing eyebrow',
      type: 'string',
      description:
        'Optional label above the closing note (e.g. “Across our work”).',
    }),
    defineField({
      name: 'closingNote',
      title: 'Closing note',
      type: 'text',
      rows: 4,
      description:
        'Optional coda under the topics — a thread that spans all items.',
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare({title, items}) {
      const count = items?.length ?? 0
      return {
        title: title ? `Topic List — ${title}` : 'Topic List',
        subtitle: count
          ? `${count} topic${count === 1 ? '' : 's'}`
          : 'No topics',
      }
    },
  },
})
