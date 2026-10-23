import {defineArrayMember, defineField, defineType} from 'sanity'

/** A Zeffy form or campaign, by the last part of its Zeffy address. */
export const zeffyFormType = defineType({
  name: 'zeffyForm',
  title: 'Zeffy form',
  type: 'object',
  description:
    'The last part of the Zeffy address. For zeffy.com/en-US/donation-form/power-bold-solutions, choose Donation form and enter power-bold-solutions.',
  options: {collapsible: false},
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      initialValue: 'donation-form',
      options: {
        list: [
          {title: 'Donation form', value: 'donation-form'},
          {title: 'Peer-to-peer campaign', value: 'peer-to-peer'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'id',
      title: 'Form ID',
      type: 'string',
      description: 'Such as power-bold-solutions.',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {name: 'Zeffy form ID'}),
    }),
  ],
})

const LANES = [
  {title: 'Black', value: 'black'},
  {title: 'Yellow', value: 'yellow'},
  {title: 'Teal', value: 'teal'},
  {title: 'Fuchsia', value: 'fuchsia'},
]

/** Yellow strip above the page for a seasonal campaign. Off unless switched on. */
export const campaignBannerType = defineType({
  name: 'campaignBanner',
  title: 'Campaign Banner',
  type: 'object',
  description: 'A yellow strip with a line of text and a link, for a campaign such as the holiday appeal. Hidden while switched off.',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show the banner',
      type: 'boolean',
      initialValue: false,
      description: 'Switch on for the campaign, off when it ends.',
    }),
    defineField({
      name: 'heading',
      title: 'Bold lead',
      type: 'string',
      description: 'Such as “This season, Give Boldly.”',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      description: 'Follows the bold lead, such as “Gifts made by December 31 count as 2026 donations.”',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'internalOrExternalLink',
      description: 'The link text is the link title. External links open in a new tab.',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const banner = value as {enabled?: boolean; heading?: string; text?: string} | undefined
      if (!banner?.enabled) return true
      return banner.heading?.trim() || banner.text?.trim() ? true : 'Add the bold lead or text before switching the banner on.'
    }),
  preview: {
    select: {enabled: 'enabled', title: 'heading', text: 'text'},
    prepare: ({enabled, title, text}) => ({
      title: `Campaign Banner — ${enabled ? 'on' : 'off'}`,
      subtitle: title || text || 'No text yet',
    }),
  },
})

/** Donate page hero: heading and intro beside the main Zeffy form. */
export const donateHeroType = defineType({
  name: 'donateHero',
  title: 'Donate Hero',
  type: 'object',
  description:
    'Eyebrow, heading and intro on cream with the Charity Navigator badge, beside a Zeffy form that loads with the page.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Donate'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The page’s main heading.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'form',
      title: 'Zeffy form',
      type: 'zeffyForm',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showCharityBadge',
      title: 'Show the Charity Navigator badge',
      type: 'boolean',
      initialValue: true,
      description: 'Under the intro. The badge image, alt text and link are in Site Settings.',
    }),
    defineField({
      name: 'badgeText',
      title: 'Text beside the badge',
      type: 'string',
      initialValue: 'A Four-Star Charity on Charity Navigator. Gifts are tax-deductible.',
    }),
  ],
  preview: {
    select: {title: 'heading', form: 'form.id'},
    prepare: ({title, form}) => ({title: `Donate Hero — ${title ?? ''}`, subtitle: form}),
  },
})

/** Cards for choosing a fund; each opens that fund's Zeffy form in a pop-up. */
export const fundCardsType = defineType({
  name: 'fundCards',
  title: 'Fund Cards',
  type: 'object',
  description: 'A card for each fund. Its button opens a pop-up with the fund’s Zeffy form.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Your Choice'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'funds',
      title: 'Funds',
      type: 'array',
      description: 'In order; drag to reorder. Three fit in a row.',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'fund',
          title: 'Fund',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({
              name: 'buttonLabel',
              title: 'Button text',
              type: 'string',
              description: 'Such as “Give to the Gateway Fund”.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'lane',
              title: 'Lane color',
              type: 'string',
              description: 'The bar on the card and the pop-up, and the button underline.',
              initialValue: 'teal',
              options: {list: LANES, layout: 'radio', direction: 'horizontal'},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'form',
              title: 'Zeffy form',
              type: 'zeffyForm',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'form.id'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading', count: 'funds.length'},
    prepare: ({title, count}) => ({
      title: `Fund Cards — ${title ?? ''}`,
      subtitle: `${count ?? 0} fund${count === 1 ? '' : 's'}`,
    }),
  },
})

/** Teal section of white cards: mail, donor-advised funds, employer match, stock. */
export const givingOptionsType = defineType({
  name: 'givingOptions',
  title: 'Other Ways to Give',
  type: 'object',
  description: 'White cards on teal, two to a row. Email addresses in the text become email links.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'More Options'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'options',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'option',
          title: 'Card',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({
              name: 'detail',
              title: 'Details',
              type: 'text',
              rows: 2,
              description: 'Set in bold under the text, such as the EIN or transfer details. Line breaks are kept.',
            }),
            defineField({
              name: 'note',
              title: 'Text after the details',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'emailSubject',
              title: 'Email subject',
              type: 'string',
              description: 'For email links in this card, such as “Gift of stock”.',
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: `Other Ways to Give — ${title ?? ''}`}),
  },
})

/** One large fuchsia quote on white, such as a donor's words. */
export const donorQuoteType = defineType({
  name: 'donorQuote',
  title: 'Quote',
  type: 'object',
  description: 'An eyebrow and one large fuchsia quote with its credit, on white.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Why Donors Give'}),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 5,
      description: 'Without quotation marks; they are added.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Credit',
      type: 'string',
      description: 'Such as “Jeanne & Roland Chan, donors”.',
    }),
  ],
  preview: {
    select: {title: 'attribution', subtitle: 'quote'},
    prepare: ({title, subtitle}) => ({title: `Quote — ${title ?? ''}`, subtitle}),
  },
})
