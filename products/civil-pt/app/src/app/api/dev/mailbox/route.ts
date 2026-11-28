import { z } from "zod";
import { problem } from "@/lib/core/problem";
import { devRoutesEnabled } from "@/lib/dev";
import { getEmailSender } from "@/lib/email";
import { ConsoleEmailSender } from "@/lib/email/console";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Test mode only (see src/lib/dev.ts): the last email sent to an address, so the e2e tests can
 * read the sign-in code and link the way a person reads their inbox.
 */
export function GET(request: Request) {
  if (!devRoutesEnabled(getEnv())) return problem(404, "not_found");
  const sender = getEmailSender();
  if (!(sender instanceof ConsoleEmailSender)) return problem(404, "not_found");
  const to = z.email().safeParse(new URL(request.url).searchParams.get("to"));
  if (!to.success) return problem(400, "invalid_request");
  const message = sender.lastTo(to.data);
  if (!message) return problem(404, "not_found");
  return Response.json(
    { to: message.to, subject: message.subject, text: message.text },
    { headers: { "Cache-Control": "no-store" } },
  );
}
