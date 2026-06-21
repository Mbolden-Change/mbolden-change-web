import {defineArrayMember, defineType} from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'hero',
    }),
    defineArrayMember({
      type: 'richText',
    }),
    defineArrayMember({
      type: 'fiftyFifty',
    }),
    defineArrayMember({
      type: 'statementBanner',
    }),
    defineArrayMember({
      type: 'resourceBanner',
    }),
    defineArrayMember({
      type: 'heroCarousel',
    }),
    defineArrayMember({
      type: 'pillars',
    }),
    defineArrayMember({
      type: 'testimonialsCarousel',
    }),
    defineArrayMember({
      type: 'tabsContainer',
    }),
    defineArrayMember({
      type: 'tab',
    }),
    defineArrayMember({
      type: 'cardGallery',
    }),
    defineArrayMember({
      type: 'caseStudyHighlight',
    }),
    defineArrayMember({
      type: 'holidayCard',
    }),
    defineArrayMember({type: 'faq'}),
    defineArrayMember({
      type: 'textMedia',
    }),
    defineArrayMember({
      type: 'impactHero',
    }),
  ],
})
