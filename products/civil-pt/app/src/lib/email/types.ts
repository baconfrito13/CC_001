/**
 * Transactional email (login codes, payment notices). The `console` adapter prints and keeps
 * the message for development and tests; the `resend` adapter sends it. A message carries
 * personal data (the recipient), so nothing here is ever logged by the structured logger.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSender {
  readonly name: "console" | "resend";
  send(message: EmailMessage): Promise<void>;
}

/** A failed send. Carries the provider's error name only, never the recipient or the body. */
export class EmailError extends Error {
  constructor(public readonly code: string) {
    super(`email send failed (${code})`);
    this.name = "EmailError";
  }
}
