import {
  BlockElementIcon,
  CogIcon,
  BlockquoteIcon,
  DocumentIcon,
  DocumentPdfIcon,
  DocumentTextIcon,
  EarthGlobeIcon,
} from '@sanity/icons'

import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const singletonListItem = (S: StructureBuilder, typeName: string, title?: string) =>
  S.listItem()
    .title(title || typeName)
    .id(typeName)
    .child(S.document().schemaType(typeName).documentId(typeName))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .schemaType('page')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page')),
      S.divider(),
      singletonListItem(S, 'footer', 'Footer').icon(EarthGlobeIcon),
      singletonListItem(S, 'header', 'Header').icon(EarthGlobeIcon),
      singletonListItem(S, 'siteSettings', 'Site Settings').icon(CogIcon),
      S.divider(),
      singletonListItem(S, 'popUpModal', 'Pop-Up Modal').icon(EarthGlobeIcon),
      S.divider(),
      S.listItem()
        .title('Statements')
        .schemaType('statement')
        .icon(BlockquoteIcon)
        .child(S.documentTypeList('statement')),
      S.listItem()
        .title('Ready to Grow Case Studies')
        .schemaType('programCaseStudy')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('programCaseStudy')),
      S.listItem()
        .title('Case Studies')
        .schemaType('caseStudy')
        .icon(BlockquoteIcon)
        .child(S.documentTypeList('caseStudy')),
      S.listItem()
        .title('Reports')
        .schemaType('report')
        .icon(BlockquoteIcon)
        .child(S.documentTypeList('report')),
      S.listItem()
        .title('PDF Files')
        .schemaType('pdfDocument')
        .icon(DocumentPdfIcon)
        .child(S.documentTypeList('pdfDocument')),
      S.divider(),
    ])
