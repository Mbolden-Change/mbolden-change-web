import { MetadataRoute } from 'next';
import type { SanityDocument } from '@sanity/client';
import { sanityFetch } from '@/sanity/lib/fetch';

async function getData() {
  const query = `*[_type in ["caseStudy", "statement", "page", "report"] && defined(slug.current)] {
    "currentSlug": slug.current,
    "updated": _updatedAt,
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
    const dynamicPages: MetadataRoute.Sitemap = data.map((item: SanityDocument) => {
        let path;
        let priority = 0.9;
        
        //Add other document types here
        if (item._type === 'caseStudy') {
          path = `/case-study/${item.currentSlug}`;
        } else if (item._type === 'statement') {
          path = `/statement/${item.currentSlug}`;
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
    ];
}