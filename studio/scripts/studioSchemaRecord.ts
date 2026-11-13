// Updates and reads the "Studio-deployed" schema record for the hosted Studio.
//
// Sanity keeps two records of this Studio's schema:
//   1. `_.schemas.default`, stored by `sanity deploy`.
//   2. The Studio application's own record (its "live manifest"), which points
//      at an uploaded copy of the schema. Tools such as the Sanity connector
//      check content against this one.
// `sanity deploy` does not write the second record. The hosted Studio writes
// it from the browser the next time a signed-in person opens it, so after a
// deploy it stays out of date until then, and the connector rejects new
// fields as unknown. `register` does the same two steps straight after the
// deploy: upload the schema with the Studio's own code, then point the
// application's record at it.
//
// The uploaded schema matches what the hosted Studio uploads only while the
// `sanity` version here is the one the hosted Studio runs (it auto-updates;
// see autoUpdates in sanity.cli.ts).
//
// Usage, from studio/, with SANITY_AUTH_TOKEN set to the deploy token and
// SANITY_STUDIO_DATASET=production:
//   NODE_ENV=production SANITY_STUDIO_SCHEMA_DESCRIPTOR=1 \
//     npx sanity exec scripts/studioSchemaRecord.ts --mock-browser-env -- register
//   npx sanity exec scripts/studioSchemaRecord.ts -- read <output.json>
// `register --dry-run` uploads the schema and prints the result without
// changing the application's record.

import {writeFileSync} from 'node:fs'
import {createSourceFromConfig, type CurrentUser, type SanityClient} from 'sanity'
import {getCliClient} from 'sanity/cli'
import cliConfig from '../sanity.cli'
import studioConfig from '../sanity.config'

type WorkspaceEntry = {
  name: string
  projectId: string
  dataset: string
  schemaDescriptorId?: string
  [key: string]: unknown
}
type LiveManifest = {workspaces?: WorkspaceEntry[]; [key: string]: unknown}
type UserApplication = {
  id: string
  config?: {'live-manifest'?: {value?: LiveManifest}}
}

const {name = 'default', title, projectId, dataset} = studioConfig
const client = getCliClient({projectId, dataset, apiVersion: '2025-02-19', useCdn: false})

const isThisWorkspace = (entry: WorkspaceEntry) =>
  entry.name === name && entry.projectId === projectId && entry.dataset === dataset

async function getApplication() {
  const studioHost = cliConfig.studioHost
  if (!studioHost) throw new Error('studioHost is not set in sanity.cli.ts')
  const application = await client
    .withConfig({apiVersion: '2024-08-01'})
    .request<UserApplication | null>({uri: '/user-applications', query: {appHost: studioHost}})
  if (!application?.id) throw new Error(`No Studio application found for host "${studioHost}"`)
  return application
}

async function register(dryRun: boolean) {
  if (process.env.NODE_ENV !== 'production') {
    // Outside production mode the Studio files the upload under a "dev" label.
    throw new Error('Run with NODE_ENV=production')
  }

  // Step 1: upload the schema the same way the Studio does when it loads.
  const currentUser = (await client.users.getById('me')) as unknown as CurrentUser
  const source = await createSourceFromConfig({
    ...studioConfig,
    name,
    currentUser,
    // sanity/cli and sanity each declare the same client type.
    getClient: (options) => client.withConfig(options) as unknown as SanityClient,
  })
  const schemaDescriptorId = await source.__internal.schemaDescriptorId
  if (!schemaDescriptorId) {
    throw new Error(
      'The schema upload returned no ID. Check that SANITY_STUDIO_SCHEMA_DESCRIPTOR=1 is set.',
    )
  }
  console.log(`Uploaded the schema for ${projectId}/${dataset}: ${schemaDescriptorId}`)

  // Step 2: point the Studio application's record at that upload, keeping
  // everything else in the record as it is.
  const application = await getApplication()
  const current = application.config?.['live-manifest']?.value ?? {}
  const workspaces = [...(current.workspaces ?? [])]
  const index = workspaces.findIndex(isThisWorkspace)
  const previousId = index >= 0 ? workspaces[index].schemaDescriptorId : undefined
  const entry: WorkspaceEntry = {
    ...(index >= 0 ? workspaces[index] : {basePath: '/', ...(title ? {title} : {})}),
    name,
    projectId,
    dataset,
    schemaDescriptorId,
  }
  if (index >= 0) workspaces[index] = entry
  else workspaces.push(entry)

  console.log(`Studio application ${application.id}: schema was ${previousId ?? 'not set'}`)
  if (previousId === schemaDescriptorId) {
    console.log('Already up to date.')
    return
  }
  if (dryRun) {
    console.log('Dry run: the application record was not changed.')
    return
  }
  await client.request({
    method: 'POST',
    uri: `/projects/${projectId}/user-applications/${application.id}/config/live-manifest`,
    body: {value: {...current, workspaces}},
  })
  console.log(`Studio application ${application.id}: schema is now ${schemaDescriptorId}`)
}

// Reads the record back from Sanity (not from anything `register` computed)
// and saves the schema it points at, for checkDeployedSchema.mjs.
async function read(outputPath: string) {
  const application = await getApplication()
  const entry = application.config?.['live-manifest']?.value?.workspaces?.find(isThisWorkspace)
  if (!entry?.schemaDescriptorId) {
    throw new Error(
      `Studio application ${application.id} has no schema record for workspace "${name}" on ${projectId}/${dataset}`,
    )
  }
  const schema = await client
    .withConfig({apiVersion: '2025-06-01'})
    .request({uri: `/descriptors/schemas/${encodeURIComponent(entry.schemaDescriptorId)}`})
  writeFileSync(outputPath, JSON.stringify(schema))
  console.log(
    `Studio application ${application.id}: saved schema ${entry.schemaDescriptorId} to ${outputPath}`,
  )
}

async function main() {
  const [command, ...rest] = process.argv.slice(2).filter((arg) => arg !== '--')
  if (command === 'register') return register(rest.includes('--dry-run'))
  if (command === 'read' && rest[0]) return read(rest[0])
  throw new Error('Usage: studioSchemaRecord.ts register [--dry-run] | read <output.json>')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
