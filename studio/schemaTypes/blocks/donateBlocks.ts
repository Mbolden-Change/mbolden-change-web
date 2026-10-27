import {defineArrayMember, defineField, defineType} from 'sanity'
import {fundsErrors, isShown} from './fundRules'

/** A Zeffy donation form, by the last part of its Zeffy address. */
export const zeffyFormType = defineType({
  name: 'zeffyForm',
  title: 'Zeffy form',
  type: 'object',
  description:
    'For zeffy.com/en-US/donation-form/power-bold-solutions, enter power-bold-solutions. It loads as Zeffy’s donation-form embed.',
  options: {collapsible: false},
  fields: [
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
      description: 'The link text is the link title. A path on this site, such as /what-were-tackling#gateway-fund, opens in the same tab unless “Open in” says New tab.',
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
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((value) => {
            const errors = fundsErrors(value as Parameters<typeof fundsErrors>[0])
            return errors.length ? errors : true
          }),
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
              // Only a card has a button, so a hidden fund can leave it empty.
              validation: (Rule) =>
                Rule.custom((value, context) =>
                  value?.trim() || !isShown((context.parent ?? {}) as {showOnDonatePage?: boolean})
                    ? true
                    : 'Required',
                ),
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
            defineField({
              name: 'linkId',
              title: 'Link ID',
              type: 'string',
              description:
                'Optional. Lets other pages link straight to this fund’s form, such as /donate#gateway-fund.',
              validation: (Rule) =>
                Rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).error('Use lowercase letters, numbers and hyphens.'),
            }),
            defineField({
              name: 'showOnDonatePage',
              title: 'Show on Donate page',
              type: 'boolean',
              initialValue: true,
              description:
                "Off: no card on the Donate page, but links to /donate#<link ID> still open this fund's form. Up to 3 funds can be shown.",
            }),
          ],
          preview: {
            select: {title: 'title', form: 'form.id', showOnDonatePage: 'showOnDonatePage'},
            prepare: ({title, form, showOnDonatePage}) => ({
              title,
              subtitle: isShown({showOnDonatePage}) ? form : 'Hidden',
            }),
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
