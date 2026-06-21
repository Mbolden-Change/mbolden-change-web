import {defineField, defineType} from 'sanity'

export const pillarsType = defineType({
  name: 'pillars',
  title: 'Pillars',
  type: 'object',
  description:
    'Highlight the ways mBOLDen Change drives systems-level change. Each pillar appears as a scroll-revealed row with an image, headline, and supporting copy.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional short label above the section title (e.g. "Our approach").',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Section headline shown above the pillar list (e.g. "How we drive change").',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Optional intro paragraph below the title. Keep to 1–2 short paragraphs.',
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'pillarCard'}]}],
      description:
        'Select one or more Pillar Cards. Order here is the order they appear on the page.',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      pillars: 'pillars',
    },
    prepare({title, eyebrow, pillars}) {
      const count = pillars?.length ?? 0
      const countLabel =
        count === 0
          ? 'No pillars selected'
          : `${count} pillar${count === 1 ? '' : 's'}`
      return {
        title: title ? `Pillars — ${title}` : 'Pillars',
        subtitle: [eyebrow, countLabel].filter(Boolean).join(' · '),
      }
    },
  },
})
