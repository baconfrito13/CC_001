import type { EmailMessage, EmailSender } from "./types";

const OUTBOX_LIMIT = 100;

/**
 * Development and test adapter: prints the message and keeps the last 100 in an outbox the
 * tests read (the login code arrives this way). It logs the recipient on purpose, which is
 * why production refuses it (`EMAIL_ADAPTER=console` fails the boot check).
 */
export class ConsoleEmailSender implements EmailSender {
  readonly name = "console" as const;
  readonly outbox: EmailMessage[] = [];

  constructor(private readonly print: (line: string) => void = console.info) {}

  async send(message: EmailMessage): Promise<void> {
    this.outbox.push(message);
    if (this.outbox.length > OUTBOX_LIMIT) this.outbox.shift();
    this.print(
      `[email:console] to=${message.to} subject=${message.subject}\n${message.text}`,
    );
  }

  /** The most recent message to `to`, if any. */
  lastTo(to: string): EmailMessage | undefined {
    return [...this.outbox]
      .reverse()
      .find((m) => m.to.toLowerCase() === to.toLowerCase());
  }
}
