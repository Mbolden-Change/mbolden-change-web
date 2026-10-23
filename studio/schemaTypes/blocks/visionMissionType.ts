import {defineField, defineType} from 'sanity'

/** Vision in large type, a full-width illustration, then the mission, on black. */
export const visionMissionType = defineType({
  name: 'visionMission',
  title: 'Vision and Mission',
  type: 'object',
  fields: [
    defineField({name: 'visionEyebrow', title: 'Vision eyebrow', type: 'string', initialValue: 'Our Vision'}),
    defineField({
      name: 'vision',
      title: 'Vision',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Illustration',
      type: 'image',
      description: 'Shown full width with slightly angled top and bottom edges.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the illustration for screen readers.',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'imageLabel',
      title: 'Illustration label',
      type: 'string',
      description: 'Optional black label over the bottom left of the illustration, such as “Building the Road to Systemic Equity”.',
    }),
    defineField({
      name: 'imageNote',
      title: 'Illustration note',
      type: 'string',
      description: 'Optional small line under the label, such as “An illustrated journey in eight stops. Scroll to walk the road.”',
    }),
    defineField({
      name: 'imageLink',
      title: 'Illustration link',
      type: 'internalOrExternalLink',
      description:
        'Optional. Makes the illustration, label and a yellow button one clickable card. The button text is the link title, such as “Build with us”. A link to /building-the-road opens the road journey over this page.',
    }),
    defineField({name: 'missionEyebrow', title: 'Mission eyebrow', type: 'string', initialValue: 'Our Mission'}),
    defineField({
      name: 'mission',
      title: 'Mission',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'actionEyebrow',
      title: 'Extra row eyebrow',
      type: 'string',
      description: 'Optional row after the mission, such as “mBOLDen Action”.',
    }),
    defineField({
      name: 'actionText',
      title: 'Extra row text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'actionLink',
      title: 'Extra row button',
      type: 'internalOrExternalLink',
      description: 'Optional yellow button. The button text is the link title; links that open a new tab get ↗.',
    }),
  ],
  preview: {
    select: {subtitle: 'vision', media: 'image'},
    prepare({subtitle, media}) {
      return {title: 'Vision and Mission', subtitle, media}
    },
  },
})
