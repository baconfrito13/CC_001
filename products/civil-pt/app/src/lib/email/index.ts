import { type Env, getEnv } from "@/lib/env";
import { ConsoleEmailSender } from "./console";
import { createResendSender } from "./resend";
import type { EmailSender } from "./types";

/** Pick the email adapter from the environment (console by default; Resend needs its key and sender). */
export function createEmailSender(env: Env): EmailSender {
  if (env.EMAIL_ADAPTER === "resend") {
    return createResendSender({
      // reason: parseEnv guarantees these when EMAIL_ADAPTER=resend.
      apiKey: env.RESEND_API_KEY as string,
      from: (env.EMAIL_FROM ?? env.RESEND_FROM) as string,
    });
  }
  return new ConsoleEmailSender();
}

const SLOT = Symbol.for("rastoplan.emailSender");
type Slot = { [SLOT]?: EmailSender };

/** The process-wide sender (shared by every route bundle through globalThis). */
export function getEmailSender(): EmailSender {
  const holder = globalThis as unknown as Slot; // reason: attaching a private symbol slot
  holder[SLOT] ??= createEmailSender(getEnv());
  return holder[SLOT];
}
