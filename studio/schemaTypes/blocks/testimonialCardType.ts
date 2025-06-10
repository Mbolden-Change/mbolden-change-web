import {defineField, defineType} from 'sanity'

export const testimonialCardType = defineType({
  name: 'testimonialCard',
  title: 'Testimonial Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'Optional headline that appears inside the testimonial block.',

    }),
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      description: 'Add the testimonial text here.',
      of: [{type: 'block'}, {type: 'image'}],
      validation: (Rule) => Rule.required().error('A testimonial is required.'),
    }),
    defineField({
      name: 'quoteMarksColor',
      title: 'Quote-marks Color',
      type: 'string',
      options: {
        list: [
          { title: 'Yellow', value: 'yellow' },
          { title: 'White', value: 'white' },
          { title: 'Fuchsia', value: 'fuchsia' },
          { title: 'Black', value: 'black' },
          { title: 'Aqua', value: 'aqua' },
        ],
        layout: 'radio',
      },
      initialValue: 'yellow',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'credentials',
      title: 'Author Credentials',
      type: 'string',
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
      name: 'image',
      title: 'Main Image',
      type: 'image',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Testimonial image is required.'),
    }),
  ],
  preview: {
    select: {
      title: 'author',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title ? `Testimonial by ${title}` : `Testimonial Card`,
        media,
      };
    },
  },
})
