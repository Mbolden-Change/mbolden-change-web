// Checks that the schema deployed to Sanity has every type and field in this
// Studio, so tools that validate against it (such as the Sanity connector)
// don't reject fields that exist in the code.
//
// Usage: node scripts/checkDeployedSchema.mjs <local-extract.json> <deployed.json>
//   local-extract.json: output of `sanity schema extract`
//   deployed.json:      output of `sanity schema list --id _.schemas.default --json`
//
// The deployed format differs from the extract format, so this only checks
// that each name appears in it as a JSON string. Exits 1 and lists what's
// missing when a type or field hasn't been deployed.

import {readFileSync} from 'node:fs'

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
  // The deployed schema is stored as JSON text inside the listing's JSON, so
  // its quotes arrive escaped (\"invite\"). Unescape them before searching.
  const text = deployedText.replace(/\\"/g, '"')
  return expectedNames(extract).filter((name) => {
    const last = name.split('.').pop()
    return !text.includes(JSON.stringify(last))
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [extractPath, deployedPath] = process.argv.slice(2)
  if (!extractPath || !deployedPath) {
    console.error('Usage: node scripts/checkDeployedSchema.mjs <local-extract.json> <deployed.json>')
    process.exit(2)
  }
  const extract = JSON.parse(readFileSync(extractPath, 'utf8'))
  const deployedText = readFileSync(deployedPath, 'utf8')
  if (!deployedText.trim() || deployedText.trim() === '[]') {
    console.error('No deployed schema found. The schema deploy step did not store one.')
    process.exit(1)
  }
  const expected = expectedNames(extract)
  const missing = missingNames(extract, deployedText)
  if (missing.length) {
    console.error(`Deployed schema is missing ${missing.length} of ${expected.length} types and fields:`)
    for (const name of missing) console.error(`  - ${name}`)
    process.exit(1)
  }
  console.log(`Deployed schema has all ${expected.length} types and fields from this Studio.`)
}
