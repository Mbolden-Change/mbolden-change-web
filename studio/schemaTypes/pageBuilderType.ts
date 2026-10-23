import {defineArrayMember, defineType} from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'pageHeader',
      title: 'Page Header',
    }),
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
      type: 'topicList',
      title: 'Topic List',
    }),
    defineArrayMember({
      type: 'boltSteps',
      title: 'Bolt Steps',
    }),
    defineArrayMember({
      type: 'featuredIssue',
      title: 'Featured Issue',
    }),
    defineArrayMember({
      type: 'focusAreas',
      title: 'Focus Areas',
    }),
    defineArrayMember({
      type: 'wordReel',
      title: 'Word Reel',
    }),
    defineArrayMember({
      type: 'visionMission',
      title: 'Vision and Mission',
    }),
    defineArrayMember({
      type: 'timeline',
      title: 'Timeline',
    }),
    defineArrayMember({
      type: 'getInTouch',
      title: 'Get in Touch',
    }),
    defineArrayMember({
      type: 'campaignBanner',
      title: 'Campaign Banner',
    }),
    defineArrayMember({
      type: 'donateHero',
      title: 'Donate Hero',
    }),
    defineArrayMember({
      type: 'fundCards',
      title: 'Fund Cards',
    }),
    defineArrayMember({
      type: 'givingOptions',
      title: 'Other Ways to Give',
    }),
    defineArrayMember({
      type: 'donorQuote',
      title: 'Quote',
    }),
    defineArrayMember({
      type: 'stackedEntries',
      title: 'Stacked Entries',
    }),
    defineArrayMember({
      type: 'resourceList',
      title: 'Resource List',
    }),
    defineArrayMember({
      type: 'storyHighlight',
      title: 'Story Highlight',
    }),
    defineArrayMember({
      type: 'pointOfView',
      title: 'Point of View',
    }),
    defineArrayMember({
      type: 'colorBlockHero',
      title: 'Hero with Color Blocks',
    }),
    defineArrayMember({
      type: 'caseStudyCards',
      title: 'Case Study Cards',
    }),
    defineArrayMember({
      type: 'funderCta',
      title: 'Funder Invitation',
    }),
    defineArrayMember({
      type: 'pageTeaser',
      title: 'Page Teaser',
    }),
    defineArrayMember({
      type: 'featuredGuide',
      title: 'Featured Guide',
    }),
    defineArrayMember({
      type: 'resourceLibrary',
      title: 'Resource Library',
    }),
    defineArrayMember({
      type: 'partnerResources',
      title: 'Partner Resources',
    }),
    defineArrayMember({
      type: 'statementCards',
      title: 'Statement Cards',
    }),
    defineArrayMember({
      type: 'newsRecord',
      title: 'News Record',
    }),
    defineArrayMember({
      type: 'mediaContact',
      title: 'Media Contact',
    }),
    defineArrayMember({
      type: 'toolCards',
      title: 'Tool Cards',
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
      type: 'policyText',
      title: 'Policy Text',
    }),
    defineArrayMember({
      type: 'leadership',
      title: 'Leadership',
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
