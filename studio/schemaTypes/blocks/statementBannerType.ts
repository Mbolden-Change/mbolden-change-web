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
            name: 'mediaProperties',
            title: 'Image Position',
            type: 'string',
            options: {
                list: [
                    { title: 'Image Left', value: 'left' },
                    { title: 'Image Right', value: 'right' },
                    { title: 'No Image', value: 'no-image'}
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'rightImage',
            title: 'Right Column Image',
            type: 'image',
            fields: [{ title: 'Alt Text', name: 'alt', type: 'string' }],
            options: {
                hotspot: true,
            },
            hidden: ({ parent }) => parent?.mediaProperties !== 'right'  && parent?.mediaProperties !== 'no-image',
        }),
        defineField({
            name: 'leftImage',
            title: 'Left Column Image',
            type: 'image',
            fields: [{ title: 'Alt Text', name: 'alt', type: 'string' }],
            options: {
                hotspot: true,
            },
            hidden: ({ parent }) => parent?.mediaProperties !== 'left'  && parent?.mediaProperties !== 'no-image',
        }),
    defineField({
            name: 'leftHeadline',
            title: 'Left Column Headline',
            description: 'Optional headline for the text block.',
            type: 'string',
            hidden: ({ parent }) => parent?.mediaProperties  !== 'right',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                  const leftImage = (context.parent as any).leftImage;
                  if (value && leftImage) {
                    return 'Cannot add with left image present';
                  }
                  return true
                }),
        }),
        defineField({
            name: 'leftText',
            title: 'Left Column Text',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }) => parent?.mediaProperties  !== 'right',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const leftImage = (context.parent as any).leftImage;
                    if (value && leftImage) {
                      return 'Cannot add with left image present';
                    }
                    return true
                  }),
            }),
            defineField({
            name: 'rightHeadline',
            title: 'Right Column Headline',
            description: 'Optional headline for the text block.',
            type: 'string',
            hidden: ({ parent }) => parent?.mediaProperties !== 'left',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const rightImage = (context.parent as any).rightImage;
                    if (value && rightImage) {
                      return 'Cannot add with right image present';
                    }
                    return true
                  }),
        }),
        defineField({
            name: 'rightText',
            title: 'Right Column Text',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }) => parent?.mediaProperties  !== 'left',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const rightImage = (context.parent as any).rightImage;
                    if (value && rightImage) {
                      return 'Cannot add with right image present';
                    }
                    return true
                  }),
        }),
    // defineField({
    // name: 'image',
    // title: 'Image',
    // type: 'image',
    // description: 'Add Optional Image',
    // options: {
    //     hotspot: true,
    // },
    // fields: [
    //     {
    //     title: 'Alt Text',
    //     name: 'alt',
    //     type: 'string',
    //     validation: Rule => Rule.custom((alt, context) => {
    //         //@ts-ignore
    //     const image = context.parent.asset;

    //     if (image && !alt) {
    //       return 'Alt text is required when an image is set';
    //     }
    //     if (!image && alt) {
    //       return 'You must upload an image if you provide alt text';
    //     }
    //     return true;
    //   })
    //     },
    // ],
    // }),
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
