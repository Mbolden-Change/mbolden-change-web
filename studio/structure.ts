import {
  BlockElementIcon,
  BlockquoteIcon,
  DocumentIcon,
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
      S.divider(),
      singletonListItem(S, 'popUpModal', 'Pop-Up Modal').icon(EarthGlobeIcon),
      S.divider(),
      S.listItem()
        .title('Statements')
        .schemaType('statement')
        .icon(BlockquoteIcon)
        .child(S.documentTypeList('statement')),
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
      S.divider(),
    ])
