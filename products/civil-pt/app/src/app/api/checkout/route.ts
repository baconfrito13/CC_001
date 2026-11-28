import { handleCheckout } from "@/lib/checkout";

export function POST(request: Request) {
  return handleCheckout(request);
}
