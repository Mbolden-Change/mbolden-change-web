import { MetadataRoute } from 'next';
import type { SanityDocument } from '@sanity/client';
import { sanityFetch } from '@/sanity/lib/fetch';
import { POST_CANONICAL } from '@/lib/substackPosts/config';
import { POSTS_PATH, sitePostPath } from '@/lib/substackPosts/core';
import { getAllPosts } from '@/lib/substackPosts/posts';

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
    // Pages built in code rather than in Studio. A Studio page with the same
    // address is dropped below so no URL is listed twice.
    const codePages: MetadataRoute.Sitemap = ['/building-the-road', '/legal-providers', '/simulator', POSTS_PATH].map(
      (path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      })
    );
    // Substack posts are listed only once search engines are told our copy is
    // the original (POST_CANONICAL in lib/substackPosts/config.ts).
    const postPages: MetadataRoute.Sitemap =
      POST_CANONICAL === 'site'
        ? (await getAllPosts()).map((post) => ({
            url: `${baseUrl}${sitePostPath(post.slug)}`,
            lastModified: new Date(post.date),
            changeFrequency: 'monthly',
            priority: 0.7,
          }))
        : [];
    const codeUrls = new Set(codePages.map((page) => page.url));
    return [
        {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,  
        },
        ...dynamicPages.filter((page) => !codeUrls.has(page.url)),
        ...codePages,
        ...postPages,
    ];
}
