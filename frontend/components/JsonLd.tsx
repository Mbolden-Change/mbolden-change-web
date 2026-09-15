type JsonLdProps = {
  /** One schema object, or several (each rendered as its own script tag). */
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined
}

/** Renders JSON-LD for Google rich results / knowledge panels. */
export default function JsonLd({data}: JsonLdProps) {
  if (!data) return null
  const schemas = Array.isArray(data) ? data : [data]
  if (schemas.length === 0) return null

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={
            typeof schema['@type'] === 'string'
              ? `${schema['@type']}-${index}`
              : `jsonld-${index}`
          }
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
        />
      ))}
    </>
  )
}
