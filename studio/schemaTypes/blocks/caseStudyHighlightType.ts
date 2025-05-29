import {defineType, defineField} from 'sanity'
export const caseStudyHighlight = defineType({
  name: 'caseStudyHighlight',
  type: 'object',
  title: 'Case-Study Highlight',
  fields: [
    defineField({name: 'label', type: 'string', initialValue: 'CASE STUDY HIGHLIGHT'}),
    defineField({name: 'pullQuote', type: 'text', rows: 3}),
    defineField({name: 'headline', type: 'string'}),
    defineField({name: 'body', type: 'text', rows: 8}),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'internalOrExternalLink',
    }),
    defineField({
      name: 'image',
      title: 'Optional background / side image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'themeColor',
      title: 'Theme Color',
      type: 'string',
      options: {
        list: [
          {title: 'Warm Yellow', value: 'var(--brand-warm-yellow)'},
          {title: 'Aqua Teal', value: 'var(--brand-aqua-teal)'},
          {title: 'Fuchsia', value: 'var(--brand-fuchsia)'},
          {title: 'Creamy Beige', value: 'var(--brand-creamy-beige)'},
          {title: 'Black', value: 'var(--brand-black)'},
          {title: 'White', value: 'var(--brand-white)'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'var(--brand-warm-yellow)',
    }),
  ],
})
