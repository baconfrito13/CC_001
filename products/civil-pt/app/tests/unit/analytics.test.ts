import { describe, expect, it } from "vitest";
import { posthogAssetsHost, posthogSnippet } from "@/components/Analytics";

describe("PostHog loader", () => {
  it("maps API hosts to the assets host", () => {
    expect(posthogAssetsHost("https://eu.i.posthog.com")).toBe(
      "https://eu-assets.i.posthog.com",
    );
    expect(posthogAssetsHost("https://us.i.posthog.com")).toBe(
      "https://us-assets.i.posthog.com",
    );
    expect(posthogAssetsHost("https://ph.acme.example")).toBe("https://ph.acme.example");
  });

  it("embeds the key and host as escaped literals", () => {
    const snippet = posthogSnippet('phc_"</script>', "https://eu.i.posthog.com");
    expect(snippet).toContain('"https://eu-assets.i.posthog.com/static/array.js"');
    expect(snippet).toContain('"https://eu.i.posthog.com"');
    expect(snippet).not.toContain("</script>");
    expect(snippet).toContain('\\"\\u003c/script>');
  });
});
