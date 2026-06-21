import {defineField, defineType} from 'sanity'

export const impactHeroType = defineType({
  name: 'impactHero',
  title: 'Impact Hero Section',
  type: 'object',
  description:
    'Primary page hero with a headline, optional subheading, image or video, and up to two call-to-action buttons. Replaces the legacy Hero Carousel for new pages.',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Short label above the headline (optional). Use sentence case.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main hero headline. Keep to one strong line (roughly 5–10 words).',
      validation: (Rule) => Rule.required().error('Heading is required.'),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Supporting line below the headline (optional). One or two sentences.',
    }),
    defineField({
      name: 'mediaPosition',
      title: 'Media position',
      type: 'string',
      description: 'On large screens, place the image or video on the left or right of the text.',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'object',
      description: 'Add an image or a video URL — not both. Image is preferred for most hero layouts.',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Hero image. Use real photography; avoid illustrations of people.',
          hidden: ({parent}) => !!parent?.videoUrl,
        }),
        defineField({
          name: 'videoUrl',
          title: 'Video URL',
          type: 'url',
          description: 'YouTube or Vimeo URL. Supports standard videos and YouTube Shorts.',
          hidden: ({parent}) => !!parent?.image,
        }),
      ],
    }),
    defineField({
      name: 'cta1',
      title: 'CTA 1',
      type: 'internalOrExternalLink',
      description: 'Primary call-to-action button (e.g. Donate, Sign up, Read more).',
    }),
    defineField({
      name: 'cta2',
      title: 'CTA 2',
      type: 'internalOrExternalLink',
      description: 'Optional secondary button. Leave blank if only one action is needed.',
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      eyebrow: 'eyebrow',
      subheading: 'subheading',
      mediaImage: 'media.image',
      videoUrl: 'media.videoUrl',
    },
    prepare({heading, eyebrow, subheading, mediaImage, videoUrl}) {
      const mediaLabel = videoUrl ? 'Video hero' : 'Image hero'
      return {
        title: heading ? `Impact Hero — ${heading}` : 'Impact Hero',
        subtitle: [eyebrow, mediaLabel, subheading].filter(Boolean).join(' · '),
        media: mediaImage,
      }
    },
  },
})
