import { z } from "zod";
import { locales, supportedLocales } from "@/config/site";
import { HONEYPOT_FIELD } from "@/lib/waitlist/schema";

export const withdrawalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  /** Order number, invoice number or any reference that identifies the contract. */
  reference: z.string().trim().min(1).max(120),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || undefined),
  locale: z.enum(supportedLocales).refine((locale) => locales.includes(locale)),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type WithdrawalInput = Omit<z.output<typeof withdrawalSchema>, typeof HONEYPOT_FIELD>;

export type WithdrawalField = "name" | "email" | "reference" | "message" | "locale";
export type WithdrawalFieldErrors = Partial<
  Record<WithdrawalField, "required" | "invalid" | "too_long">
>;

export type WithdrawalParseResult =
  | { ok: true; data: WithdrawalInput }
  | { ok: false; reason: "honeypot" }
  | { ok: false; reason: "invalid"; fieldErrors: WithdrawalFieldErrors };

const FIELDS: readonly string[] = ["name", "email", "reference", "message", "locale"];

/** Validate a withdrawal submission. A filled honeypot is reported separately (dropped silently). */
export function parseWithdrawalRequest(body: unknown): WithdrawalParseResult {
  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const trap = record[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") return { ok: false, reason: "honeypot" };

  const result = withdrawalSchema.safeParse(body);
  if (result.success) {
    const { name, email, reference, message, locale } = result.data;
    return { ok: true, data: { name, email, reference, message, locale } };
  }

  const fieldErrors: WithdrawalFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !FIELDS.includes(field)) continue;
    const key = field as WithdrawalField;
    if (fieldErrors[key]) continue;
    const raw = record[key];
    if (key === "locale") fieldErrors[key] = "invalid";
    else if (typeof raw !== "string" || raw.trim() === "") fieldErrors[key] = "required";
    else if (issue.code === "too_big") fieldErrors[key] = "too_long";
    else fieldErrors[key] = "invalid";
  }
  if (Object.keys(fieldErrors).length === 0) fieldErrors.name = "required";
  return { ok: false, reason: "invalid", fieldErrors };
}
