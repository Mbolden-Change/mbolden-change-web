import {defineField, defineType} from 'sanity'

export const resourceBannerType = defineType({
  name: 'resourceBanner',
  title: 'Resource Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'resourceTypeLabel',
      title: 'Resource type label',
      type: 'string',
      description: 'Optional label such as Statement, Report, Toolkit, or Case Study.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      description: 'Banner headline for the highlighted resource.',
      type: 'string',
      validation: (Rule) => Rule.required().error('Headline is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 5,
      description: 'Optional supporting context below the headline.',
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'internalOrExternalLink',
      description: 'Supports internal resources (statement/report/page/case study) or external URLs.',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          {title: 'Warm Yellow', value: 'var(--brand-warm-yellow)'},
          {title: 'Aqua Teal', value: 'var(--brand-aqua-teal)'},
          {title: 'Fuchsia', value: 'var(--brand-fuchsia)'},
          {title: 'Black', value: 'var(--brand-black)'},
          {title: 'White', value: 'var(--brand-white)'},
          {title: 'Light Gray', value: 'var(--brand-light-gray)'},
          {title: 'Creamy Beige', value: 'var(--brand-creamy-beige)'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'var(--brand-warm-yellow)',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      options: {
        list: [
          {title: 'White', value: 'var(--brand-white)'},
          {title: 'Black', value: 'var(--brand-black)'},
        ],
        layout: 'radio',
      },
      initialValue: 'var(--brand-black)',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      subtitle: 'resourceTypeLabel',
    },
    prepare({title, subtitle}) {
      return {
        title: `Resource Banner${title ? ` — ${title}` : ''}`,
        subtitle,
      }
    },
  },
})
