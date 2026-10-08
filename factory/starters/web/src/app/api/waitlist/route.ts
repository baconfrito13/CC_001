import { handleWaitlist } from "@/lib/waitlist/handler";

export function POST(request: Request) {
  return handleWaitlist(request);
}
