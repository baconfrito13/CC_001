"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { button, input } from "./ui";

export interface WaitlistStrings {
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  consentPrefix: string;
  consentLinkText: string;
  consentSuffix: string;
  errors: {
    emailRequired: string;
    emailInvalid: string;
    consentRequired: string;
    generic: string;
    rateLimited: string;
    unavailable: string;
    summary: string;
  };
  successTitle: string;
  successBody: string;
}

type FieldName = "email" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Waitlist signup with explicit, unticked-by-default consent.
 *
 * Accessibility: errors are listed in a focusable summary (links jump to each field), shown
 * inline with `aria-describedby`, and fields carry `aria-invalid`. The honeypot input is
 * hidden from people and assistive technology; bots that fill it are dropped by the API.
 */
export function WaitlistForm({
  locale,
  privacyHref,
  externalLinkHint,
  strings,
}: {
  locale: string;
  privacyHref: string;
  externalLinkHint: string;
  strings: WaitlistStrings;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const hasErrors = Object.keys(errors).length > 0 || formError !== null;

  useEffect(() => {
    if (hasErrors) summaryRef.current?.focus();
  }, [hasErrors]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
    const website = String(form.get("website") ?? "");

    const next: FieldErrors = {};
    if (!email) next.email = strings.errors.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) next.email = strings.errors.emailInvalid;
    if (!consent) next.consent = strings.errors.consentRequired;
    setFormError(null);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, locale, website }),
      });
      if (response.ok) {
        track("waitlist_signup", { locale });
        setStatus("success");
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        fieldErrors?: Partial<Record<FieldName, "required" | "invalid">>;
      };
      if (response.status === 400 && data.fieldErrors) {
        const serverErrors: FieldErrors = {};
        if (data.fieldErrors.email) {
          serverErrors.email =
            data.fieldErrors.email === "required"
              ? strings.errors.emailRequired
              : strings.errors.emailInvalid;
        }
        if (data.fieldErrors.consent)
          serverErrors.consent = strings.errors.consentRequired;
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
          setStatus("idle");
          return;
        }
      }
      setFormError(
        response.status === 429
          ? strings.errors.rateLimited
          : response.status === 503
            ? strings.errors.unavailable
            : strings.errors.generic,
      );
    } catch {
      setFormError(strings.errors.generic);
    }
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl bg-card p-6 text-card-foreground outline-none"
      >
        <h3 className="font-display text-xl font-bold">{strings.successTitle}</h3>
        <p className="mt-2">{strings.successBody}</p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl bg-card p-6 text-card-foreground shadow-lg"
    >
      {hasErrors ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 rounded-lg border-2 border-foreground p-4 outline-none"
        >
          {formError ? (
            <p className="font-semibold">{formError}</p>
          ) : (
            <>
              <p className="font-semibold">{strings.errors.summary}</p>
              <ul className="mt-2 list-disc pl-5">
                {(Object.entries(errors) as [FieldName, string][]).map(
                  ([field, message]) => (
                    <li key={field}>
                      <a
                        href={`#waitlist-${field}`}
                        className="underline underline-offset-2"
                      >
                        {message}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>
      ) : null}

      <div>
        <label htmlFor="waitlist-email" className="block text-sm font-semibold">
          {strings.emailLabel}
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={strings.emailPlaceholder}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "waitlist-email-error" : undefined}
          className={`${input} mt-1.5`}
        />
        {errors.email ? (
          <p id="waitlist-email-error" className="mt-1.5 text-sm font-semibold">
            {errors.email}
          </p>
        ) : null}
      </div>

      {/* Honeypot: invisible to people and assistive technology, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="waitlist-website">Website</label>
        <input
          id="waitlist-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id="waitlist-consent"
          name="consent"
          type="checkbox"
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "waitlist-consent-error" : undefined}
          className="mt-1 size-5 shrink-0 accent-brand"
        />
        <div>
          <label htmlFor="waitlist-consent" className="text-sm">
            {strings.consentPrefix}
            <Link
              href={privacyHref}
              target="_blank"
              rel="noopener"
              className="font-semibold text-brand underline underline-offset-2"
            >
              {strings.consentLinkText}
              <span className="sr-only"> {externalLinkHint}</span>
            </Link>
            {strings.consentSuffix}
          </label>
          {errors.consent ? (
            <p id="waitlist-consent-error" className="mt-1.5 text-sm font-semibold">
              {errors.consent}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${button.primary} mt-6 w-full`}
      >
        {submitting ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
