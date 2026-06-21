import {defineField, defineType} from 'sanity'

export const pillarsContainerType = defineType({
  name: 'pillarContainer',
  type: 'document',
  title: 'Pillar Container (Legacy)',
  description:
    'Legacy site-wide pillars content. For new pages, use the Pillars block in the page builder instead.',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow',
      description: 'Optional short label above the section title (e.g. "Our approach").',
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Section headline shown above the pillar list.',
    }),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description',
      of: [{type: 'block'}],
      description: 'Optional intro paragraph below the title.',
    }),
    defineField({
      name: 'pillars',
      type: 'array',
      title: 'Pillars',
      of: [{type: 'reference', to: [{type: 'pillarCard'}]}],
      description: 'Pillar Cards to display. Order here is the order they appear on the page.',
    }),
  ],
})
