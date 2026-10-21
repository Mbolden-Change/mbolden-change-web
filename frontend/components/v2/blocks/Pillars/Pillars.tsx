import type {PortableTextBlock} from 'sanity'
import type {PillarCard as PillarCardType} from '@/sanity/types'
import {getPillarContainer} from '@/lib/getPillarContainer'
import PillarsClient from './PillarsClient'
import PillarsCompact from './PillarsCompact'

type PillarsProps = {
  layout?: 'rows' | 'compact'
  title?: string
  eyebrow?: string
  description?: PortableTextBlock[]
  pillars?: PillarCardType[]
}

export default async function PillarsV2(props: PillarsProps) {
  const data =
    props?.pillars && props.pillars.length > 0 ? props : await getPillarContainer()
  if (!data) return null

  const {
    title,
    eyebrow,
    description,
    pillars,
  }: {
    title?: string
    eyebrow?: string
    description?: PortableTextBlock[]
    pillars?: PillarCardType[]
  } = data

  if (props?.layout === 'compact') {
    return (
      <PillarsCompact
        title={title}
        eyebrow={eyebrow}
        description={description}
        pillars={pillars}
      />
    )
  }

  return (
    <PillarsClient
      title={title}
      eyebrow={eyebrow}
      description={description}
      pillars={pillars}
    />
  )
}
