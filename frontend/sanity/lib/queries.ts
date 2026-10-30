import { defineQuery } from "next-sanity";

/** Project internal links so reference is dereferenced with slug (required by LinkAtom). */
const INTERNAL_OR_EXTERNAL_LINK = `{
  anchor,
  title,
  isExternalLink,
  url,
  target,
  reference->{ _type, slug, section }
}`;

export const PAGE_QUERY = defineQuery(`
*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  description,
  slug,
  content[]{
    ...,
       _type == "textMedia" => {
      ...,
      "themeColour": coalesce(themeColour, "var(--brand-warm-yellow)"),

      media{
        videoUrl,
        image{
          ...,
          asset,
          "lqip": asset->metadata.lqip
        }
      },

      ctas[]{
        label,
        link,
        newTab
      },

      "documentFile": documentButton{label, "slug": document->slug.current}
    },
    _type == "caseStudyHighlight" => {
    ...,
    cta${INTERNAL_OR_EXTERNAL_LINK},
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
    _type == "resourceBanner" => {
      ...,
      cta${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "heroCarousel" => {
      ...,
      slides[]{
        ...,
        link{
          anchor,
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
        anchor,
        title,
        isExternalLink,
        url,
        target,
        reference->{ _type, slug }
      },
      slides[]{
        ...,
        link{
          anchor,
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
          anchor,
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        }
      }
    },
    _type == "pillars" => {
      ...,
      pillars[]->{
        _id,
        image,
        headline,
        description
      }
    },
    _type == "visionMission" => {
      ...,
      actionLink${INTERNAL_OR_EXTERNAL_LINK},
      imageLink${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "timeline" => {
      ...,
      cta${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "caseStudyCards" => {
      ...,
      "cards": caseStudies[]->{
        _id,
        name,
        "slug": slug.current,
        color,
        lane,
        pilotYears,
        cardSummary,
        cardStats
      }
    },
    _type == "funderCta" => {
      ...,
      "contact": *[_id == "siteSettings"][0].advancementContact
    },
    _type == "featuredGuide" => {
      ...,
      link${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "pageTeaser" => {
      ...,
      link${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "colorBlockHero" => {
      ...,
      backLink${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "statementCards" => {
      ...,
      cards[]{
        _key,
        text,
        linkLabel,
        color,
        statement->{title, issue, "slug": slug.current}
      }
    },
    _type == "newsRecord" => {
      ...,
      "items": *[_type == "newsItem" && defined(date)] | order(date desc){
        _id, kind, title, date, datePrecision, issue, summary, details, linkLabel, link
      }
    },
    _type == "campaignBanner" => {
      ...,
      link${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "donateHero" => {
      ...,
      "charityBadge": *[_id == "siteSettings"][0].charityBadge
    },
    _type == "getInTouch" => {
      ...,
      donateLink${INTERNAL_OR_EXTERNAL_LINK},
      "contact": *[_type == "footer"][0].organizationInfo{address, contact},
      "charityBadge": *[_id == "siteSettings"][0].charityBadge
    },
    _type == "focusAreas" => {
      ...,
      "source": page->{
        "slug": slug.current,
        "topics": content[_type == "topicList" && appearance == "focusIndex"][0].items[]{
          _key,
          title,
          accent,
          "card": initiative{label, title, summary, "anchor": link.anchor}
        }
      }
    },
    _type == "topicList" => {
      ...,
      items[]{
        ...,
        initiative{..., link${INTERNAL_OR_EXTERNAL_LINK}},
        link${INTERNAL_OR_EXTERNAL_LINK}
      }
    },
    _type == "resourceList" => {
      ...,
      items[]{
        ...,
        link${INTERNAL_OR_EXTERNAL_LINK}
      },
      groups[]{
        ...,
        items[]{
          ...,
          link${INTERNAL_OR_EXTERNAL_LINK}
        }
      }
    },
    _type == "stackedEntries" => {
      ...,
      entries[]{
        ...,
        image{..., "lqip": asset->metadata.lqip},
        feature{
          ...,
          link${INTERNAL_OR_EXTERNAL_LINK},
          image{
            ...,
            "lqip": asset->metadata.lqip
          }
        }
      }
    },
    _type == "storyHighlight" => {
      ...,
      cta${INTERNAL_OR_EXTERNAL_LINK},
      image{
        ...,
        "lqip": asset->metadata.lqip
      }
    },
    _type == "toolCards" => {
      ...,
      cards[]{
        ...,
        link${INTERNAL_OR_EXTERNAL_LINK},
        image{
          ...,
          "lqip": asset->metadata.lqip
        }
      }
    },
    _type == "holidayCard" => {
      ...,
       link{
          anchor,
          title,
          isExternalLink,
          url,
          target,
          reference->{ _type, slug }
        },
    },
    _type == "hero" => {
      ...,
      link${INTERNAL_OR_EXTERNAL_LINK}
    },
    _type == "impactHero" => {
      ...,
      cta1${INTERNAL_OR_EXTERNAL_LINK},
      cta2${INTERNAL_OR_EXTERNAL_LINK}
    },
      _type == "faq" => {
    ...,
    heading,
    subheading,
    items[]{
      _key,
      question,
      answer
    }
  },
    _type == "tabsContainer" => {
      ...,
      tabs[]{
        ...,
        content[]{
          ...,
          _type == "textMedia" => {
            ...,
            media{
              videoUrl,
              image{
                ...,
                asset,
                "lqip": asset->metadata.lqip
              }
            },
            ctas[]{
              label,
              link,
              newTab
            }
          }
        }
      }
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
  legalLinks[]${INTERNAL_OR_EXTERNAL_LINK},
  "charityBadge": *[_id == "siteSettings"][0].charityBadge,
  "candidSeal": *[_id == "siteSettings"][0].candidSeal,
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
  eyebrow,
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
    datePrecision,
    issue,
    lead,
    description,
    "slug": slug.current,
    text,
    sources,
    closing,
    pdfDownload{
      "url": asset->url,
      originalFilename
    }
  }
`);

export const LETTER_QUERY = defineQuery(`
  *[_type == "letter" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    date,
    issue,
    summary,
    position,
    to,
    from,
    bill,
    letterDate,
    addresses,
    re,
    body,
    signOff,
    signatureName,
    signatureDetails,
    moreEyebrow,
    related[]{
      _key,
      label,
      title,
      color,
      link${INTERNAL_OR_EXTERNAL_LINK}
    },
    moreLabel,
    "logo": *[_id == "header"][0].logo
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

/** A program case study in its section (/ready-to-grow/<slug> or /resources/<slug>), with PDF addresses and the Advancement contact. */
export const PROGRAM_CASE_STUDY_QUERY = defineQuery(`
*[_type == "programCaseStudy" && slug.current == $slug && coalesce(section, "readyToGrow") == $section][0]{
  ...,
  nextPhase{
    ...,
    "pdfSlug": pdf->slug.current
  },
  closing{
    ...,
    "pdfSlug": pdf->slug.current
  },
  "contact": *[_id == "siteSettings"][0].advancementContact
}`);

/** An interactive employer guide at /resources/<slug>, with its PDF address. */
export const EMPLOYER_GUIDE_QUERY = defineQuery(`
*[_type == "employerGuide" && slug.current == $slug][0]{
  ...,
  howToUse{
    ...,
    "pdfSlug": pdf->slug.current
  }
}`);

