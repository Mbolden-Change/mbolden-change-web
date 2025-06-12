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
      type: 'heroCarousel',
    }),
    defineArrayMember({
      type: 'pillarContainer',
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
      type: 'logoGarden'
    }),
  ],
})
