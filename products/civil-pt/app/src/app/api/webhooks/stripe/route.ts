import { handleStripeWebhook } from "@/lib/stripe-webhook";

export function POST(request: Request) {
  return handleStripeWebhook(request);
}
