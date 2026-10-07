import {defineField, defineType} from 'sanity'

export const storyHighlightType = defineType({
  name: 'storyHighlight',
  title: 'Story Highlight',
  type: 'object',
  description:
    'Partner or case-study narrative with optional quote, parallelogram media, headline, body, and CTA. Use when the story lives on the page — not just a link out.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional short label (e.g. “Partner story”).',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: 'Optional embedded partner voice. Keep shorter when media is present.',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote attribution',
      type: 'string',
      description: 'Name of the person quoted.',
      hidden: ({parent}) => !parent?.quote,
    }),
    defineField({
      name: 'quoteCredentials',
      title: 'Quote credentials',
      type: 'string',
      description: 'Role / organization for the person quoted.',
      hidden: ({parent}) => !parent?.quote,
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The story title beside the quote and photo. Required.',
      validation: (Rule) => Rule.required().error('Headline is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 6,
      description: 'The narrative under the headline. Required. Use this when the story lives on the page.',
      validation: (Rule) => Rule.required().error('Body is required.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Optional tilted photo. Leave empty when photography is not ready.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the photo for screen readers. Required when an image is set.',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              if (parent?.asset && !alt) {
                return 'Alt text is required when an image is set.'
              }
              return true
            }),
        }),
      ],
    }),
    defineField({
      name: 'mediaPosition',
      title: 'Media position',
      type: 'string',
      description: 'Desktop column for quote/media. Mobile stacks media first.',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'internalOrExternalLink',
      description: 'Optional link under the body. Leave empty when the story lives entirely on this page.',
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
      eyebrow: 'eyebrow',
      media: 'image',
    },
    prepare({headline, eyebrow, media}) {
      return {
        title: headline
          ? `Story Highlight — ${headline}`
          : 'Story Highlight',
        subtitle: eyebrow || undefined,
        media,
      }
    },
  },
})
