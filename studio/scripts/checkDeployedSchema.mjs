// Checks that every schema record deployed to Sanity has every type and field
// in this Studio, so tools that validate against them (such as the Sanity
// connector) don't reject fields that exist in the code.
//
// There are two records, and the deploy workflow checks both:
//   - legacy: `_.schemas.default`, stored by `sanity deploy`
//   - studio: the Studio application's own record, which the Sanity connector
//     uses (see scripts/studioSchemaRecord.ts)
//
// Usage: node scripts/checkDeployedSchema.mjs <local-extract.json> <label>=<record.json> [...]
//   local-extract.json: output of `sanity schema extract`
//   legacy=<file>:      output of `sanity schema list --id _.schemas.default --json`
//   studio=<file>:      output of `sanity exec scripts/studioSchemaRecord.ts -- read <file>`
//
// The record formats differ from the extract format and from each other, so
// this only checks that each name appears in a record as a JSON string. Exits
// 1 and lists what's missing, per record, when a type or field hasn't been
// deployed to one of them.

import {readFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'

// Sanity's own types aren't part of this Studio's schema.
const BUILT_IN = new Set(['geopoint', 'slug'])

export function expectedNames(extract) {
  const names = []
  for (const entry of extract) {
    if (entry.name.startsWith('sanity.') || BUILT_IN.has(entry.name)) continue
    names.push(entry.name)
    const attributes = entry.value?.attributes ?? {}
    for (const field of Object.keys(attributes)) {
      if (!field.startsWith('_')) names.push(`${entry.name}.${field}`)
    }
  }
  return names
}

export function missingNames(extract, deployedText) {
  // The legacy record is stored as JSON text inside the listing's JSON, so
  // its quotes arrive escaped (\"invite\"). Unescape them before searching.
  // The Studio record writes names as "name": "invite".
  const text = deployedText.replace(/\\"/g, '"')
  return expectedNames(extract).filter((name) => {
    const last = name.split('.').pop()
    return !text.includes(JSON.stringify(last))
  })
}

/**
 * Checks each record. `records` is a list of {label, text}. Returns one
 * result per record: {label, empty, missing}.
 */
export function checkRecords(extract, records) {
  return records.map(({label, text}) => {
    const empty = !text.trim() || text.trim() === '[]'
    return {label, empty, missing: empty ? [] : missingNames(extract, text)}
  })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [extractPath, ...recordArgs] = process.argv.slice(2)
  if (!extractPath || !recordArgs.length || recordArgs.some((arg) => !/^[\w-]+=.+/.test(arg))) {
    console.error(
      'Usage: node scripts/checkDeployedSchema.mjs <local-extract.json> <label>=<record.json> [...]',
    )
    process.exit(2)
  }
  const extract = JSON.parse(readFileSync(extractPath, 'utf8'))
  const records = recordArgs.map((arg) => {
    const [label, ...path] = arg.split('=')
    return {label, text: readFileSync(path.join('='), 'utf8')}
  })
  const expected = expectedNames(extract)
  let failed = false
  for (const {label, empty, missing} of checkRecords(extract, records)) {
    if (empty) {
      failed = true
      console.error(`${label}: no deployed schema found. The deploy step did not store one.`)
    } else if (missing.length) {
      failed = true
      console.error(
        `${label}: deployed schema is missing ${missing.length} of ${expected.length} types and fields:`,
      )
      for (const name of missing) console.error(`  - ${name}`)
    } else {
      console.log(
        `${label}: deployed schema has all ${expected.length} types and fields from this Studio.`,
      )
    }
  }
  if (failed) process.exit(1)
}
