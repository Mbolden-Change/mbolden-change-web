import {defineField, defineType} from 'sanity'

export const resourceBannerType = defineType({
  name: 'resourceBanner',
  title: 'Resource Banner',
  type: 'object',
  description:
    'Full-width banner that spotlights a statement, report, case study, or other resource with a headline, optional body copy, and call-to-action link.',
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
      description: 'Banner background. Warm Yellow is the default brand accent for resource callouts.',
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
      description: 'Use White text on dark backgrounds (Black, Aqua Teal, Fuchsia). Use Black on light backgrounds.',
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
      headline: 'headline',
      resourceTypeLabel: 'resourceTypeLabel',
      ctaTitle: 'cta.title',
    },
    prepare({headline, resourceTypeLabel, ctaTitle}) {
      return {
        title: headline ? `Resource Banner — ${headline}` : 'Resource Banner',
        subtitle: [resourceTypeLabel, ctaTitle ? `CTA: ${ctaTitle}` : null]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
