import {defineField, defineType} from 'sanity'

export const testimonialsCarouselType = defineType({
  name: 'testimonialsCarousel',
  type: 'object',
  // title: 'Testimonials Carousel',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'Optional headline. Appears above the testimonial block.',

    }),
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      description: 'Optional text. Appears above the testimonial block.',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'hasButton',
      title: 'Add Button?',
      type: 'boolean',
      description: 'Optional button. Appears above the testimonial block.',
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
      name: 'slides',
      description: 'Add one or more slides. Carousel activates when slide count is two or higher.',
      type: 'array',
      of: [{type: 'testimonialCard'}],
    }),
  ],
  preview: {
    select: { title: 'headline'},
    prepare({ title}) {
        return {
        title: title ? `Testimonials Carousel — ${title}` : 'Testimonials Carousel',
        };
    }
  }
})
