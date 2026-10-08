import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTracking, track } from "@/lib/track";

type FakeWindow = {
  plausible?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  posthog?: { capture: (...args: unknown[]) => void };
};

describe("track()", () => {
  let fakeWindow: FakeWindow;

  beforeEach(() => {
    fakeWindow = {};
    vi.stubGlobal("window", fakeWindow);
  });

  afterEach(() => {
    configureTracking({ provider: "none", allowed: false });
    vi.unstubAllGlobals();
  });

  it("does nothing without a provider", () => {
    configureTracking({ provider: "none", allowed: true });
    track("waitlist_signup", { locale: "en" });
    expect(fakeWindow).toEqual({});
  });

  it("does nothing before consent (and queues nothing)", () => {
    for (const provider of ["plausible", "posthog"] as const) {
      configureTracking({ provider, allowed: false });
      fakeWindow.posthog = { capture: vi.fn() };
      track("waitlist_signup", { locale: "en" });
      expect(fakeWindow.plausible).toBeUndefined();
      expect(fakeWindow.posthog.capture).not.toHaveBeenCalled();
    }
  });

  it("does nothing on the server", () => {
    vi.unstubAllGlobals();
    configureTracking({ provider: "plausible", allowed: true });
    expect(() => track("waitlist_signup", { locale: "en" })).not.toThrow();
  });

  it("sends Plausible custom events with props", () => {
    const plausible = vi.fn();
    fakeWindow.plausible = plausible;
    configureTracking({ provider: "plausible", allowed: true });
    track("checkout_start", { plan: "pro", locale: "pt" });
    track("anything_else");
    expect(plausible).toHaveBeenNthCalledWith(1, "checkout_start", {
      props: { plan: "pro", locale: "pt" },
    });
    expect(plausible).toHaveBeenNthCalledWith(2, "anything_else", undefined);
  });

  it("queues Plausible events until the script has loaded", () => {
    configureTracking({ provider: "plausible", allowed: true });
    track("waitlist_signup", { locale: "en" });
    expect(fakeWindow.plausible?.q).toEqual([
      ["waitlist_signup", { props: { locale: "en" } }],
    ]);
  });

  it("sends PostHog events with capture()", () => {
    const capture = vi.fn();
    fakeWindow.posthog = { capture };
    configureTracking({ provider: "posthog", allowed: true });
    track("waitlist_signup", { locale: "pt" });
    expect(capture).toHaveBeenCalledWith("waitlist_signup", { locale: "pt" });
  });

  it("never throws, even when the provider breaks", () => {
    fakeWindow.posthog = {
      capture: () => {
        throw new Error("boom");
      },
    };
    configureTracking({ provider: "posthog", allowed: true });
    expect(() => track("waitlist_signup", { locale: "pt" })).not.toThrow();
  });

  it("stops sending as soon as consent is withdrawn", () => {
    const capture = vi.fn();
    fakeWindow.posthog = { capture };
    configureTracking({ provider: "posthog", allowed: true });
    track("a");
    configureTracking({ provider: "posthog", allowed: false });
    track("b");
    expect(capture).toHaveBeenCalledTimes(1);
  });
});
