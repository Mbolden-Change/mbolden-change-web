import { defineQuery } from 'next-sanity';

export const PAGE_QUERY = defineQuery(`
*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  content[]{
    ...,
    _type == "statementBanner" => {
      ...,
      cta{
        label,
        statement->{ "slug": slug.current }
      },
      link{
        title,
        isExternalLink,
        url,
        target,
        reference->{ _type, slug }
      }
    },
    _type == "heroCarousel" => {
      ...,
      slides[]{
        ...,
        link{
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        }
      }
    },
    _type == "testimonialsCarousel" => {
      ...,
      link{
        title,
        isExternalLink,
        url,
        target,
        reference->{ _type, slug }
      },
      slides[]{
        ...,
        link{
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        }
      }
    }
  }
}
`);

export const FOOTER_QUERY = defineQuery(`*[_type == 'footer'][0] {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  columnCategories[]{
  ...,
  links[]{
  ...,
  reference-> {
  _type,
  slug}
  },
  },
  socialLinks[]{
  ...,},
  primaryLogo,
  secondaryLogo,
  organizationInfo,
  newsletterButton {
    isExternalLink,
    url,
    title,
    target,
    reference-> {
      _type,
      slug
    }
  }
}`);

export const PillarContainer_Query =
  defineQuery(`*[_type == "pillarContainer"][0]{
  title,
  description,
  pillars[]->{
    _id,
    image,
    headline,
    description
  }
}`);

export const HEADER_QUERY = defineQuery(`*[_type == 'header'][0]{
  ...,
  navigationLinks[]{
  ...,
  reference-> {
  _type,
  slug}
  },
  donateCTA{
  ...,
  buttonLink{
  ...,
  reference-> {
  _type,
  slug,}}
  }
  }`);

export const STATEMENT_QUERY = defineQuery(`
  *[_type == "statement" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    date,
    "slug": slug.current,
    text,
    pdfDownload{
      "url": asset->url,
      originalFilename
    }
  }
`);
