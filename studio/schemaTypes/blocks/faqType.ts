import { defineType, defineField, defineArrayMember } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ Section',
  type: 'object', 
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),

    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
    }),

    defineField({
      name: 'items',
      title: 'FAQ Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
            }),
          ],
        }),
      ],
    }),
  ],
})