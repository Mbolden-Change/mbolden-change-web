import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

type ComponentsMap = {
  [key: string]: ComponentType<any>;
};

const componentMap: ComponentsMap = {
  hero: dynamic(() => import('@/components/blocks/Hero/Hero')),
  pillarContainer: dynamic(() => import('@/components/v2/blocks/Pillars/Pillars')),
  pillars: dynamic(() => import('@/components/v2/blocks/Pillars/Pillars')),
  fiftyFifty: dynamic(() => import('@/components/blocks/FiftyFifty')),
  richText: dynamic(() => import('@/components/blocks/RichText')),
  statementBanner: dynamic(
    () => import('@/components/blocks/StatementBanner'),
  ),
  resourceBanner: dynamic(
    () => import('@/components/v2/blocks/ResourceBanner/ResourceBanner'),
  ),
  heroCarousel: dynamic(() => import('@/components/blocks/Hero/HeroCarousel')),
  testimonialsCarousel: dynamic(
    () => import('@/components/v2/blocks/Testimonials/Testimonials'),
  ),
  tabsContainer: dynamic(
    () => import('@/components/v2/blocks/TabbedContent/TabbedContent'),
  ),
  cardGallery: dynamic(
    () => import('@/components/blocks/CardGallery/CardGallery'),
  ),
  caseStudyHighlight: dynamic(
    () => import('@/components/blocks/CaseStudyHighlight/CaseStudyHighlight'),
  ),
  holidayCard: dynamic(
    () => import('@/components/blocks/HolidayCard/HolidayCard'),
  ),
  textMedia: dynamic(() => import('@/components/v2/blocks/TextMedia/TextMedia')),
  faq: dynamic(() => import('@/components/blocks/FAQ/Accordian')),
  impactHero: dynamic(
    () => import('@/components/v2/blocks/ImpactHero/ImpactHero'),
  ),
  pageHeader: dynamic(
    () => import('@/components/v2/blocks/PageHeader/PageHeader'),
  ),
  leadership: dynamic(
    () => import('@/components/v2/blocks/Leadership/Leadership'),
  ),
  topicList: dynamic(
    () => import('@/components/v2/blocks/TopicList/TopicList'),
  ),
  stackedEntries: dynamic(
    () => import('@/components/v2/blocks/StackedEntries/StackedEntries'),
  ),
  resourceList: dynamic(
    () => import('@/components/v2/blocks/ResourceList/ResourceList'),
  ),
  storyHighlight: dynamic(
    () => import('@/components/v2/blocks/StoryHighlight/StoryHighlight'),
  ),
  wordReel: dynamic(
    () => import('@/components/v2/blocks/WordReel/WordReel'),
  ),
  visionMission: dynamic(
    () => import('@/components/v2/blocks/VisionMission/VisionMission'),
  ),
  timeline: dynamic(
    () => import('@/components/v2/blocks/Timeline/Timeline'),
  ),
  getInTouch: dynamic(
    () => import('@/components/v2/blocks/GetInTouch/GetInTouch'),
  ),
  colorBlockHero: dynamic(
    () => import('@/components/v2/readyToGrow/ColorBlockHero'),
  ),
  caseStudyCards: dynamic(
    () => import('@/components/v2/readyToGrow/CaseStudyCards'),
  ),
  funderCta: dynamic(
    () => import('@/components/v2/readyToGrow/FunderCta'),
  ),
  pageTeaser: dynamic(
    () => import('@/components/v2/readyToGrow/PageTeaser'),
  ),
  pointOfView: dynamic(
    () => import('@/components/v2/blocks/PointOfView/PointOfView'),
  ),
  policyText: dynamic(
    () => import('@/components/v2/blocks/PolicyText/PolicyText'),
  ),
  featuredIssue: dynamic(
    () => import('@/components/v2/blocks/FeaturedIssue/FeaturedIssue'),
  ),
  focusAreas: dynamic(
    () => import('@/components/v2/blocks/FocusAreas/FocusAreas'),
  ),
  boltSteps: dynamic(
    () => import('@/components/v2/blocks/BoltSteps/BoltSteps'),
  ),
  toolCards: dynamic(
    () => import('@/components/v2/blocks/ToolCards/ToolCards'),
  ),

  // Add more components as needed
};

export default componentMap;
