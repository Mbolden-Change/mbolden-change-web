import {defineArrayMember, defineField, defineType} from 'sanity'

/** Page hero with three color blocks sliding in from the right, as on Ready to Grow. */
export const colorBlockHeroType = defineType({
  name: 'colorBlockHero',
  title: 'Hero with Color Blocks',
  type: 'object',
  description: 'Eyebrow, page heading and intro on cream, with teal, fuchsia and yellow blocks sliding in on the right.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The page’s main heading.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 4}),
    defineField({
      name: 'showBlocks',
      title: 'Show the color blocks',
      type: 'boolean',
      description: 'Turn off for a plain hero, as on Resources.',
      initialValue: true,
    }),
    defineField({
      name: 'backLink',
      title: 'Breadcrumb',
      type: 'internalOrExternalLink',
      description: 'Optional link above the eyebrow, such as "Resources". It shows with a ← arrow.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Hero with Color Blocks — ${title ?? ''}`}),
  },
})

/** A group of Ready to Grow case studies, shown as cards. */
export const caseStudyCardsType = defineType({
  name: 'caseStudyCards',
  title: 'Case Study Cards',
  type: 'object',
  description:
    'An eyebrow, a heading and a card for each case study. Each card shows the case study’s lane, pilot years, name, card summary and card stats.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Field-Tested Models'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Such as “Guaranteed Income”.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caseStudies',
      title: 'Case studies',
      type: 'array',
      description: 'In order; drag to reorder.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'programCaseStudy'}]})],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Card link text',
      type: 'string',
      initialValue: 'Read the case study',
    }),
  ],
  preview: {
    select: {title: 'heading', count: 'caseStudies.length'},
    prepare: ({title, count}) => ({
      title: `Case Study Cards — ${title ?? ''}`,
      subtitle: count ? `${count} case stud${count === 1 ? 'y' : 'ies'}` : undefined,
    }),
  },
})

/** The wording the Community-Centered Design Process loop starts with. The site uses the same text for any field left empty. */
const PROCESS_LOOP_STAGES = [
  {label: 'Listen', description: 'We listen to those closest to the challenges.'},
  {label: 'Build trust', description: "We become deeply integrated and invested in our partners' success."},
  {label: 'Co-create', description: 'There is no one size fits all.'},
  {label: 'Implement', description: "We implement alongside partners, or incubate when they're not positioned to."},
  {label: 'Learn & adapt', description: "Data and feedback inform what's next."},
  {
    label: 'Share back & listen',
    description: 'We bring what we learned back to community and partners, and start again.',
  },
]

/** Cream block with the animated Community-Centered Design Process loop, as on Ready to Grow. */
export const processLoopType = defineType({
  name: 'processLoop',
  title: 'Community-Centered Design Process',
  type: 'object',
  description:
    'Cream block with an animated loop of six stages ending in a lightning bolt, and a link that opens an email to the Advancement contact in Site Settings.',
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Our Community-Centered Design Process'}),
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      description:
        'Six stages, in the order the line travels. The first five sit along the line to the bolt and the sixth on the way back. Colors and positions follow the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processLoopStage',
          title: 'Stage',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Shown in capitals on the drawing. Keep it short.',
              validation: (Rule) => Rule.required().max(24),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'description'}},
        }),
      ],
      initialValue: PROCESS_LOOP_STAGES.map((stage) => ({_type: 'processLoopStage', ...stage})),
      validation: (Rule) => Rule.length(6),
    }),
    defineField({
      name: 'linkText',
      title: 'Link text',
      type: 'string',
      description:
        'Opens an email to the Advancement contact, with the same subject as the Funder Invitation on the page.',
      initialValue: 'Talk with us about funding a model',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Community-Centered Design Process — ${title ?? ''}`}),
  },
})

/** Yellow block inviting funders to email the Advancement contact. */
export const funderCtaType = defineType({
  name: 'funderCta',
  title: 'Funder Invitation',
  type: 'object',
  description:
    'Yellow block with a heading, text and a button that opens an email to the Advancement contact in Site Settings, with a line naming them underneath.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Partner With Us'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
    defineField({name: 'buttonLabel', title: 'Button text', type: 'string', initialValue: 'Get in Touch'}),
    defineField({name: 'emailSubject', title: 'Email subject', type: 'string'}),
    defineField({
      name: 'contactInText',
      title: 'Name the contact after the text',
      type: 'boolean',
      initialValue: false,
      description:
        'Ends the text with “Talk with Sue Sutherland, Director of Advancement.” instead of the line with the email under the button.',
    }),
    defineField({
      name: 'note',
      title: 'Note under the button',
      type: 'text',
      rows: 2,
      description: 'Small print, such as the 501(c)3 and EIN line.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Funder Invitation — ${title ?? ''}`}),
  },
})

/** A short row pointing to another page, such as the end of What We're Tackling. */
export const pageTeaserType = defineType({
  name: 'pageTeaser',
  title: 'Page Teaser',
  type: 'object',
  description: 'A short row with a heading, one line and a link to another page.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'text', title: 'Line', type: 'text', rows: 2}),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description: 'The link text is the link title.',
    }),
    defineField({
      name: 'tone',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          {title: 'Cream', value: 'cream'},
          {title: 'Yellow', value: 'yellow'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'cream',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Page Teaser — ${title ?? ''}`}),
  },
})
