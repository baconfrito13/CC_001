import { z } from "zod";
import { locales, supportedLocales } from "@/config/site";

/** Name of the honeypot input. Real users never see or fill it; bots usually do. */
export const HONEYPOT_FIELD = "website";

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  /** Must be explicitly true: consent is never pre-ticked or implied. */
  consent: z.literal(true),
  locale: z.enum(supportedLocales).refine((locale) => locales.includes(locale)),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type WaitlistInput = z.output<typeof waitlistSchema>;

export type WaitlistFieldErrors = Partial<
  Record<"email" | "consent" | "locale", "required" | "invalid">
>;

export type WaitlistParseResult =
  | { ok: true; data: Omit<WaitlistInput, typeof HONEYPOT_FIELD> }
  | { ok: false; reason: "honeypot" }
  | { ok: false; reason: "invalid"; fieldErrors: WaitlistFieldErrors };

/**
 * Validate a waitlist submission.
 * A filled honeypot is reported separately so the API can pretend success and drop the entry.
 */
export function parseWaitlistRequest(body: unknown): WaitlistParseResult {
  if (typeof body === "object" && body !== null) {
    const trap = (body as Record<string, unknown>)[HONEYPOT_FIELD];
    if (typeof trap === "string" && trap.trim() !== "")
      return { ok: false, reason: "honeypot" };
  }

  const result = waitlistSchema.safeParse(body);
  if (result.success) {
    const { email, consent, locale } = result.data;
    return { ok: true, data: { email, consent, locale } };
  }

  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const fieldErrors: WaitlistFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "email") {
      const raw = record.email;
      fieldErrors.email =
        typeof raw !== "string" || raw.trim() === "" ? "required" : "invalid";
    } else if (field === "consent") {
      fieldErrors.consent = "required";
    } else if (field === "locale") {
      fieldErrors.locale = "invalid";
    }
  }
  // Nothing identifiable (e.g. the body was not an object): blame the first field.
  if (Object.keys(fieldErrors).length === 0) fieldErrors.email = "required";
  return { ok: false, reason: "invalid", fieldErrors };
}
