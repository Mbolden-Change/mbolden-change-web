/** Shared JSON-LD primitives for Google rich-result schemas. */

export type JsonLd = Record<string, unknown>

export type SchemaGuardOk<T extends JsonLd = JsonLd> = {
  ok: true
  data: T
}

export type SchemaGuardFail = {
  ok: false
  /** Why this schema was not emitted — never send incomplete markup to Google. */
  reason: string
}

export type SchemaGuardResult<T extends JsonLd = JsonLd> =
  | SchemaGuardOk<T>
  | SchemaGuardFail

export function isSchemaOk<T extends JsonLd>(
  result: SchemaGuardResult<T>,
): result is SchemaGuardOk<T> {
  return result.ok
}

/** Collect only schemas that passed their edge guards. */
export function pickGuardedSchemas(
  results: SchemaGuardResult[],
): JsonLd[] {
  return results.filter(isSchemaOk).map((r) => r.data)
}
