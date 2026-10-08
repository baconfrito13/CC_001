"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { fill } from "@/lib/format";
import { button, input } from "./ui";

export interface WithdrawalStrings {
  nameLabel: string;
  emailLabel: string;
  referenceLabel: string;
  referenceHint: string;
  messageLabel: string;
  messageHint: string;
  submit: string;
  submitting: string;
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    referenceRequired: string;
    tooLong: string;
    generic: string;
    rateLimited: string;
    unavailable: string;
    /** Contains {email}: the support address to write to instead. */
    delivery: string;
    summary: string;
  };
  successTitle: string;
  /** Contains {timestamp}. */
  successBody: string;
  /** Contains {reference}. */
  successReference: string;
  /** Contains {email}. */
  successAck: string;
}

type FieldName = "name" | "email" | "reference" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Receipt {
  submittedAt: string;
  email: string;
  reference: string;
}

/**
 * Online withdrawal function (Art. 11a of Directive 2011/83/EU, as amended by Directive (EU)
 * 2023/2673): the consumer states the withdrawal, sees a confirmation with the time of receipt,
 * and an acknowledgement is sent by email. Same accessibility pattern as the waitlist form.
 */
export function WithdrawalForm({
  locale,
  intlLocale,
  supportEmail,
  strings,
}: {
  locale: string;
  intlLocale: string;
  supportEmail: string;
  strings: WithdrawalStrings;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
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
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const name = value("name");
    const email = value("email");
    const reference = value("reference");
    const message = value("message");

    const next: FieldErrors = {};
    if (!name) next.name = strings.errors.nameRequired;
    else if (name.length > 120) next.name = strings.errors.tooLong;
    if (!email) next.email = strings.errors.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) next.email = strings.errors.emailInvalid;
    if (!reference) next.reference = strings.errors.referenceRequired;
    else if (reference.length > 120) next.reference = strings.errors.tooLong;
    if (message.length > 2000) next.message = strings.errors.tooLong;
    setFormError(null);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          reference,
          message,
          locale,
          website: value("website"),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        submittedAt?: string;
        fieldErrors?: Partial<Record<FieldName, "required" | "invalid" | "too_long">>;
      };

      if (response.ok && data.submittedAt) {
        setReceipt({ submittedAt: data.submittedAt, email, reference });
        setStatus("success");
        return;
      }
      if (response.status === 400 && data.fieldErrors) {
        const serverErrors: FieldErrors = {};
        const e = strings.errors;
        const f = data.fieldErrors;
        if (f.name)
          serverErrors.name = f.name === "too_long" ? e.tooLong : e.nameRequired;
        if (f.email)
          serverErrors.email = f.email === "required" ? e.emailRequired : e.emailInvalid;
        if (f.reference) {
          serverErrors.reference =
            f.reference === "too_long" ? e.tooLong : e.referenceRequired;
        }
        if (f.message) serverErrors.message = e.tooLong;
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
            : response.status === 502
              ? fill(strings.errors.delivery, { email: supportEmail })
              : strings.errors.generic,
      );
    } catch {
      setFormError(fill(strings.errors.delivery, { email: supportEmail }));
    }
    setStatus("idle");
  }

  if (status === "success" && receipt) {
    const timestamp = new Intl.DateTimeFormat(intlLocale, {
      dateStyle: "long",
      timeStyle: "long",
    }).format(new Date(receipt.submittedAt));
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border-2 border-foreground bg-card p-6 text-card-foreground outline-none"
      >
        <h2 className="font-display text-xl font-bold">{strings.successTitle}</h2>
        <p className="mt-3">{fill(strings.successBody, { timestamp })}</p>
        <p className="mt-2 font-semibold">
          {fill(strings.successReference, { reference: receipt.reference })}
        </p>
        <p className="mt-2">{fill(strings.successAck, { email: receipt.email })}</p>
      </div>
    );
  }

  const submitting = status === "submitting";
  const field = (name: FieldName) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `withdrawal-${name}-error` : undefined,
  });
  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p id={`withdrawal-${name}-error`} className="mt-1.5 text-sm font-semibold">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      {hasErrors ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border-2 border-foreground p-4 outline-none"
        >
          {formError ? (
            <p className="font-semibold">{formError}</p>
          ) : (
            <>
              <p className="font-semibold">{strings.errors.summary}</p>
              <ul className="mt-2 list-disc pl-5">
                {(Object.entries(errors) as [FieldName, string][]).map(
                  ([name, message]) => (
                    <li key={name}>
                      <a
                        href={`#withdrawal-${name}`}
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
        <label htmlFor="withdrawal-name" className="block text-sm font-semibold">
          {strings.nameLabel}
        </label>
        <input
          id="withdrawal-name"
          name="name"
          type="text"
          autoComplete="name"
          className={`${input} mt-1.5`}
          {...field("name")}
        />
        {fieldError("name")}
      </div>

      <div>
        <label htmlFor="withdrawal-email" className="block text-sm font-semibold">
          {strings.emailLabel}
        </label>
        <input
          id="withdrawal-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={`${input} mt-1.5`}
          {...field("email")}
        />
        {fieldError("email")}
      </div>

      <div>
        <label htmlFor="withdrawal-reference" className="block text-sm font-semibold">
          {strings.referenceLabel}
        </label>
        <p
          id="withdrawal-reference-hint"
          className="mt-0.5 text-sm text-muted-foreground"
        >
          {strings.referenceHint}
        </p>
        <input
          id="withdrawal-reference"
          name="reference"
          type="text"
          autoComplete="off"
          className={`${input} mt-1.5`}
          aria-invalid={errors.reference ? true : undefined}
          aria-describedby={
            errors.reference
              ? "withdrawal-reference-hint withdrawal-reference-error"
              : "withdrawal-reference-hint"
          }
        />
        {fieldError("reference")}
      </div>

      <div>
        <label htmlFor="withdrawal-message" className="block text-sm font-semibold">
          {strings.messageLabel}
        </label>
        <p id="withdrawal-message-hint" className="mt-0.5 text-sm text-muted-foreground">
          {strings.messageHint}
        </p>
        <textarea
          id="withdrawal-message"
          name="message"
          rows={4}
          className={`${input} mt-1.5`}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message
              ? "withdrawal-message-hint withdrawal-message-error"
              : "withdrawal-message-hint"
          }
        />
        {fieldError("message")}
      </div>

      {/* Honeypot: invisible to people and assistive technology, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="withdrawal-website">Website</label>
        <input
          id="withdrawal-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${button.primary} w-full sm:w-auto`}
      >
        {submitting ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
