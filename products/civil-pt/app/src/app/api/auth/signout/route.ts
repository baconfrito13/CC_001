import { handleSignOut } from "@/lib/auth/handlers";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleSignOut(request);
}
