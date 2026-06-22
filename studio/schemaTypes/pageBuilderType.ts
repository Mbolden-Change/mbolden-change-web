import {defineArrayMember, defineType} from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'impactHero',
      title: 'Impact Hero',
    }),
    defineArrayMember({
      type: 'heroCarousel',
      title: 'Hero Carousel (Legacy)',
    }),
    defineArrayMember({
      type: 'hero',
      title: 'Hero Slide (Legacy)',
    }),
    defineArrayMember({
      type: 'pillars',
      title: 'Pillars',
    }),
    defineArrayMember({
      type: 'resourceBanner',
      title: 'Resource Banner',
    }),
    defineArrayMember({
      type: 'statementBanner',
      title: 'Statement Banner (Legacy)',
    }),
    defineArrayMember({
      type: 'fiftyFifty',
      title: '50/50 Section',
    }),
    defineArrayMember({
      type: 'textMedia',
      title: 'Text & Media (50/50)',
    }),
    defineArrayMember({
      type: 'caseStudyHighlight',
      title: 'Case Study Highlight',
    }),
    defineArrayMember({
      type: 'testimonialsCarousel',
      title: 'Testimonials Carousel',
    }),
    defineArrayMember({
      type: 'cardGallery',
      title: 'Card Gallery',
    }),
    defineArrayMember({
      type: 'richText',
      title: 'Rich Text',
    }),
    defineArrayMember({
      type: 'tabsContainer',
      title: 'Tabbed Content',
    }),
    defineArrayMember({
      type: 'tab',
      title: 'Tab',
    }),
    defineArrayMember({
      type: 'faq',
      title: 'FAQ',
    }),
    defineArrayMember({
      type: 'holidayCard',
      title: 'Holiday Card',
    }),
  ],
})
