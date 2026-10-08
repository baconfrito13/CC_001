"use client";

import { useState } from "react";
import { track } from "@/lib/track";
import { button } from "./ui";

export interface CheckoutButtonProps {
  planId: string;
  locale: string;
  label: string;
  redirectingLabel: string;
  errorMessage: string;
  notConfiguredMessage: string;
  highlighted: boolean;
}

/** Starts a Stripe Checkout Session through POST /api/checkout and redirects to it. */
export function CheckoutButton(props: CheckoutButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "unavailable">(
    "idle",
  );

  async function startCheckout() {
    setState("loading");
    track("checkout_start", { plan: props.planId, locale: props.locale });
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: props.planId, locale: props.locale }),
      });
      if (response.status === 501) {
        setState("unavailable");
        return;
      }
      const data = (await response.json()) as { url?: string };
      if (!response.ok || !data.url) throw new Error("checkout failed");
      window.location.assign(data.url);
    } catch {
      setState("error");
    }
  }

  const message =
    state === "unavailable"
      ? props.notConfiguredMessage
      : state === "error"
        ? props.errorMessage
        : state === "loading"
          ? props.redirectingLabel
          : "";

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={state === "loading"}
        aria-describedby={message ? `checkout-msg-${props.planId}` : undefined}
        className={`${props.highlighted ? button.primary : button.secondary} w-full`}
      >
        {props.label}
      </button>
      <p
        id={`checkout-msg-${props.planId}`}
        role="status"
        className="mt-2 min-h-5 text-sm text-muted-foreground"
      >
        {message}
      </p>
    </div>
  );
}
