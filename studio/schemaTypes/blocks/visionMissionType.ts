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
    defineField({name: 'missionEyebrow', title: 'Mission eyebrow', type: 'string', initialValue: 'Our Mission'}),
    defineField({
      name: 'mission',
      title: 'Mission',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {subtitle: 'vision', media: 'image'},
    prepare({subtitle, media}) {
      return {title: 'Vision and Mission', subtitle, media}
    },
  },
})
