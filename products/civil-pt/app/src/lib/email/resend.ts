import { EmailError, type EmailMessage, type EmailSender } from "./types";

/** The slice of the Resend SDK the adapter uses; a fake satisfies it in tests. */
export interface ResendEmailsClient {
  emails: {
    send(payload: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
    }): Promise<{ error: { name?: string; message: string } | null }>;
  };
}

export function createResendSender(options: {
  apiKey: string;
  from: string;
  createClient?: (apiKey: string) => Promise<ResendEmailsClient> | ResendEmailsClient;
}): EmailSender {
  const createClient =
    options.createClient ??
    (async (apiKey: string) => {
      const { Resend } = await import("resend");
      return new Resend(apiKey) as unknown as ResendEmailsClient; // reason: structural slice of the SDK
    });

  return {
    name: "resend",
    async send(message: EmailMessage) {
      const client = await createClient(options.apiKey);
      const { error } = await client.emails.send({
        from: options.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      });
      // The error message may quote the recipient: keep the error name only.
      if (error) throw new EmailError(error.name ?? "resend_error");
    },
  };
}
