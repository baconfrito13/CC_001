"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { button, input } from "@/components/ui";
import type { AuthCopy } from "@/content/app/auth";
import { fill } from "@/lib/format";

type Step = "email" | "code";

interface ProblemBody {
  code?: string;
}

export interface LoginFormProps {
  locale: string;
  /** Where to go after signing in (the server validates it again). */
  next: string;
  copy: AuthCopy["login"];
  termsHref: string;
  privacyHref: string;
  /** A message from the confirmation page (expired link), already localized. */
  initialError: string | null;
}

/**
 * The two steps of US-01: the email, then the 6-digit code. The link of the email is the other
 * way in (it opens the confirmation page). Both validation messages and server errors are shown
 * in one live region so that a screen reader announces them, and the field they refer to is
 * marked invalid.
 */
export function LoginForm({
  locale,
  next,
  copy,
  termsHref,
  privacyHref,
  initialError,
}: LoginFormProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  function messageFor(problem: ProblemBody | null, fallback: string): string {
    switch (problem?.code) {
      case "invalid_email":
        return copy.invalidEmail;
      case "invalid_code":
        return copy.codeExpired;
      case "too_many_attempts":
        return copy.tooManyAttempts;
      case "rate_limited":
        return copy.tooManyRequests;
      default:
        return fallback;
    }
  }

  async function post(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const problem = response.ok
      ? null
      : ((await response.json().catch(() => null)) as ProblemBody | null);
    const data = response.ok
      ? ((await response.json().catch(() => null)) as { redirectTo?: string } | null)
      : null;
    return { ok: response.ok, problem, data };
  }

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await post("/api/auth/otp", { email: email.trim(), locale, next });
      if (result.ok) {
        setCode("");
        setStep("code");
      } else {
        setError(messageFor(result.problem, copy.genericError));
        emailRef.current?.focus();
      }
    } catch {
      setError(copy.genericError);
    } finally {
      setPending(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const digits = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(digits)) {
      setError(copy.invalidCodeFormat);
      codeRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      const result = await post("/api/auth/verify", {
        email: email.trim(),
        code: digits,
        locale,
        next,
      });
      if (result.ok && result.data?.redirectTo) {
        // A full navigation, so the new session cookie is sent with the next request.
        window.location.assign(result.data.redirectTo);
        return;
      }
      setError(messageFor(result.problem, copy.genericError));
      codeRef.current?.focus();
    } catch {
      setError(copy.genericError);
    } finally {
      setPending(false);
    }
  }

  const errorId = "login-error";

  return (
    <div className="space-y-6">
      <div role="alert" id={errorId} className={error ? "" : "sr-only"}>
        {error ? (
          <p className="rounded-lg border border-red-700 bg-card p-3 text-sm font-medium text-red-800 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      {step === "email" ? (
        <form onSubmit={sendCode} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
              {copy.emailLabel}
            </label>
            <input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.emailPlaceholder}
              aria-invalid={error === copy.invalidEmail}
              aria-describedby={error === copy.invalidEmail ? errorId : undefined}
              className={input}
            />
          </div>
          <button type="submit" disabled={pending} className={`${button.primary} w-full`}>
            {pending ? copy.sending : copy.sendCode}
          </button>
          <p className="text-sm text-muted-foreground">
            {copy.consentPrefix}
            <Link href={termsHref} className="underline underline-offset-4">
              {copy.termsLink}
            </Link>
            {copy.consentMiddle}
            <Link href={privacyHref} className="underline underline-offset-4">
              {copy.privacyLink}
            </Link>
            {copy.consentSuffix}
          </p>
        </form>
      ) : (
        <form onSubmit={verify} noValidate className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {fill(copy.codeIntro, { email })}
          </p>
          <div>
            <label htmlFor="login-code" className="mb-1 block text-sm font-medium">
              {copy.codeLabel}
            </label>
            <input
              ref={codeRef}
              id="login-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={12}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby={`${errorId} login-code-hint`}
              className={`${input} text-center text-2xl tracking-[0.4em]`}
            />
            <p id="login-code-hint" className="mt-1 text-sm text-muted-foreground">
              {copy.codeHint}
            </p>
          </div>
          <button type="submit" disabled={pending} className={`${button.primary} w-full`}>
            {pending ? copy.verifying : copy.verify}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className={`${button.secondary} w-full`}
          >
            {copy.useAnotherEmail}
          </button>
        </form>
      )}
    </div>
  );
}
