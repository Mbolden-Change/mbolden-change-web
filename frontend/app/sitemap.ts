import { MetadataRoute } from 'next';
import type { SanityDocument } from '@sanity/client';
import { sanityFetch } from '@/sanity/lib/fetch';

async function getData() {
  const query = `*[_type in ["caseStudy", "programCaseStudy", "employerGuide", "statement", "letter", "page", "report"] && defined(slug.current)] {
    "currentSlug": slug.current,
    "updated": _updatedAt,
    section,
    _type
  }`;

  const data = await sanityFetch<SanityDocument[]>(query);
  return data;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await getData()
    const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : 'https://www.mboldenchange.org';
    // The homepage is a page with the slug "/", listed once below as the base URL.
    const dynamicPages: MetadataRoute.Sitemap = data
      .filter((item: SanityDocument) => !(item._type === 'page' && item.currentSlug === '/'))
      .map((item: SanityDocument) => {
        let path;
        let priority = 0.9;
        
        //Add other document types here
        if (item._type === 'caseStudy') {
          path = `/case-study/${item.currentSlug}`;
        } else if (item._type === 'programCaseStudy') {
          path = item.section === 'resources' ? `/resources/${item.currentSlug}` : `/ready-to-grow/${item.currentSlug}`;
        } else if (item._type === 'employerGuide') {
          path = `/resources/${item.currentSlug}`;
        } else if (item._type === 'statement') {
          path = `/statement/${item.currentSlug}`;
        } else if (item._type === 'letter') {
          path = `/letter/${item.currentSlug}`;
        } else if (item._type === 'page') {
          path = `/${item.currentSlug}`;
        } else if (item._type === 'report') {
          path = `/report/${item.currentSlug}`;
        }
        

        return {
            url: `${baseUrl}${path}`,
            lastModified: new Date(item.updated),
            changeFrequency: 'monthly',
            priority,
        };
    });
    return [
        {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,  
        },
        ...dynamicPages,
        // Pages built in code rather than in Studio.
        {
        url: `${baseUrl}/building-the-road`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
        },
    ];
}