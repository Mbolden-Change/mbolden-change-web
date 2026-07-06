import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'noi7r9zo',
    // Local dev defaults to development; CI sets SANITY_STUDIO_DATASET=production.
    dataset: process.env.SANITY_STUDIO_DATASET || 'development',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
