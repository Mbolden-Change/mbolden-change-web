import { MetadataRoute } from 'next';
import type { SanityDocument } from '@sanity/client';
import { client } from '@/sanity/lib/client';

async function getData() {
  const query = `*[_type in ["caseStudy", "statement", "page"] && defined(slug.current)] {
    "currentSlug": slug.current,
    "updated": _updatedAt,
    _type
  }`;

  const data = await client.fetch(query);
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
          priority =0.8;
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