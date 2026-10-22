import classNames from 'classnames'
import type {BoltStep} from '@/sanity/types'
import {getDimensionsFromRef, urlFor} from '@/sanity/lib/image'
import styles from './BoltSteps.module.scss'

// Ripples, in each illustration's own pixels: from the speaker's mouth and
// from the megaphone.
const WAVES = {
  listen: ['M 299 164 A 45 45 0 0 1 299 216', 'M 328 144 A 80 80 0 0 1 328 236', 'M 356 124 A 115 115 0 0 1 356 256'],
  advocate: ['M 581 25 A 45 45 0 0 1 596 81', 'M 601 -4 A 80 80 0 0 1 628 96', 'M 621 -32 A 115 115 0 0 1 659 111'],
} as const

type Layer = BoltStep['backLayer']

function layerSrc(layer: Layer) {
  return layer?.asset?._ref ? urlFor(layer).width(640).auto('format').url() : undefined
}

// A layout's stylesheet: fig, listen, build, advocate, sway, tree, back,
// front and waves set each layout's size and motion.
type FigureClasses = {readonly [key: string]: string}

/** A step's silhouette: back and front layers (the motion moves them) plus ripples. */
export function Illustration({step, classes = styles}: {step: BoltStep; classes?: FigureClasses}) {
  const ref = step.backLayer?.asset?._ref ?? step.frontLayer?.asset?._ref
  const {imageWidth, imageHeight} = ref ? getDimensionsFromRef(ref) : {imageWidth: 900, imageHeight: 812}
  const width = imageWidth || 900
  const height = imageHeight || 812
  const back = layerSrc(step.backLayer)
  const front = layerSrc(step.frontLayer)
  const waves = step.motion === 'listen' || step.motion === 'advocate' ? WAVES[step.motion] : null

  return (
    <div
      className={classNames(classes.fig, classes[step.motion])}
      style={{aspectRatio: `${width} / ${height}`}}
      role="img"
      aria-label={step.alt}
    >
      {step.motion === 'build' ? (
        <div className={classes.sway}>{back && <img className={classes.tree} src={back} alt="" />}</div>
      ) : (
        back && <img className={classes.back} src={back} alt="" />
      )}
      {front && <img className={classes.front} src={front} alt="" />}
      {waves && (
        <svg className={classes.waves} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {waves.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      )}
    </div>
  )
}

