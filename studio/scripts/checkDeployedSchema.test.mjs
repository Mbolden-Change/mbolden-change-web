import {test} from 'node:test'
import assert from 'node:assert/strict'
import {checkRecords, expectedNames} from './checkDeployedSchema.mjs'

const extract = [
  {name: 'sanity.imageAsset', value: {attributes: {url: {}}}},
  {name: 'slug', value: {attributes: {current: {}}}},
  {
    name: 'textMedia',
    value: {attributes: {_type: {}, headline: {}, searchSummary: {}}},
  },
  {name: 'siteSettings', value: {attributes: {candidSeal: {}}}},
]

// The legacy record holds the schema as escaped JSON text; the Studio record
// is plain JSON with "name": "…" pairs.
const legacy = (fields) =>
  JSON.stringify([{schema: JSON.stringify([{name: 'textMedia'}, {name: 'siteSettings'}, ...fields.map((name) => ({name}))])}])
const studio = (fields) =>
  JSON.stringify({types: {textMedia: {fields: fields.map((name) => ({name}))}, siteSettings: {}}})

const all = ['headline', 'searchSummary', 'candidSeal']

test('expects every type and field except Sanity built-ins and system fields', () => {
  assert.deepEqual(expectedNames(extract), [
    'textMedia',
    'textMedia.headline',
    'textMedia.searchSummary',
    'siteSettings',
    'siteSettings.candidSeal',
  ])
})

test('passes when both records have everything', () => {
  const results = checkRecords(extract, [
    {label: 'legacy', text: legacy(all)},
    {label: 'studio', text: studio(all)},
  ])
  assert.deepEqual(results, [
    {label: 'legacy', empty: false, missing: []},
    {label: 'studio', empty: false, missing: []},
  ])
})

test('names what is missing from the Studio record when only that one is stale', () => {
  const [legacyResult, studioResult] = checkRecords(extract, [
    {label: 'legacy', text: legacy(all)},
    {label: 'studio', text: studio(['headline', 'candidSeal'])},
  ])
  assert.deepEqual(legacyResult.missing, [])
  assert.deepEqual(studioResult.missing, ['textMedia.searchSummary'])
})

test('names what is missing from the legacy record when only that one is stale', () => {
  const [legacyResult, studioResult] = checkRecords(extract, [
    {label: 'legacy', text: legacy(['headline'])},
    {label: 'studio', text: studio(all)},
  ])
  assert.deepEqual(legacyResult.missing, ['textMedia.searchSummary', 'siteSettings.candidSeal'])
  assert.deepEqual(studioResult.missing, [])
})

test('flags a record that is empty', () => {
  const results = checkRecords(extract, [
    {label: 'legacy', text: '[]'},
    {label: 'studio', text: ' '},
  ])
  assert.deepEqual(
    results.map((result) => result.empty),
    [true, true],
  )
})
