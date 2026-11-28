import { MockAuthProvider } from "@/lib/auth/mock";
import { type AuthService, createAuthService } from "@/lib/auth/service";
import type { AuthRequest } from "@/lib/auth/types";
import { createLogger } from "@/lib/core/logger";
import { MemoryDataStore } from "@/lib/data/memory";
import { ConsoleEmailSender } from "@/lib/email/console";
import { createTracker, MemoryEventSink } from "@/lib/events";

export const T0 = new Date("2026-03-01T10:00:00.000Z");
export const SECRET = "test-session-secret-0123456789";
export const SALT = "test-hash-salt-0123456789abcdef";

/**
 * A complete sign-in with the in-memory adapters and a clock the test moves: the same classes
 * the server uses in test mode, nothing mocked.
 */
export function authWorld(start: Date = T0) {
  let clock = start;
  const store = new MemoryDataStore();
  const email = new ConsoleEmailSender(() => {});
  const provider = new MockAuthProvider({
    store,
    email,
    secret: SECRET,
    trial: { sheets: 5, days: 14 },
  });
  const events = new MemoryEventSink();
  const service: AuthService = createAuthService({
    provider,
    store,
    events: createTracker([events], { now: () => clock }),
    log: createLogger(() => {}),
    now: () => clock,
    salt: SALT,
  });
  const request: AuthRequest = { cookies: [], secure: false };
  return {
    store,
    email,
    provider,
    service,
    events,
    request,
    get now() {
      return clock;
    },
    advance(ms: number) {
      clock = new Date(clock.getTime() + ms);
    },
  };
}

export type AuthWorld = ReturnType<typeof authWorld>;

/** The 6-digit code and the token of the link in the last email to `to`. */
export function lastLogin(world: AuthWorld, to: string) {
  const message = world.email.lastTo(to);
  if (!message) throw new Error(`no email to ${to}`);
  const code = /^\s{4}(\d{6})$/m.exec(message.text)?.[1];
  const link = /https?:\/\/\S+\/auth\/confirm\?\S+/.exec(message.text)?.[0];
  const token = /token_hash=([a-f0-9]{64})/.exec(link ?? "")?.[1];
  if (!code || !link || !token) throw new Error("the email has no code or link");
  return { code, link, token, message };
}

/** A code that is certainly not `code`. */
export const wrongCode = (code: string) => (code === "000000" ? "111111" : "000000");
