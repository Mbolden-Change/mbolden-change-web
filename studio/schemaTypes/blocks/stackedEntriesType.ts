import {StackIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const stackedEntryFeatureType = defineType({
  name: 'stackedEntryFeature',
  title: 'Featured item',
  type: 'object',
  description:
    'Optional example nested in an entry — an initiative, fund, or story. Leave empty when the entry stands on its own.',
  fields: [
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Short label above the name (e.g. “Initiative”).',
    }),
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'Name of the initiative, fund, or story inside this entry.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'One short paragraph under the name.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'Optional tilted photo. On a phone it sits under the copy. Leave empty when there is no photo.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the photo for screen readers. Required when an image is set.',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              if (parent?.asset && !alt) {
                return 'Alt text is required when an image is set.'
              }
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'mediaPosition',
      title: 'Image position',
      type: 'string',
      description:
        'On a wide screen, which side the photo sits on. On a phone the photo sits under the copy.',
      hidden: ({parent}) => !parent?.image?.asset,
      options: {
        list: [
          {title: 'Right', value: 'right'},
          {title: 'Left', value: 'left'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description:
        'Optional. One link under the summary. The label should say where it goes.',
    }),
  ],
})

export const stackedEntryType = defineType({
  name: 'stackedEntry',
  title: 'Entry',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'The menu label and the entry heading. Keep it short enough to scan.',
      validation: (Rule) => Rule.required().error('Entry name is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Explanation',
      type: 'text',
      rows: 4,
      description:
        'The longer read under the name. For focus areas, state the challenge here. The featured item names the initiative.',
      validation: (Rule) => Rule.required().error('Explanation is required.'),
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor',
      type: 'string',
      description:
        'Optional hash so other pages can link here (e.g. economic-security). Leave blank to use the name.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return true
          return 'Use lowercase letters, numbers, and hyphens.'
        }),
    }),
    defineField({
      name: 'feature',
      title: 'Featured item',
      type: 'stackedEntryFeature',
      description:
        'Optional initiative, fund, or story inside this entry. Leave every field empty for How we partner.',
      options: {collapsible: true, collapsed: false},
    }),
  ],
  preview: {
    select: {title: 'title', feature: 'feature.title'},
    prepare({title, feature}) {
      return {
        title: title || 'Entry',
        subtitle: feature ? String(feature) : undefined,
      }
    },
  },
})

export const stackedEntriesType = defineType({
  name: 'stackedEntries',
  title: 'Stacked Entries',
  type: 'object',
  icon: StackIcon,
  description:
    'A short set of named entries with a sticky menu. Use twice on What we\'re tackling: focus areas (leave the introduction empty, fill the featured item) and How we partner (fill the introduction, leave the featured item empty).',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description:
        'Optional label above the heading. Example: “Our model”. Leave empty on focus areas, when a Page Header already opened the page.',
    }),
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      description:
        'Optional section title. Leave empty when a Page Header already introduced the page.',
    }),
    defineField({
      name: 'description',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      description:
        'Optional paragraphs under the heading. Fill this in for How we partner. Leave it empty for focus areas.',
    }),
    defineField({
      name: 'entries',
      title: 'Entries',
      type: 'array',
      description:
        '2–6 entries. Each name is a menu item. On a wide screen the menu sticks to the left. On a phone it becomes one sideways-scrolling row.',
      of: [defineArrayMember({type: 'stackedEntry'})],
      validation: (Rule) =>
        Rule.required().min(2).max(6).error('Add 2–6 entries.'),
    }),
  ],
  preview: {
    select: {title: 'title', entries: 'entries'},
    prepare({title, entries}) {
      const count = entries?.length ?? 0
      return {
        title: title ? `Stacked Entries — ${title}` : 'Stacked Entries',
        subtitle: count
          ? `${count} entr${count === 1 ? 'y' : 'ies'}`
          : 'No entries',
      }
    },
  },
})
