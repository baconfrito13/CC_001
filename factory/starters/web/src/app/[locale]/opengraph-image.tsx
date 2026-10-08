import { ImageResponse } from "next/og";
import { locales, site } from "@/config/site";
import { getDictionary } from "@/content";
import { readBrandColors } from "@/lib/brand";
import { isLocale } from "@/lib/i18n";

export const alt = `${site.name} - ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** 1200x630 social card drawn with the brand colours from tokens.css (system font). */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  const colors = readBrandColors();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: colors.brand,
        color: colors.brandForeground,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: colors.brandForeground,
            color: colors.brand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            fontWeight: 800,
          }}
        >
          {site.name.slice(0, 1).toUpperCase()}
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{site.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
          {site.tagline}
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            fontSize: 30,
            fontWeight: 600,
            padding: "12px 28px",
            borderRadius: 999,
            background: colors.accent,
            color: colors.accentForeground,
          }}
        >
          {dict.meta.ogCaption}
        </div>
      </div>
      <div style={{ fontSize: 30, opacity: 0.9 }}>{site.domain}</div>
    </div>,
    { ...size },
  );
}
