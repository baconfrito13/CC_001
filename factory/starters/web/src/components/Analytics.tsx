"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useConsent } from "./CookieConsent";

export interface AnalyticsProps {
  provider: "none" | "plausible" | "posthog";
  plausibleDomain?: string;
  plausibleScriptSrc: string;
  posthogKey?: string;
  posthogHost: string;
  /** Plausible only: a cookieless setup may run without consent. */
  cookieless: boolean;
}

interface PostHogLike {
  __loaded?: boolean;
  opt_in_capturing?: () => void;
  opt_out_capturing?: () => void;
}

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

/** Where PostHog serves its JavaScript from (`eu.i.posthog.com` -> `eu-assets.i.posthog.com`). */
export function posthogAssetsHost(apiHost: string): string {
  return apiHost.replace(".i.posthog.com", "-assets.i.posthog.com");
}

/**
 * Minimal PostHog loader (the official snippet without the method stubs we never call).
 * Key and host are embedded with JSON.stringify so they cannot break out of the script.
 */
export function posthogSnippet(key: string, apiHost: string): string {
  return `(function(w,d){
if(w.posthog&&w.posthog.__loaded)return;
var ph=w.posthog=w.posthog||[];
ph._i=[];ph.__SV=1;
ph.init=function(token,config,name){
ph._i.push([token,config,name]);
var s=d.createElement("script");s.async=true;s.crossOrigin="anonymous";
s.src=${JSON.stringify(`${posthogAssetsHost(apiHost)}/static/array.js`)};
d.head.appendChild(s);
};
ph.init(${JSON.stringify(key)},{api_host:${JSON.stringify(apiHost)},defaults:"2025-05-24",person_profiles:"identified_only"});
})(window,document);`;
}

/**
 * Loads the configured analytics provider, and only when allowed:
 *  - Plausible: after consent, or immediately when `cookieless` is true (no cookies, no
 *    personal data stored on the device).
 *  - PostHog: only after consent.
 * Withdrawing consent later switches PostHog capturing off for the rest of the session.
 */
export function Analytics(props: AnalyticsProps) {
  const { status } = useConsent();
  const granted = status === "granted";

  const plausibleReady =
    props.provider === "plausible" &&
    Boolean(props.plausibleDomain) &&
    (props.cookieless || granted);
  const posthogReady =
    props.provider === "posthog" && Boolean(props.posthogKey) && granted;

  useEffect(() => {
    if (props.provider !== "posthog") return;
    const posthog = window.posthog;
    if (!posthog?.__loaded) return;
    if (granted) posthog.opt_in_capturing?.();
    else posthog.opt_out_capturing?.();
  }, [props.provider, granted]);

  if (plausibleReady && props.plausibleDomain) {
    return (
      <Script
        id="plausible"
        src={props.plausibleScriptSrc}
        data-domain={props.plausibleDomain}
        strategy="afterInteractive"
      />
    );
  }

  if (posthogReady && props.posthogKey) {
    return (
      <Script id="posthog" strategy="afterInteractive">
        {posthogSnippet(props.posthogKey, props.posthogHost)}
      </Script>
    );
  }

  return null;
}
