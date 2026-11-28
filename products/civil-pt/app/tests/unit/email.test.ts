import { describe, expect, it, vi } from "vitest";
import { createEmailSender } from "@/lib/email";
import { ConsoleEmailSender } from "@/lib/email/console";
import { createResendSender } from "@/lib/email/resend";
import { EmailError } from "@/lib/email/types";
import { parseEnv } from "@/lib/env";

const message = { to: "ana@example.pt", subject: "O seu código", text: "Código: 123456" };

describe("console email adapter", () => {
  it("prints the message and keeps it in the outbox for tests", async () => {
    const print = vi.fn();
    const sender = new ConsoleEmailSender(print);
    await sender.send(message);
    expect(print).toHaveBeenCalledWith(expect.stringContaining("Código: 123456"));
    expect(sender.lastTo("ANA@example.pt")).toEqual(message);
    expect(sender.lastTo("other@example.pt")).toBeUndefined();
  });

  it("keeps only the last 100 messages", async () => {
    const sender = new ConsoleEmailSender(() => {});
    for (let i = 0; i < 130; i += 1) await sender.send({ ...message, subject: `m${i}` });
    expect(sender.outbox).toHaveLength(100);
    expect(sender.outbox[0]?.subject).toBe("m30");
  });
});

describe("resend email adapter", () => {
  it("sends from the configured sender with the text and optional html", async () => {
    const send = vi.fn().mockResolvedValue({ error: null });
    const sender = createResendSender({
      apiKey: "re_test",
      from: "Rastoplan <nao-responder@rastoplan.com>",
      createClient: () => ({ emails: { send } }),
    });
    await sender.send({ ...message, html: "<p>Código</p>" });
    expect(send).toHaveBeenCalledWith({
      from: "Rastoplan <nao-responder@rastoplan.com>",
      to: "ana@example.pt",
      subject: "O seu código",
      text: "Código: 123456",
      html: "<p>Código</p>",
    });
  });

  it("surfaces a provider error by its name only, never the recipient or the message", async () => {
    const sender = createResendSender({
      apiKey: "re_test",
      from: "x@y.pt",
      createClient: () => ({
        emails: {
          send: async () => ({
            error: {
              name: "rate_limit_exceeded",
              message: "too many for ana@example.pt",
            },
          }),
        },
      }),
    });
    const error = await sender.send(message).catch((e) => e);
    expect(error).toBeInstanceOf(EmailError);
    expect(error.code).toBe("rate_limit_exceeded");
    expect(error.message).not.toContain("ana@example.pt");
  });
});

describe("email adapter selection", () => {
  it("defaults to the console adapter", () => {
    expect(createEmailSender(parseEnv({})).name).toBe("console");
  });

  it("uses Resend with EMAIL_FROM, or the starter's RESEND_FROM as fallback", () => {
    const base = { EMAIL_ADAPTER: "resend", RESEND_API_KEY: "re_x" };
    expect(createEmailSender(parseEnv({ ...base, EMAIL_FROM: "A <a@b.pt>" })).name).toBe(
      "resend",
    );
    expect(createEmailSender(parseEnv({ ...base, RESEND_FROM: "A <a@b.pt>" })).name).toBe(
      "resend",
    );
  });
});
