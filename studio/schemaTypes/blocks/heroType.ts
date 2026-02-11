import {defineField, defineType} from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'A headline is optional but recommended.',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Optional subheading below the main headline.',
    }),
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'hasButton',
      title: 'Add Button?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'link',
      title: 'Button Link',
      type: 'internalOrExternalLink',
      hidden: ({parent}) => !parent?.hasButton,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.hasButton && !value) {
            return 'A button link is required if "Display Button?" is checked.'
          }
          return true
        }).optional(),
    }),
    defineField({
      name: 'layout',
      title: 'Slide layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full width (image + overlay)', value: 'full' },
          { title: 'Split (left content, right image)', value: 'split' },
        ],
        layout: 'radio',
      },
      initialValue: 'split',
    }),
    defineField({
      name: 'mediaType',
      title: 'Main media type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video file', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'videoFile',
      title: 'Main Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description:
        'Upload a video file for the main media area. Used when "Main media type" is set to Video file.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string };
          if (parent?.mediaType === 'video' && !value) {
            return 'Video file is required when "Main media type" is Video file.'
          }
          return true
        }),
    }),
    defineField({
      name: 'leftBackgroundType',
      title: 'Left side background',
      type: 'string',
      options: {
        list: [
          {title: 'Solid color', value: 'color'},
          {title: 'Image / pattern', value: 'image'},
        ],
        layout: 'radio',
      },
      initialValue: 'color',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background color (left side)',
      type: 'string',
      options: {
        list: [
          {title: 'Aqua teal', value: 'aqua-teal'},
          {title: 'Warm yellow', value: 'warm-yellow'},
          {title: 'White', value: 'white'},
          {title: 'Black', value: 'black'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'aqua-teal',
      hidden: ({parent}) => parent?.leftBackgroundType !== 'color',
    }),
    defineField({
      name: 'leftBackgroundImage',
      title: 'Background image (left side)',
      type: 'image',
      description: 'Image or pattern for the left 50%. Use for gradients, textures, or photos.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {hotspot: true},
      hidden: ({parent}) => parent?.leftBackgroundType !== 'image',
    }),
    defineField({
      name: 'image',
      title: 'Main Image (right side)',
      type: 'image',
      description: 'Photo for the right 50% of the slide.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.mediaType === 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string };
          if (parent?.mediaType !== 'video' && !value) {
            return 'Hero image is required unless media type is Video URL.'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: `Slide — ${title || 'Untitled'}`,
        media,
      };
    },
  },
})
