import type {Metadata} from 'next'
import Simulator from '@/components/v2/simulator/Simulator'
import {shareMetadata} from '@/lib/siteMetadata'

export const metadata: Metadata = shareMetadata(
  'The Safety Net Simulator',
  'Follow a household through federal safety net cuts and face the tradeoffs real families face when benefits are reduced.',
  '/simulator',
)

/** The Safety Net Simulator. Its numbers come from lib/simulator; see simulator/README.md. */
export default function SimulatorPage() {
  return <Simulator />
}
