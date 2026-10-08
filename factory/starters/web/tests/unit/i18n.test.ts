import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  isLocale,
  localeMeta,
  negotiateLocale,
  parseAcceptLanguage,
} from "@/lib/i18n";
import { localizedPath, splitLocalePath, switchLocalePath } from "@/lib/locale-path";
import { config, proxy } from "@/proxy";

describe("parseAcceptLanguage", () => {
  it("orders tags by quality, then by position", () => {
    expect(parseAcceptLanguage("en;q=0.5, pt-PT, fr;q=0.8, de;q=0.8")).toEqual([
      "pt-pt",
      "fr",
      "de",
      "en",
    ]);
  });

  it("drops q=0, malformed tags and empty input", () => {
    expect(parseAcceptLanguage("en;q=0, !!!, pt;q=abc, es")).toEqual(["es"]);
    expect(parseAcceptLanguage("")).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
    expect(parseAcceptLanguage(undefined)).toEqual([]);
  });

  it("bounds the work done on hostile headers", () => {
    const header = Array.from({ length: 500 }, (_, i) => `x${i}`).join(",");
    expect(parseAcceptLanguage(header).length).toBeLessThanOrEqual(32);
    expect(parseAcceptLanguage("a".repeat(5_000)).length).toBeLessThanOrEqual(1);
  });
});

describe("negotiateLocale", () => {
  it("maps every Portuguese variant to pt", () => {
    for (const header of [
      "pt",
      "pt-PT",
      "pt-BR",
      "PT-pt,en;q=0.5",
      "pt-PT,pt;q=0.9,en;q=0.5",
    ]) {
      expect(negotiateLocale(header)).toBe("pt");
    }
  });

  it("honours quality values", () => {
    expect(negotiateLocale("en;q=0.4,pt;q=0.9")).toBe("pt");
    expect(negotiateLocale("pt;q=0.4,en;q=0.9")).toBe("en");
  });

  it("selects English for English variants", () => {
    expect(negotiateLocale("en-GB,en;q=0.8")).toBe("en");
    expect(negotiateLocale("en-US")).toBe("en");
  });

  it("falls back to the default locale when nothing matches or the header is missing", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,de;q=0.8")).toBe("en");
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
    expect(negotiateLocale("*")).toBe("en");
  });

  it("falls through unsupported preferences to the next supported one", () => {
    expect(negotiateLocale("fr,pt;q=0.5")).toBe("pt");
  });

  it("respects custom available locales and fallback", () => {
    expect(negotiateLocale("pt", ["en"], "en")).toBe("en");
    expect(negotiateLocale("fr", ["en", "pt"], "pt")).toBe("pt");
  });
});

describe("locale helpers", () => {
  it("recognises supported locales only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("pt-PT")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("uses European Portuguese for the pt locale", () => {
    expect(localeMeta.pt.htmlLang).toBe("pt-PT");
    expect(localeMeta.pt.hreflang).toBe("pt-PT");
    expect(localeMeta.pt.ogLocale).toBe("pt_PT");
    expect(localeMeta.en.htmlLang).toBe("en");
  });

  it("builds and switches localized paths", () => {
    expect(localizedPath("en")).toBe("/en");
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("pt", "/pricing")).toBe("/pt/pricing");
    expect(localizedPath("pt", "pricing")).toBe("/pt/pricing");
    expect(splitLocalePath("/pt/legal/privacy", ["en", "pt"])).toEqual({
      locale: "pt",
      rest: "/legal/privacy",
    });
    expect(splitLocalePath("/en", ["en", "pt"])).toEqual({ locale: "en", rest: "" });
    expect(splitLocalePath("/pricing", ["en", "pt"])).toEqual({
      locale: null,
      rest: "/pricing",
    });
    expect(splitLocalePath("/", ["en", "pt"])).toEqual({ locale: null, rest: "" });
    expect(switchLocalePath("/en/legal/terms", "pt", ["en", "pt"])).toBe(
      "/pt/legal/terms",
    );
    expect(switchLocalePath("/pt", "en", ["en", "pt"])).toBe("/en");
    expect(absoluteUrl("pt", "/pricing", "https://acme.example")).toBe(
      "https://acme.example/pt/pricing",
    );
  });
});

describe("proxy (locale redirect)", () => {
  const call = (path: string, acceptLanguage?: string) =>
    proxy(
      new NextRequest(`http://localhost:3000${path}`, {
        headers: acceptLanguage ? { "accept-language": acceptLanguage } : {},
      }),
    );

  it("redirects / to the best locale with a temporary redirect", () => {
    const pt = call("/", "pt-PT,pt;q=0.9,en;q=0.5");
    expect(pt.status).toBe(307);
    expect(new URL(pt.headers.get("location") ?? "").pathname).toBe("/pt");
    expect(pt.headers.get("vary")).toContain("Accept-Language");

    const en = call("/", "en-US");
    expect(new URL(en.headers.get("location") ?? "").pathname).toBe("/en");
  });

  it("falls back to the default locale without Accept-Language", () => {
    expect(new URL(call("/").headers.get("location") ?? "").pathname).toBe("/en");
  });

  it("keeps the path and query when adding the locale", () => {
    const response = call("/pricing?ref=x", "pt");
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/pt/pricing");
    expect(location.search).toBe("?ref=x");
  });

  it("lets already-localized paths through", () => {
    for (const path of ["/en", "/pt/pricing", "/en/legal/privacy"]) {
      const response = call(path, "pt");
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("does not run for API routes, Next internals or files", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/")).toBe(true);
    expect(matcher.test("/pricing")).toBe(true);
    for (const path of [
      "/api/waitlist",
      "/_next/static/a.js",
      "/sitemap.xml",
      "/robots.txt",
      "/icon.svg",
    ]) {
      expect(matcher.test(path)).toBe(false);
    }
  });
});
