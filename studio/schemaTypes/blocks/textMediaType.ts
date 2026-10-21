import {defineField, defineType} from 'sanity'

export const textMedia = defineType({
  name: 'textMedia',
  title: 'Text & Media',
  type: 'object',
  description:
    'Primary 50/50 content block — headline, body copy, optional CTAs, and an image or video. Use this instead of the legacy Fifty-Fifty block for new pages.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'Optional focus-area label above the headline.'}),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string', description: 'Optional supporting line beneath the headline.'}),
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description:
        'Optional unique name for links to this section. Use lowercase words separated by hyphens, such as meeting-basic-needs. Choose this section in a link’s “Section on this page” destination.',
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).error(
          'Use lowercase letters, numbers, and hyphens.',
        ),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Section headline. Keep to one strong line.',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'textBody',
      title: 'Text Body',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Supporting copy beside the media.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaPosition',
      title: 'Media position',
      type: 'string',
      description: 'On large screens, place media on the left or right of the text.',
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
      name: 'mobileLayout',
      title: 'Mobile layout',
      type: 'string',
      description: 'On mobile, choose whether media or text appears first.',
      options: {
        list: [
          {title: 'Media on top', value: 'imageTop'},
          {title: 'Text on top', value: 'textTop'},
        ],
        layout: 'radio',
      },
      initialValue: 'imageTop',
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'object',
      description: 'Add an image or a YouTube/Vimeo URL — not both.',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          description: 'A photo with an angled brand crop. Use this or a video URL, not both.',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the photo for screen readers. Required when an image is set.',
            }),
          ],
          hidden: ({parent}) => !!parent?.videoUrl,
        }),
        defineField({
          name: 'videoUrl',
          title: 'Video URL',
          type: 'url',
          description: 'YouTube or Vimeo URL. Videos use a rectangular player with sharp corners. Supports standard videos and YouTube Shorts.',
          hidden: ({parent}) => !!parent?.image,
        }),
      ],
    }),
    defineField({
      name: 'ctas',
      title: 'Call To Actions',
      type: 'array',
      description:
        'Up to two buttons. First link renders as primary (skewed black); second as outline.',
      of: [
        {
          name: 'cta',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Button Text',
              type: 'string',
              description:
                'Short, action-oriented label. Required. The first button is the primary skewed button. The second is an outline.',
              validation: (Rule) => Rule.required().max(50),
            }),
            defineField({
              name: 'link',
              title: 'Link (Optional)',
              type: 'url',
              description: 'Leave blank to show a non-clickable info tag instead.',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
      mediaImage: 'media.image',
      videoUrl: 'media.videoUrl',
      mediaPosition: 'mediaPosition',
    },
    prepare({headline, mediaImage, videoUrl, mediaPosition}) {
      const side = mediaPosition === 'left' ? 'Media left' : 'Media right'
      return {
        title: headline ? `Text & Media — ${headline}` : 'Text & Media',
        subtitle: [side, videoUrl ? 'Video' : 'Image'].filter(Boolean).join(' · '),
        media: mediaImage,
      }
    },
  },
})
