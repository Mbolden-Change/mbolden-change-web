import {defineField, defineType} from 'sanity'

export const testimonialsCarouselType = defineType({
  name: 'testimonialsCarousel',
  title: 'Testimonials Carousel',
  type: 'object',
  description:
    'A rotating set of short quotes. Two or more slides become a carousel. One slide stays a single quote. For one voice inside a story, use Story Highlight.',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'Optional headline above the quotes.',

    }),
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      description: 'Optional line above the quotes.',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'hasButton',
      title: 'Add Button?',
      type: 'boolean',
      description: 'Optional button for the whole section, such as “See all stories”.',
      initialValue: false,
    }),
    defineField({
      name: 'link',
      title: 'Button Link',
      type: 'internalOrExternalLink',
      description: 'Where the section button goes. Required when the button is on.',
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
      description:
        'One quote per slide. Add two or more if people should move between them. One slide shows as a static quote.',
      type: 'array',
      of: [{type: 'testimonialCard'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slides: 'slides',
    },
    prepare({title, slides}) {
      const count = slides?.length ?? 0
      return {
        title: title ? `Testimonials — ${title}` : 'Testimonials Carousel',
        subtitle: count
          ? `${count} testimonial${count === 1 ? '' : 's'}`
          : 'No testimonials',
      }
    },
  },
})
