import {defineField, defineType} from 'sanity'

export const statementBannerType = defineType({
  name: 'statementBanner',
  title: 'Statement Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      description: 'Add the statement headline here.',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      description: 'Add the main statement text here.',
      rows: 5,
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      description: 'Optional call to action button.',
      fields: [
        {
          name: 'label',
          title: 'Button text',
          type: 'string',
          initialValue: 'Read Full Statement',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'statement',
          title: 'Statement to link',
          type: 'reference',
          to: [{type: 'statement'}],
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description:
        'Optional URL to link to if no statement is selected in the CTA. This is a workaround for now while we transition to using internal/external link type',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link Label',
      type: 'string',
      description:
        'Optional text for the link if no statement is selected in the CTA. This is a workaround for now while we transition to using internal/external link type',
      initialValue: 'Read More',
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
    }),
  ],
  preview: {
    select: {title: 'headline'},
    prepare({title}) {
      return {
        title: `Statement Banner — ${title} || 'Statement Banner`,
      }
    },
  },
})

//TODO: Changing of the cta to be an object, with a reference to the statement document, also need to render a statement docuement page, statement/slug route.
