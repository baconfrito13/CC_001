import { describe, expect, it } from "vitest";
import {
  CONSENT_MAX_AGE_SECONDS,
  consentCookie,
  parseConsentCookie,
  parseStoredConsent,
  serializeConsent,
} from "@/lib/consent";

const now = new Date("2026-10-08T10:00:00.000Z");

describe("consent storage", () => {
  it("round-trips a decision", () => {
    expect(parseStoredConsent(serializeConsent("granted", now), now)).toBe("granted");
    expect(parseStoredConsent(serializeConsent("denied", now), now)).toBe("denied");
  });

  it("expires decisions after 180 days", () => {
    const stored = serializeConsent("granted", now);
    const almost = new Date(now.getTime() + (CONSENT_MAX_AGE_SECONDS - 60) * 1000);
    const later = new Date(now.getTime() + (CONSENT_MAX_AGE_SECONDS + 60) * 1000);
    expect(parseStoredConsent(stored, almost)).toBe("granted");
    expect(parseStoredConsent(stored, later)).toBeNull();
  });

  it("ignores missing, malformed or tampered values", () => {
    for (const raw of [null, undefined, "", "{", "null", '{"v":2,"status":"granted","at":"2026-10-08T10:00:00Z"}']) {
      expect(parseStoredConsent(raw, now)).toBeNull();
    }
    expect(parseStoredConsent('{"v":1,"status":"maybe","at":"2026-10-08T10:00:00Z"}', now)).toBeNull();
    expect(parseStoredConsent('{"v":1,"status":"granted","at":"yesterday"}', now)).toBeNull();
  });

  it("builds a first-party cookie with a bounded lifetime", () => {
    expect(consentCookie("denied", false)).toBe("consent=denied; Path=/; Max-Age=15552000; SameSite=Lax");
    expect(consentCookie("granted", true)).toContain("; Secure");
  });

  it("reads the cookie fallback", () => {
    expect(parseConsentCookie("a=1; consent=granted; b=2")).toBe("granted");
    expect(parseConsentCookie("consent=denied")).toBe("denied");
    expect(parseConsentCookie("consent=yes")).toBeNull();
    expect(parseConsentCookie("")).toBeNull();
    expect(parseConsentCookie(null)).toBeNull();
  });
});
