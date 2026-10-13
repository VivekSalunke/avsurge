// Serialize data for <script type="application/ld+json">.
// JSON.stringify does not escape "<", so user text (e.g. review bodies)
// containing "</script>" could break out of the tag. Escaping "<" as
// \u003c keeps the JSON identical for parsers but makes it inert in HTML.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
