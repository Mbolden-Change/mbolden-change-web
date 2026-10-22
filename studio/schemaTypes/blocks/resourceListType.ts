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
        'Optional. A page, a site path such as /simulator, a PDF File or an external URL. The whole row or card becomes the link. On a featured card the label is the call to action, such as “Try the simulator”; the ↗ arrow is added for you.',
    }),
    defineField({
      name: 'featured',
      title: 'Feature in the row',
      type: 'boolean',
      description: 'Show this resource as one of the three cards in a Featured row.',
      initialValue: false,
    }),
    defineField({
      name: 'color',
      title: 'Lane color',
      type: 'string',
      description: 'Colors the card’s type tag, link underline and automatic cover.',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Fuchsia', value: 'fuchsia'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      description:
        'Optional, for featured cards. Without one, the card draws a cover in the lane color with a bolt and the type in large letters.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((value, context) =>
              (context.parent as {asset?: unknown} | undefined)?.asset && !value
                ? 'Describe the image for screen readers.'
                : true,
            ),
        }),
        defineField({
          name: 'credit',
          title: 'Credit',
          type: 'string',
          description: 'Optional photo credit shown on the card, such as “Photo: Name, Source”.',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', date: 'date', label: 'label', featured: 'featured', media: 'cover'},
    prepare({title, date, label, featured, media}) {
      const meta = [featured ? 'Featured' : null, date, label].filter(Boolean).join(' · ')
      return {
        title: title || 'Resource',
        subtitle: meta || undefined,
        media,
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
      name: 'appearance',
      title: 'Appearance',
      type: 'string',
      description:
        'List shows every resource as dated rows. Featured row shows only the three resources marked “Feature in the row”, as cards; the rest stay here for a full list later.',
      options: {
        list: [
          {title: 'List', value: 'list'},
          {title: 'Featured row', value: 'featured'},
        ],
        layout: 'radio',
      },
      initialValue: 'list',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (value !== 'featured') return true
          const parent = context.parent as {
            items?: Array<{featured?: boolean}>
            groups?: Array<{items?: Array<{featured?: boolean}>}>
          }
          const all = [...(parent?.items ?? []), ...(parent?.groups ?? []).flatMap((g) => g.items ?? [])]
          const count = all.filter((item) => item.featured).length
          return count === 3 ? true : `Mark exactly three resources “Feature in the row” (now ${count}).`
        }),
    }),
    defineField({
      name: 'surface',
      title: 'Background',
      type: 'string',
      description: 'Default is white. Cream matches the cream sections on What we’re tackling.',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Cream', value: 'cream'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'items',
      title: 'Resources',
      type: 'array',
      description:
        '1–12 resources. On a wide screen the date sits on the left. On a phone it sits above the title, and a blank date is hidden.',
      of: [defineArrayMember({type: 'resourceListItem'})],
      hidden: ({parent}) => Boolean(parent?.groups?.length) && !parent?.items?.length,
      validation: (Rule) =>
        Rule.custom((items: unknown[] | undefined, context) => {
          const groups = (context.parent as {groups?: unknown[]} | undefined)?.groups
          if (groups?.length) return true
          if (!items?.length || items.length > 12) return 'Add 1–12 resources, or use groups.'
          return true
        }),
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      description:
        'Optional. Split the list into named groups, such as “Toolkits & Briefings” and “Reports & Evaluations”. Groups sit side by side on a wide screen and stack on a phone. When groups are set, they replace the single list above.',
      of: [
        defineArrayMember({
          name: 'resourceGroup',
          title: 'Group',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Group title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Resources',
              type: 'array',
              of: [defineArrayMember({type: 'resourceListItem'})],
              validation: (Rule) => Rule.required().min(1).error('Add at least one resource.'),
            }),
          ],
          preview: {
            select: {title: 'title', items: 'items'},
            prepare({title, items}) {
              const count = items?.length ?? 0
              return {title, subtitle: `${count} resource${count === 1 ? '' : 's'}`}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items', groups: 'groups'},
    prepare({title, items, groups}) {
      const count =
        (items?.length ?? 0) +
        (groups ?? []).reduce(
          (sum: number, group: {items?: unknown[]}) => sum + (group.items?.length ?? 0),
          0,
        )
      return {
        title: title ? `Resource List — ${title}` : 'Resource List',
        subtitle: count
          ? `${count} resource${count === 1 ? '' : 's'}`
          : 'No resources',
      }
    },
  },
})
