import {defineField, defineType} from 'sanity'

export const pillarCardType = defineType({
  name: 'pillarCard',
  type: 'document',
  title: 'Pillar Card',
  description:
    'Reusable content for a single pillar — one way mBOLDen Change drives change. Referenced from the Pillars page-builder block.',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      description: 'Square or landscape photo shown in the tilted frame. Use real photography with descriptive alt text.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Headline',
      description: 'Pillar name or theme (e.g. "Direct cash assistance"). Sentence case.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description',
      of: [{type: 'block'}],
      description: 'Brief explanation of this pillar. One short paragraph works best.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      media: 'image',
    },
    prepare({title}) {
      return {
        title: title || 'Pillar Card',
      }
    },
  },
})
