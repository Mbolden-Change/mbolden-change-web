import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

// Local dev defaults to the development dataset; CI deploys from main set
// SANITY_STUDIO_DATASET=production so the hosted Studio targets production.
const dataset = process.env.SANITY_STUDIO_DATASET || 'development'

export default defineConfig({
  name: 'default',
  title: 'MboldenChange',

  projectId: 'noi7r9zo',
  dataset,

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
