/**
 * Copy a page (+ referenced pillarCards + image assets) from development
 * onto the production homepage.
 *
 * Usage (from studio/):
 *   DRY_RUN=1 SANITY_AUTH_TOKEN=... npm run migrate:homepage
 *   SANITY_AUTH_TOKEN=... npm run migrate:homepage
 */

import {createClient, type SanityDocument} from '@sanity/client'

const PROJECT_ID = 'noi7r9zo'
const API_VERSION = '2025-03-04'
const SOURCE_DATASET = 'development'
const TARGET_DATASET = 'production'
const SOURCE_SLUG = process.env.SOURCE_SLUG || 'bobby-test-page'
const TARGET_SLUG = process.env.TARGET_SLUG || '/'
const dryRun = process.env.DRY_RUN === '1'

const token = process.env.SANITY_AUTH_TOKEN
if (!token) {
  console.error(
    'Missing SANITY_AUTH_TOKEN.\n' +
      'Create an Editor token at https://www.sanity.io/manage/project/noi7r9zo/api#tokens\n' +
      'then: SANITY_AUTH_TOKEN=sk... npm run migrate:homepage',
  )
  process.exit(1)
}

const source = createClient({
  projectId: PROJECT_ID,
  dataset: SOURCE_DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
})

const target = createClient({
  projectId: PROJECT_ID,
  dataset: TARGET_DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
})

type PageDoc = SanityDocument & {
  title?: string
  slug?: {current?: string}
  content?: Array<{
    _type?: string
    _key?: string
    pillars?: Array<{_ref?: string; _type?: string}>
  }>
}

type AssetDoc = SanityDocument & {
  url?: string
  originalFilename?: string
  mimeType?: string
  extension?: string
  sha1hash?: string
}

function collectPillarIds(page: PageDoc): string[] {
  const ids = new Set<string>()
  for (const block of page.content ?? []) {
    if (block._type !== 'pillars' || !Array.isArray(block.pillars)) continue
    for (const ref of block.pillars) {
      if (ref?._ref) ids.add(ref._ref)
    }
  }
  return [...ids]
}

function collectImageAssetIds(value: unknown, into = new Set<string>()): Set<string> {
  if (!value || typeof value !== 'object') return into

  if (Array.isArray(value)) {
    for (const item of value) collectImageAssetIds(item, into)
    return into
  }

  const record = value as Record<string, unknown>
  const ref = record._ref
  if (
    typeof ref === 'string' &&
    (ref.startsWith('image-') || ref.startsWith('file-'))
  ) {
    into.add(ref)
  }

  for (const child of Object.values(record)) {
    collectImageAssetIds(child, into)
  }
  return into
}

function rewriteAssetRefs<T>(value: T, assetMap: Map<string, string>): T {
  if (!value || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map((item) => rewriteAssetRefs(item, assetMap)) as T
  }

  const record = value as Record<string, unknown>
  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(record)) {
    if (key === '_ref' && typeof child === 'string' && assetMap.has(child)) {
      next[key] = assetMap.get(child)
    } else {
      next[key] = rewriteAssetRefs(child, assetMap)
    }
  }
  return next as T
}

function summarizeContent(page: PageDoc) {
  return (page.content ?? []).map((block, i) => {
    const type = block._type ?? 'unknown'
    return `  ${i + 1}. ${type}${block._key ? ` (${block._key})` : ''}`
  })
}

async function ensureAssetsInTarget(assetIds: string[]): Promise<Map<string, string>> {
  const assetMap = new Map<string, string>()
  if (!assetIds.length) return assetMap

  const existing = await target.fetch<Array<{_id: string}>>(
    `*[_id in $ids]{_id}`,
    {ids: assetIds},
  )
  for (const doc of existing) {
    assetMap.set(doc._id, doc._id)
  }

  const missing = assetIds.filter((id) => !assetMap.has(id))
  if (!missing.length) {
    console.log(`Assets: all ${assetIds.length} already exist in ${TARGET_DATASET}`)
    return assetMap
  }

  const sourceAssets = await source.fetch<AssetDoc[]>(`*[_id in $ids]`, {
    ids: missing,
  })

  console.log(
    `Assets: copying ${sourceAssets.length} missing of ${assetIds.length} into ${TARGET_DATASET}`,
  )

  for (const asset of sourceAssets) {
    if (!asset.url) {
      console.warn(`  skip ${asset._id} — no url`)
      continue
    }

    if (dryRun) {
      console.log(`  [dry-run] would copy ${asset._id}`)
      assetMap.set(asset._id, asset._id)
      continue
    }

    const response = await fetch(asset.url)
    if (!response.ok) {
      throw new Error(`Failed to download ${asset._id}: ${response.status}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const kind = asset._id.startsWith('file-') ? 'file' : 'image'
    const uploaded = await target.assets.upload(kind, buffer, {
      filename: asset.originalFilename || `${asset._id}.${asset.extension || 'bin'}`,
      contentType: asset.mimeType,
      source: {
        id: asset._id,
        name: 'development-dataset-copy',
      },
    })

    assetMap.set(asset._id, uploaded._id)
    console.log(`  copied ${asset._id} → ${uploaded._id}`)
  }

  return assetMap
}

async function main() {
  console.log(`Source: ${SOURCE_DATASET} slug="${SOURCE_SLUG}"`)
  console.log(`Target: ${TARGET_DATASET} slug="${TARGET_SLUG}"`)
  console.log(dryRun ? 'Mode: DRY RUN (no writes)\n' : 'Mode: APPLY\n')

  const sourcePage = await source.fetch<PageDoc | null>(
    `*[_type == "page" && slug.current == $slug][0]`,
    {slug: SOURCE_SLUG},
  )

  if (!sourcePage) {
    throw new Error(
      `No published page with slug "${SOURCE_SLUG}" in ${SOURCE_DATASET}. ` +
        'Publish it in Studio first, or set SOURCE_SLUG.',
    )
  }

  const pillarIds = collectPillarIds(sourcePage)
  const pillarCards =
    pillarIds.length > 0
      ? await source.fetch<SanityDocument[]>(`*[_id in $ids]`, {ids: pillarIds})
      : []

  const homepage = await target.fetch<{_id: string; title?: string} | null>(
    `*[_type == "page" && slug.current == $slug][0]{_id, title, slug}`,
    {slug: TARGET_SLUG},
  )

  if (!homepage?._id) {
    throw new Error(
      `No homepage (slug "${TARGET_SLUG}") in ${TARGET_DATASET}. Create one first.`,
    )
  }

  const assetIds = [
    ...collectImageAssetIds(sourcePage),
    ...pillarCards.flatMap((card) => [...collectImageAssetIds(card)]),
  ]
  const uniqueAssetIds = [...new Set(assetIds)]

  console.log(`Source page: ${sourcePage._id} — ${sourcePage.title ?? '(untitled)'}`)
  console.log('Blocks:')
  console.log(summarizeContent(sourcePage).join('\n') || '  (empty)')
  console.log(
    `Pillar cards: ${
      pillarCards.length
        ? pillarCards.map((c) => c._id).join(', ')
        : '(none)'
    }`,
  )
  console.log(`Image/file assets referenced: ${uniqueAssetIds.length}`)
  console.log(`Target homepage: ${homepage._id} — ${homepage.title ?? '(untitled)'}`)

  if (pillarIds.length !== pillarCards.length) {
    const found = new Set(pillarCards.map((c) => c._id))
    const missing = pillarIds.filter((id) => !found.has(id))
    console.warn('Warning: missing pillar cards in source dataset:', missing)
  }

  const assetMap = await ensureAssetsInTarget(uniqueAssetIds)

  const rewrittenPillars = pillarCards.map((card) => {
    const {_rev, ...doc} = rewriteAssetRefs(card, assetMap)
    return doc
  })
  const rewrittenPageContent = rewriteAssetRefs(sourcePage.content ?? [], assetMap)

  if (dryRun) {
    console.log('\nDRY_RUN=1 — no writes performed.')
    return
  }

  const tx = target.transaction()
  for (const card of rewrittenPillars) {
    tx.createOrReplace(card)
  }
  tx.patch(homepage._id, {
    set: {
      content: rewrittenPageContent,
    },
  })

  const result = await tx.commit()
  console.log('\nCommitted:', result.transactionId)
  console.log(
    'Open production Studio and Publish the homepage if it shows as draft/unpublished changes.',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
