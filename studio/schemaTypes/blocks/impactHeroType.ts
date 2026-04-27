import {defineField, defineType} from 'sanity'

export const impactHeroType = defineType({
  name: 'impactHero',
  title: 'Impact Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Short label above the headline (optional).',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().error('Heading is required.'),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'mediaPosition',
      title: 'Media position',
      type: 'string',
      description: 'On large screens, place the image or video on the left or right of the text.',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          hidden: ({parent}) => !!parent?.videoUrl,
        }),
        defineField({
          name: 'videoUrl',
          title: 'Video URL',
          type: 'url',
          description: 'YouTube, Vimeo, or hosted video URL',
          hidden: ({parent}) => !!parent?.image,
        }),
      ],
    }),
    defineField({
      name: 'cta1',
      title: 'CTA 1',
      type: 'internalOrExternalLink',
    }),
    defineField({
      name: 'cta2',
      title: 'CTA 2',
      type: 'internalOrExternalLink',
    }),
  ],
})
