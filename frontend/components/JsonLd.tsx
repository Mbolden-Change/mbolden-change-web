type JsonLdProps = {
  data: Record<string, unknown>
}

/** Renders JSON-LD for Google rich results / knowledge panels. */
export default function JsonLd({data}: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  )
}
