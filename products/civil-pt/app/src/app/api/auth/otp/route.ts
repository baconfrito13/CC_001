import { handleOtp } from "@/lib/auth/handlers";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleOtp(request);
}
