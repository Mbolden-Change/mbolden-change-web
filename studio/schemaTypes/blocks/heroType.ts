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
      validation: (Rule) => Rule.required().error('Hero image is required.'),
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
