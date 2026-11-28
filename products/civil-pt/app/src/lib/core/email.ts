import { createHash } from "node:crypto";

/**
 * Canonical form of an email for "one trial per person" (US-08 criterion 6): lower case, the
 * "+tag" removed, dots removed from Gmail local parts, googlemail.com treated as gmail.com.
 *
 * The SQL function `public.normalize_email` does exactly the same (tests/contract keeps the two
 * identical), so the trial trigger and the application agree on who has already had a trial.
 */
export function normalizeEmail(input: string): string {
  const email = input.trim().toLowerCase();
  const [rawLocal = "", rawDomain = ""] = email.split("@");
  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  const stripped = rawLocal.split("+")[0] ?? "";
  let local = stripped === "" ? rawLocal : stripped;
  if (domain === "gmail.com") local = local.replaceAll(".", "");
  return `${local}@${domain}`;
}

/** SHA-256 (hex) of the normalised email: the key of `trial_grants`. */
export function trialEmailHash(email: string): string {
  return createHash("sha256").update(normalizeEmail(email), "utf8").digest("hex");
}
