import type {PortableTextBlock} from 'sanity'
import type {
  InternalOrExternalLink,
  TestimonialCard as TestimonialCardType,
} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import TestimonialsClient from './TestimonialsClient'

type SlideWithKey = TestimonialCardType & {_key?: string}

type TestimonialsProps = PageBuilderBlockLayoutProps & {
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
