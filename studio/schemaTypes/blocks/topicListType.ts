import ClearableObjectInput from '../../components/ClearableObjectInput'
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
      description: 'The theme name. Required.',
      validation: (Rule) => Rule.required().error('Topic title is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      description: 'A short definition. People read this band. It is not a card they open.',
      validation: (Rule) => Rule.required().error('Topic body is required.'),
    }),
    defineField({
      name: 'accent',
      title: 'Accent color',
      type: 'string',
      description:
        'Focus area color for the bar, card and link underline, matching the pilot’s accent: teal for Economic Security, fuchsia for Health Access, yellow for Rapid Response. Leave empty to follow the order: teal, fuchsia, yellow.',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Fuchsia', value: 'fuchsia'},
          {title: 'Yellow', value: 'yellow'},
        ],
        layout: 'radio',
      },
      hidden: ({parent, document}) => {
        const blocks = document?.content as Array<{appearance?: string; items?: Array<{_key?: string}>}> | undefined
        const block = blocks?.find((item) => item.items?.some((topic) => topic._key === parent?._key))
        return block?.appearance !== 'focusIndex'
      },
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description:
        'Optional link below the topic text. Initiative overview uses the card’s link instead. Use Clear link to remove all saved link details before switching appearances.',
      hidden: ({parent, document}) => {
        const blocks = document?.content as Array<{appearance?: string; items?: Array<{_key?: string}>}> | undefined
        const block = blocks?.find((item) => item.items?.some((topic) => topic._key === parent?._key))
        return (
          block?.appearance === 'initiatives' ||
          block?.appearance === 'focusIndex' ||
          Boolean(parent?.initiative?.title)
        )
      },
    }),
    defineField({
      name: 'initiative',
      title: 'Initiative card',
      type: 'object',
      components: {input: ClearableObjectInput},
      description: 'Optional card with its own link. Appearance changes preserve this card and it remains visible until removed. Use Clear content to remove the entire card; leave its Link empty for a card without a link.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          description: 'For example: Partnership · Active.',
        }),
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'summary',
          title: 'Summary',
          type: 'text',
          rows: 4,
          description:
            'In a Focus area index, leave a blank line between paragraphs to show them as separate paragraphs.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({name: 'link', title: 'Link', type: 'internalOrExternalLink', description: 'Optional card destination. Leave empty for no link. Use Clear link to remove the label and all destination details together.'}),
      ],
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
    'Named themes with optional initiative cards. Use plain topics on the homepage or featured initiatives on What we’re tackling.',
  fields: [
    defineField({
      name: 'appearance',
      title: 'Appearance',
      type: 'string',
      options: {
        list: [
          {title: 'Plain topics', value: 'plain'},
          {title: 'Initiative overview', value: 'initiatives'},
          {title: 'Focus area index', value: 'focusIndex'},
        ],
        layout: 'radio',
      },
      initialValue: 'plain',
      description:
        'Initiative overview uses square cards and their own links; topic-level links are hidden. Focus area index sets the topics on cream with larger cards for What we’re tackling; it also uses card links only. Switching appearances preserves saved content. Clear topic links before switching to Initiative overview. To return to text-only topics, clear each Initiative card.',
    }),
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
      description: 'Optional section headline. Leave empty beneath a page header.',
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
      description: '2–4 topics. Three columns on a wide screen. They stack on a phone.',
      of: [defineArrayMember({type: 'topicListItem'})],
      validation: (Rule) => Rule.required().min(2).max(4).error('Add 2–4 topics.'),
    }),
    defineField({
      name: 'closingEyebrow',
      title: 'Closing eyebrow',
      type: 'string',
      description: 'Optional label above the closing note (e.g. “Across our work”).',
    }),
    defineField({
      name: 'closingNote',
      title: 'Closing note',
      type: 'text',
      rows: 4,
      description: 'Optional coda under the topics — a thread that spans all items.',
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare({title, items}) {
      const count = items?.length ?? 0
      return {
        title: title ? `Topic List — ${title}` : 'Topic List',
        subtitle: count ? `${count} topic${count === 1 ? '' : 's'}` : 'No topics',
      }
    },
  },
})
