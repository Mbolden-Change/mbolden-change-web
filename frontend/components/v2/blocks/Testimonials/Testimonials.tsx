import type {PortableTextBlock} from 'sanity'
import type {
  InternalOrExternalLink,
  TestimonialCard as TestimonialCardType,
} from '@/sanity/types'
import TestimonialsClient from './TestimonialsClient'

type SlideWithKey = TestimonialCardType & {_key?: string}

type TestimonialsProps = {
  title?: string
  text?: PortableTextBlock[]
  link?: InternalOrExternalLink
  hasButton?: boolean
  slides?: SlideWithKey[]
}

export default function Testimonials(props: TestimonialsProps) {
  if (!props.slides?.length) return null

  return <TestimonialsClient {...props} slides={props.slides} />
}
