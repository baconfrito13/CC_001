import { serializeJsonLd } from "@/lib/jsonld";

/** Renders a JSON-LD structured-data block. Build the object with the helpers in lib/jsonld. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serializeJsonLd escapes "<", and the data is first-party.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
