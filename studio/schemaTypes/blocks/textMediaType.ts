import {defineType, defineField} from 'sanity'

export const textMedia = defineType({
  name: 'textMedia',
  title: 'Text & Media',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'textBody',
      title: 'Text Body',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
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
      name: 'ctas',
      title: 'Call To Actions',
      type: 'array',
      of: [
        {
          name: 'cta',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Button Text',
              type: 'string',
              validation: (Rule) => Rule.required().max(50),
            }),
            defineField({
              name: 'link',
              title: 'Link (Optional)',
              type: 'url',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      mediaImage: 'media.image',
    },
    prepare({title, mediaImage}) {
      return {
        title: title || 'Text & Media',
        media: mediaImage,
      }
    },
  },
})
