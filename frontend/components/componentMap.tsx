import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

type ComponentsMap = {
  [key: string]: ComponentType<any>;
};

const componentMap: ComponentsMap = {
  hero: dynamic(() => import('@/components/blocks/Hero/Hero')),
  pillarContainer: dynamic(() => import('@/components/Pillars')),
  fiftyFifty: dynamic(() => import('@/components/blocks/FiftyFifty')),
  richText: dynamic(() => import('@/components/blocks/RichText')),
  statementBanner: dynamic(() => import('@/components/blocks/StatementBanner')),
  heroCarousel: dynamic(() => import('@/components/blocks/Hero/HeroCarousel')),
  testimonialsCarousel: dynamic(
    () => import('@/components/blocks/Testimonials/TestimonialsCarousel')
  ),
  tabsContainer: dynamic(
    () => import('@/components/blocks/TabbedContent/TabbedContent')
  ),
  cardGallery: dynamic(
    () => import('@/components/blocks/CardGallery/CardGallery')
  ),
  caseStudyHighlight: dynamic(
    () => import('@/components/blocks/CaseStudyHighlight/CaseStudyHighlight')
  ),
  holidayCard: dynamic(
    () => import('@/components/blocks/HolidayCard/HolidayCard')
  ),
  // Add more components as needed
};

export default componentMap;
