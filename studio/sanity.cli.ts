import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'noi7r9zo',
    // Local dev defaults to development; CI sets SANITY_STUDIO_DATASET=production.
    dataset: process.env.SANITY_STUDIO_DATASET || 'development',
  },
  /**
   * Pin hostname so `sanity deploy` is non-interactive in CI.
   * Without this, deploy prompts "Select existing studio hostname" and exits
   * without uploading — hosted Studio never receives schema updates.
   */
  studioHost: 'mboldenchange',
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
