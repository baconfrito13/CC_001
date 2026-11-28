"use client";

import { useSearchParams } from "next/navigation";

/** Shows the outcome after Stripe redirects back to the pricing page (?checkout=...). */
export function CheckoutStatus({
  success,
  cancelled,
}: {
  success: string;
  cancelled: string;
}) {
  const outcome = useSearchParams().get("checkout");
  if (outcome !== "success" && outcome !== "cancelled") return null;
  return (
    <p
      role="status"
      className="mb-8 rounded-lg border border-muted-foreground/50 bg-card p-4 font-medium text-card-foreground"
    >
      {outcome === "success" ? success : cancelled}
    </p>
  );
}
