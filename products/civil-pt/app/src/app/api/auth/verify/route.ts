import { handleVerify } from "@/lib/auth/handlers";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleVerify(request);
}
