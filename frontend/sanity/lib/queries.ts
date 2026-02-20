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
   _type == "caseStudyHighlight" => {
    ...,
    cta{
      isExternalLink,
      url,
      target,
      title,
      reference->{
        _type,
        slug
      }
    },
    "themeColour": coalesce(themeColour, "var(--brand-warm-yellow)"),
    image{
      ...,
      "lqip": asset->metadata.lqip
    }
  },
    _type == "statementBanner" => {
      ...,
      cta{
        label,
        statement->{ "slug": slug.current }
      },
      link,
      linkLabel
    },
    _type == "heroCarousel" => {
      ...,
      slides[]{
        ...,
        "mediaType": coalesce(
          select(
            layout == "full" => fullMediaType,
            layout == "split" => splitRightMediaType
          ),
          mediaType
        ),
        "videoFile": coalesce(
          select(
            layout == "full" => fullVideoFile,
            layout == "split" => splitRightVideoFile
          ),
          videoFile
        ){
          ...,
          "url": asset->url
        },
        "image": coalesce(
          select(
            layout == "full" => fullImage,
            layout == "split" => splitRightImage
          ),
          splitRightImage,
          fullImage,
          image
        ){ ..., asset },
        leftBackgroundImage{ ..., asset },
        link{
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        }
      }
    },
    _type == "coryHeroCarousel" => {
      ...,
      slides[]{
        ...,
        "mediaType": coalesce(
          select(
            layout == "full" => fullMediaType,
            layout == "split" => splitRightMediaType
          ),
          mediaType
        ),
        "videoFile": coalesce(
          select(
            layout == "full" => fullVideoFile,
            layout == "split" => splitRightVideoFile
          ),
          videoFile
        ){
          ...,
          "url": asset->url
        },
        "image": coalesce(
          select(
            layout == "full" => fullImage,
            layout == "split" => splitRightImage
          ),
          splitRightImage,
          fullImage,
          image
        ){ ..., asset },
        leftBackgroundImage{ ..., asset },
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
    },
    _type == "cardGallery" => {
      ...,
      cards[] {
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
    _type == "holidayCard" => {
      ...,
       link{
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        },
    },
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

export const POPUPMODAL_QUERY = defineQuery(`*[_type == 'popUpModal'][0]{
  ...,
  CTA{
  ...,
  reference-> {
  _type,
  slug}
  },
  }`);
// export const POPUPMODAL_QUERY = defineQuery(`*[_type == 'popUpModal'][0]{
//   title,
//   CTA,
//   }`);

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

export const CASESTUDY_QUERY = defineQuery(`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    heading,
    subheading,
    date,
    "slug": slug.current,
    text,
    pdfDownload{
      "url": asset->url,
      originalFilename
    }
  }
`);

export const REPORT_QUERY = defineQuery(`
  *[_type == "report" && slug.current == $slug][0]{
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
