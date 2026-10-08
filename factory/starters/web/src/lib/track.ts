/**
 * Product analytics events: `track("name", { props })`.
 *
 * A no-op unless an analytics provider is configured AND tracking is allowed (visitor consent,
 * or a cookieless Plausible setup). It is safe to call anywhere in client code, at any time:
 * before consent nothing is sent and nothing is queued.
 *
 * Add your product's events (the PRD's success metrics) to `AnalyticsEvents`; TypeScript then
 * checks every call site. Keep property values small and free of personal data (no e-mails).
 *
 * Plausible: custom events appear under "Goals" (create a goal with the same name).
 * PostHog: events appear in "Activity" and can be used in funnels.
 */
export interface AnalyticsEvents {
  waitlist_signup: { locale: string };
  checkout_start: { plan: string; locale: string };
}

export type EventProps = Record<string, string | number | boolean>;

export interface TrackingState {
  provider: "none" | "plausible" | "posthog";
  /** True when the provider script may run (consent granted, or cookieless Plausible). */
  allowed: boolean;
}

let state: TrackingState = { provider: "none", allowed: false };

/** Called by <Analytics/> whenever the provider or the consent decision changes. */
export function configureTracking(next: TrackingState): void {
  state = next;
}

type PlausibleFn = {
  (event: string, options?: { props?: EventProps }): void;
  /** Calls made before the Plausible script loaded; the script replays them. */
  q?: unknown[][];
};

interface TrackingWindow {
  plausible?: PlausibleFn;
  posthog?: { capture?: (event: string, props?: EventProps) => void };
}

/** Same queue stub the official Plausible snippet installs. */
function plausibleOf(w: TrackingWindow): PlausibleFn {
  if (typeof w.plausible !== "function") {
    const queue: unknown[][] = [];
    const stub: PlausibleFn = (...args: unknown[]) => {
      queue.push(args);
    };
    stub.q = queue;
    w.plausible = stub;
  }
  return w.plausible as PlausibleFn;
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  props?: AnalyticsEvents[E],
): void;
export function track(event: string, props?: EventProps): void;
export function track(event: string, props?: EventProps): void {
  if (typeof window === "undefined" || !state.allowed) return;
  const w = window as unknown as TrackingWindow;

  try {
    if (state.provider === "plausible") {
      plausibleOf(w)(event, props ? { props } : undefined);
    } else if (state.provider === "posthog") {
      w.posthog?.capture?.(event, props);
    }
  } catch {
    // Analytics must never break the page.
  }
}
