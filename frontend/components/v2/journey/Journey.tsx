'use client'

import classNames from 'classnames'
import {getImageProps} from 'next/image'
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import {JOURNEY, type JourneyImage, type JourneyStop} from './journeyData'
import styles from './Journey.module.scss'

// Motion and timing follow the approved prototype (journey-build/prototype/index.html).
const {stops: STOPS, timing, artboard} = JOURNEY
const N = STOPS.length
const INTRO = timing.introScreens
const DWELL = timing.screensPerStop
const OUTRO = timing.outroScreens
const TOTAL = INTRO + N * DWELL + OUTRO
const RATIO = artboard.width / artboard.height
// Each frame the drawn position moves this share of the way to the real scroll position.
const LAG = 0.11
// Phones show the paintings at full height and pan across them, so they need wide files too.
const SIZES = '(orientation: portrait) 180vh, 100vw'
const QUALITY = 80
// Stops 1 and 2 load with the page; the rest load just ahead of the reader.
const EAGER = 2
const SHADOW = {teal: 'var(--brand-aqua-teal)', yellow: 'var(--brand-warm-yellow)', fuchsia: 'var(--brand-fuchsia)'}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pad = (i: number) => String(i + 1).padStart(2, '0')

/** A soft, watercolor-like reveal from the bottom left. */
function wash(r: number) {
  const R = r * 165
  return `radial-gradient(circle at 0% 100%, #000 ${Math.max(0, R - 12)}%, rgba(0,0,0,.6) ${Math.max(0, R - 5)}%, transparent ${R}%)`
}
function setMask(el: HTMLElement, mask: string) {
  el.style.webkitMaskImage = mask
  el.style.maskImage = mask
}

/** An optimized painting. Later stops render without a source; it's added when the stop is warmed. */
function Painting({image, alt, eager, priority}: {image: JourneyImage; alt: string; eager: boolean; priority?: boolean}) {
  const {props} = getImageProps({...image, alt, sizes: SIZES, quality: QUALITY})
  return eager ? (
    <img
      src={props.src}
      srcSet={props.srcSet}
      sizes={props.sizes}
      alt={alt}
      decoding="async"
      draggable={false}
      fetchPriority={priority ? 'high' : undefined}
    />
  ) : (
    <img data-src={props.src} data-srcset={props.srcSet} sizes={props.sizes} alt={alt} decoding="async" draggable={false} />
  )
}

/** The painted layers of a stop on the artboard, back to front. The front layer carries the alt text. */
function Frame({stop, index, decorative, flat}: {stop: JourneyStop; index: number; decorative: boolean; flat: boolean}) {
  const eager = index < EAGER
  if (flat) {
    return (
      <div className={styles.frame}>
        <div className={styles.plane} style={{left: 0, top: 0, width: '100%', height: '100%'}}>
          <Painting image={stop.flat} alt={decorative ? '' : stop.alt} eager={eager} priority={index === 0} />
        </div>
      </div>
    )
  }
  return (
    <div className={styles.frame}>
      {stop.layers.map((layer, k) => (
        <div key={layer.src} className={styles.plane} style={{left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.w}%`, height: `${layer.h}%`}}>
          <Painting
            image={layer}
            alt={!decorative && k === stop.layers.length - 1 ? stop.alt : ''}
            eager={eager}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  )
}

/** Building the Road to Systemic Equity: a sticky stage the reader walks through by scrolling. */
export default function Journey() {
  const [reduce, setReduce] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLElement>(null)
  const endRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const capRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(query.matches)
    const onChange = () => setReduce(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    // Wait until the motion setting is known, so reduced-motion visitors don't load the layers.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches !== reduce) return
    let cancelled = false
    const scenes = sceneRefs.current
    const caps = capRefs.current
    const dots = dotRefs.current
    const ready: boolean[] = Array(N).fill(false)
    const warming: (Promise<void> | undefined)[] = Array(N)

    // Loads a stop's paintings and decodes every one before the stop may show.
    const warm = (i: number): Promise<void> => {
      if (i < 0 || i >= N) return Promise.resolve()
      if (warming[i]) return warming[i]!
      const scene = scenes[i]
      if (!scene) return Promise.resolve()
      const images = Array.from(scene.querySelectorAll('img'))
      warming[i] = Promise.all(
        images.map((img) => {
          if (img.dataset.src) {
            if (img.dataset.srcset) img.srcset = img.dataset.srcset
            img.src = img.dataset.src
            delete img.dataset.src
            delete img.dataset.srcset
          }
          return img.decode().catch(() => undefined)
        }),
      ).then(() => {
        if (cancelled) return
        ready[i] = true
        scene.classList.add(styles.ready)
      })
      return warming[i]!
    }

    // Stops 1 and 2 are already loading; then the rest, one at a time, in order.
    for (let i = 0; i < EAGER; i++) void warm(i)
    let backgroundTimer = 0
    const loadRest = () => {
      let k = 0
      const next = () => {
        if (cancelled || k >= N) return
        void warm(k++).then(() => {
          backgroundTimer = window.setTimeout(next, 150)
        })
      }
      backgroundTimer = window.setTimeout(next, 600)
    }
    if (document.readyState === 'complete') loadRest()
    else window.addEventListener('load', loadRest, {once: true})

    // Elements the draw loop touches every frame, looked up once.
    const parts = scenes.map((scene) => ({
      frames: scene ? Array.from(scene.querySelectorAll<HTMLElement>(`.${styles.frame}`)) : [],
      color: scene?.querySelector<HTMLElement>(`.${styles.color}`) ?? null,
    }))
    const planes = parts.map((part) => part.frames.map((fr) => Array.from(fr.children) as HTMLElement[]))

    const vh = () => window.innerHeight
    let target = window.scrollY / vh()
    let cur = target
    let lastDrawn = -1
    let lastCurrent = -1
    let frame = 0

    const draw = () => {
      const t = cur
      const VW = stage.clientWidth
      const VH = stage.clientHeight
      const portrait = VW / VH < 1.1

      // Opening title: fades out and drifts up and right.
      const title = titleRef.current
      if (title) {
        const ti = smooth(0.15, 0.85, t)
        title.style.opacity = String(1 - ti)
        title.style.transform = reduce ? 'none' : `translate(${ti * 40}px,${-ti * 60}px)`
        title.style.visibility = ti >= 1 ? 'hidden' : 'visible'
      }
      railRef.current?.classList.toggle(styles.show, t > 0.6 && t < INTRO + N * DWELL + 0.3)

      // The artboard covers the stage.
      let W: number
      let H: number
      if (VW / VH > RATIO) {
        W = VW
        H = VW / RATIO
      } else {
        H = VH
        W = VH * RATIO
      }

      let current = 0
      STOPS.forEach((stop, i) => {
        const scene = scenes[i]
        const cap = caps[i]
        if (!scene || !cap) return
        const start = INTRO + i * DWELL // fully arrived
        const wipe0 = start - 0.55
        const wipe1 = start + 0.05
        const local = (t - wipe0) / (DWELL + 0.55)
        const on = i === 0 || (t > wipe0 - 0.02 && t < start + DWELL + 0.8)
        scene.classList.toggle(styles.on, on)
        if (t >= start - 0.3) current = i
        if (!on) {
          cap.style.opacity = '0'
          cap.style.pointerEvents = 'none'
          return
        }

        // Arrival: a watercolor wash from the bottom left, or a short crossfade with reduced motion.
        const r = i === 0 ? 1 : reduce ? smooth(start - 0.35, start - 0.05, t) : smooth(wipe0, wipe1, t)
        if (reduce) {
          setMask(scene, 'none')
          scene.style.setProperty('--arrive', String(r))
        } else {
          setMask(scene, r < 1 ? wash(r) : 'none')
          scene.style.setProperty('--arrive', '1')
        }

        const e = ease(clamp(local, 0, 1))
        const zoom = reduce ? 1 : lerp(stop.zoom[0], stop.zoom[1], e)
        const panX = portrait && !reduce ? lerp(stop.phonePan[0], stop.phonePan[1], e) / 100 : 0.5
        const fl = (VW - W) * panX
        const ft = (VH - H) * 0.5
        // Focal point in frame pixels: on phones it follows the pan, otherwise the stop's focus.
        const fx = portrait ? VW / 2 - fl : (stop.focus[0] / 100) * W
        const fy = portrait ? H / 2 : (stop.focus[1] / 100) * H

        if (!reduce) {
          // Color blooms in from the bottom left over the muted painting.
          const color = parts[i].color
          const bloom = smooth(start - 0.15, start + 0.55, t)
          if (color) setMask(color, bloom >= 1 ? 'none' : wash(bloom))
        }

        parts[i].frames.forEach((fr, fi) => {
          fr.style.width = `${W}px`
          fr.style.height = `${H}px`
          fr.style.transform = `translate(${fl}px,${ft}px)`
          if (reduce) return
          planes[i][fi].forEach((el, k) => {
            const layer = stop.layers[k]
            if (!layer) return
            const px = (layer.x / 100) * W
            const py = (layer.y / 100) * H
            const z = 1 + (zoom - 1) * layer.depth
            const dr = ((layer.drift || 0) / 100) * W * e
            el.style.transformOrigin = `${fx - px}px ${fy - py}px`
            el.style.transform = `translateX(${dr}px) scale(${z})`
          })
        })

        // Caption: enters from the bottom left, drifts up and right, holds, then leaves up and right.
        const a = start + 0.08
        const b = start + 0.45
        const c = start + DWELL - 0.55
        const z = start + DWELL - 0.2
        const inn = smooth(a, b, t)
        const out = smooth(c, z, t)
        const o = inn * (1 - out)
        const dx = reduce ? 0 : -36 * (1 - inn) + 36 * out
        const dy = reduce ? 0 : 48 * (1 - inn) - 48 * out
        cap.style.opacity = String(o)
        cap.style.transform = `translate(${dx}px,${dy}px)`
        cap.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      })

      dots.forEach((dot, i) => {
        if (!dot) return
        dot.classList.toggle(styles.cur, i === current)
        if (i === current) dot.setAttribute('aria-current', 'step')
        else dot.removeAttribute('aria-current')
      })
      // Whenever the reader reaches a stop, it and the next two load right away.
      if (current !== lastCurrent) {
        lastCurrent = current
        void warm(current)
        void warm(current + 1)
        void warm(current + 2)
      }

      // Ending: a teal block washes in over the last painting.
      const end = endRef.current
      if (end) {
        const endStart = INTRO + N * DWELL - 0.15
        const ev = smooth(endStart, endStart + 0.6, t)
        end.style.opacity = String(ev)
        end.classList.toggle(styles.live, ev > 0.6)
        end.toggleAttribute('inert', ev <= 0.6)
        setMask(end, ev >= 1 || reduce ? 'none' : wash(ev))
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(t / (TOTAL - 0.2), 0, 1)})`
    }

    const tick = () => {
      cur += (target - cur) * (reduce ? 1 : LAG)
      if (Math.abs(target - cur) < 0.0004) cur = target
      if (cur !== lastDrawn) {
        draw()
        lastDrawn = cur
      }
      frame = requestAnimationFrame(tick)
    }
    const onScroll = () => {
      target = window.scrollY / vh()
    }
    const onResize = () => {
      onScroll()
      cur = target
      draw()
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onResize)
    draw()
    frame = requestAnimationFrame(tick)

    const hash = /^#stop([1-8])$/.exec(window.location.hash)
    const hashTimer = hash ? window.setTimeout(() => goTo(Number(hash[1]) - 1, reduce), 300) : 0

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(backgroundTimer)
      window.clearTimeout(hashTimer)
      window.removeEventListener('load', loadRest)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [reduce])

  return (
    <div className={styles.track} style={{'--screens': TOTAL} as CSSProperties}>
      <div ref={stageRef} className={styles.stage}>
        <div>
          {STOPS.map((stop, i) => (
            <div
              key={`${stop.number}-${reduce ? 'flat' : 'layers'}`}
              ref={(el) => {
                sceneRefs.current[i] = el
              }}
              className={classNames(styles.scene, i === 0 && styles.on)}
              style={{zIndex: i + 1}}
            >
              {reduce ? (
                <div className={styles.layer}>
                  <Frame stop={stop} index={i} decorative={false} flat />
                </div>
              ) : (
                <>
                  <div className={classNames(styles.layer, styles.gray)} aria-hidden="true">
                    <Frame stop={stop} index={i} decorative flat={false} />
                  </div>
                  <div className={classNames(styles.layer, styles.color)}>
                    <Frame stop={stop} index={i} decorative={false} flat={false} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.vig} aria-hidden="true" />

        <div>
          {STOPS.map((stop, i) => (
            <div
              key={stop.number}
              ref={(el) => {
                capRefs.current[i] = el
              }}
              className={classNames(styles.cap, stop.longLine && styles.long, stop.captionTop && styles.top)}
              style={{'--sh': SHADOW[stop.shadow]} as CSSProperties}
            >
              <h2 className={styles.capEyebrow}>
                <b>{stop.number}</b>
                {stop.name}
              </h2>
              <p>{stop.line}</p>
            </div>
          ))}
        </div>

        <section ref={titleRef} className={styles.title} aria-labelledby="journey-title">
          <p className={styles.eyebrow}>{JOURNEY.eyebrow}</p>
          <h1 id="journey-title">{JOURNEY.title}</h1>
          <p className={styles.cue}>
            <i aria-hidden="true" />
            {JOURNEY.scrollCue}
          </p>
        </section>

        <section ref={endRef} className={styles.end} aria-label="End of the road">
          <p className={styles.eyebrow}>{JOURNEY.endingEyebrow}</p>
          <h2>{JOURNEY.ending}</h2>
          <ol>
            {STOPS.map((stop, i) => (
              <li key={stop.number}>
                <button type="button" onClick={() => goTo(i, reduce)}>
                  {pad(i)} {stop.name}
                </button>
              </li>
            ))}
          </ol>
        </section>

        <nav ref={railRef} className={styles.rail} aria-label="Stops on the road">
          {STOPS.map((stop, i) => (
            <button
              key={stop.number}
              type="button"
              ref={(el) => {
                dotRefs.current[i] = el
              }}
              aria-label={`Go to stop ${i + 1}: ${stop.name}`}
              onClick={() => goTo(i, reduce)}
            >
              <span>{stop.name}</span>
              <i />
            </button>
          ))}
        </nav>
        <div ref={barRef} className={styles.bar} aria-hidden="true" />
      </div>
    </div>
  )
}

/** Scrolls to a stop, just after it has fully arrived. */
function goTo(i: number, reduce: boolean) {
  const y = (INTRO + i * DWELL + 0.35) * window.innerHeight
  window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'})
}
