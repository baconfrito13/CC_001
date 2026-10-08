/**
 * Cookie-consent storage rules (framework free, unit tested).
 *
 * The choice is stored twice: in localStorage (JSON with a timestamp) and in a first-party
 * `consent` cookie (`granted` | `denied`). The cookie lets the server or a CDN rule see the
 * choice and is the fallback when localStorage is unavailable. The choice expires after
 * 180 days so visitors are asked again periodically.
 */
export const CONSENT_STORAGE_KEY = "consent";
export const CONSENT_COOKIE = "consent";
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export type ConsentStatus = "granted" | "denied";

export interface StoredConsent {
  v: 1;
  status: ConsentStatus;
  /** ISO timestamp of the decision. */
  at: string;
}

export function serializeConsent(status: ConsentStatus, now = new Date()): string {
  const value: StoredConsent = { v: 1, status, at: now.toISOString() };
  return JSON.stringify(value);
}

/** Parse the localStorage value; returns null when missing, malformed or expired. */
export function parseStoredConsent(
  raw: string | null | undefined,
  now = new Date(),
): ConsentStatus | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (value.v !== 1 || (value.status !== "granted" && value.status !== "denied"))
      return null;
    const decidedAt = Date.parse(value.at ?? "");
    if (Number.isNaN(decidedAt)) return null;
    if (now.getTime() - decidedAt > CONSENT_MAX_AGE_SECONDS * 1000) return null;
    return value.status;
  } catch {
    return null;
  }
}

export function consentCookie(status: ConsentStatus, secure: boolean): string {
  return [
    `${CONSENT_COOKIE}=${status}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/** Read the status from a `document.cookie` string (fallback when localStorage is empty). */
export function parseConsentCookie(
  cookieHeader: string | null | undefined,
): ConsentStatus | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === CONSENT_COOKIE && (value === "granted" || value === "denied"))
      return value;
  }
  return null;
}
