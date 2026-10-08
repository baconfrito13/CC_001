"use client";

import Link from "next/link";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CONSENT_STORAGE_KEY,
  type ConsentStatus,
  consentCookie,
  parseConsentCookie,
  parseStoredConsent,
  serializeConsent,
} from "@/lib/consent";
import { button } from "./ui";

interface ConsentContextValue {
  /** The visitor's decision, or null while undecided. */
  status: ConsentStatus | null;
  /** False until the stored decision has been read in the browser (avoids hydration flashes). */
  ready: boolean;
  bannerOpen: boolean;
  accept: () => void;
  reject: () => void;
  /** Re-open the banner so the visitor can change their choice. */
  openSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readConsent(): ConsentStatus | null {
  try {
    const stored = parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    // localStorage can be blocked; fall back to the cookie.
  }
  return parseConsentCookie(document.cookie);
}

function writeConsent(status: ConsentStatus): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsent(status));
  } catch {
    // Ignore: the cookie below still records the choice.
  }
  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not available in every supported browser.
  document.cookie = consentCookie(status, window.location.protocol === "https:");
}

/** Holds the consent decision for the whole page. Wrap the app once (see the locale layout). */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [reopened, setReopened] = useState(false);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setStatus(readConsent());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY) setStatus(readConsent());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const decide = useCallback((next: ConsentStatus) => {
    writeConsent(next);
    setStatus(next);
    setReopened(false);
    // Keyboard users who opened the settings from the footer land back where they were.
    const target = returnFocusTo.current;
    returnFocusTo.current = null;
    if (target?.isConnected) requestAnimationFrame(() => target.focus());
  }, []);

  const openSettings = useCallback(() => {
    returnFocusTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setReopened(true);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      status,
      ready,
      bannerOpen: ready && (status === null || reopened),
      accept: () => decide("granted"),
      reject: () => decide("denied"),
      openSettings,
    }),
    [status, ready, reopened, decide, openSettings],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

/** Read or change the cookie-consent decision from any client component. */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used inside <ConsentProvider>");
  return context;
}

export interface CookieBannerStrings {
  regionLabel: string;
  title: string;
  body: string;
  policyLinkText: string;
  accept: string;
  reject: string;
}

/**
 * The consent banner. Accept and Reject are rendered with exactly the same style, size and
 * weight (regulators treat a hidden or de-emphasised "reject" as a dark pattern).
 */
export function CookieBanner({
  strings,
  policyHref,
}: {
  strings: CookieBannerStrings;
  policyHref: string;
}) {
  const { bannerOpen, status, accept, reject } = useConsent();
  const containerRef = useRef<HTMLElement>(null);
  const wasReopened = status !== null;

  useEffect(() => {
    // First visit: do not steal focus. Re-opened from the footer: move focus into the banner.
    if (bannerOpen && wasReopened) containerRef.current?.focus();
  }, [bannerOpen, wasReopened]);

  if (!bannerOpen) return null;

  return (
    <section
      ref={containerRef}
      tabIndex={-1}
      aria-label={strings.regionLabel}
      className="fixed inset-x-0 bottom-0 z-50 p-3 outline-none sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-muted-foreground/50 bg-card p-5 text-card-foreground shadow-2xl">
        <h2 className="font-display text-lg font-bold">{strings.title}</h2>
        <p className="mt-2 text-sm">
          {strings.body}{" "}
          <Link
            href={policyHref}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {strings.policyLinkText}
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={`${button.equal} sm:flex-1`} onClick={reject}>
            {strings.reject}
          </button>
          <button type="button" className={`${button.equal} sm:flex-1`} onClick={accept}>
            {strings.accept}
          </button>
        </div>
      </div>
    </section>
  );
}

/** Footer control that re-opens the banner. */
export function CookieSettingsButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      {label}
    </button>
  );
}
