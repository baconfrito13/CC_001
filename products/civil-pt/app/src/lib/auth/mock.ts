import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { renderLoginEmail } from "@/emails/login";
import type { MemoryDataStore } from "@/lib/data/memory";
import type { EmailSender } from "@/lib/email/types";
import {
  type AuthProvider,
  type AuthRequest,
  CODE_TTL_SECONDS,
  type CookieToSet,
  type CurrentUser,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type SessionUser,
  type VerifyOutcome,
} from "./types";

/**
 * `AUTH_ADAPTER=mock`: the whole sign-in without an account anywhere (docs/04-architecture.md
 * section 8). It issues real random codes and tokens, sends the real email through the email
 * adapter (`console` in test mode: the code is in the outbox), applies the same expiry and
 * single-use rules as Supabase Auth, and creates the account (and its free trial) the first time
 * a code is used. The server refuses to boot with it in production (T-10).
 *
 * Sessions are a signed value, not a row, so the proxy (which shares no memory with the route
 * handlers) can check them: `<user id>.<expiry>.<hmac>`.
 */

interface IssuedCode {
  code: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
}

export interface MockAuthOptions {
  store: MemoryDataStore;
  email: EmailSender;
  /** Signs the session cookie. */
  secret: string;
  trial: { sheets: number; days: number };
}

const base64url = (buffer: Buffer) => buffer.toString("base64url");

/** `<user id>.<expiry in seconds>.<signature>` */
export function signSession(
  userId: string,
  expiresAtSeconds: number,
  secret: string,
): string {
  const payload = `${userId}.${expiresAtSeconds}`;
  const signature = base64url(createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${signature}`;
}

/**
 * The user id inside a mock session cookie when it is genuine and not expired, else null. Pure
 * and stateless: the proxy calls it too.
 */
export function readSession(
  value: string | undefined,
  secret: string,
  now: Date,
): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, signature] = parts as [string, string, string]; // reason: length checked
  const expiresAt = Number(expiry);
  if (!Number.isInteger(expiresAt) || expiresAt * 1000 <= now.getTime()) return null;
  const expected = Buffer.from(
    signSession(userId, expiresAt, secret).split(".")[2] ?? "",
  );
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return userId;
}

export class MockAuthProvider implements AuthProvider {
  readonly name = "mock" as const;
  private readonly active = new Map<string, IssuedCode>();
  private readonly byToken = new Map<string, string>();

  constructor(private readonly options: MockAuthOptions) {}

  private static key(email: string) {
    return email.trim().toLowerCase();
  }

  async sendCode(input: {
    email: string;
    locale: SessionUser["locale"];
    next: string;
    origin: string;
    now: Date;
  }): Promise<void> {
    const key = MockAuthProvider.key(input.email);
    const previous = this.active.get(key);
    if (previous) this.byToken.delete(previous.tokenHash);

    const issued: IssuedCode = {
      code: String(randomInt(0, 1_000_000)).padStart(6, "0"),
      tokenHash: randomBytes(32).toString("hex"),
      expiresAt: new Date(input.now.getTime() + CODE_TTL_SECONDS * 1000),
      used: false,
    };
    this.active.set(key, issued);
    this.byToken.set(issued.tokenHash, key);

    const link =
      `${input.origin}/${input.locale}/auth/confirm` +
      `?token_hash=${issued.tokenHash}&type=email&next=${encodeURIComponent(input.next)}`;
    const message = renderLoginEmail({ locale: input.locale, code: issued.code, link });
    await this.options.email.send({ to: key, ...message });
  }

  private async finish(
    key: string,
    issued: IssuedCode,
    request: AuthRequest,
    now: Date,
    locale: SessionUser["locale"],
  ) {
    issued.used = true;
    this.byToken.delete(issued.tokenHash);
    let user = this.options.store.directory.findByEmail(key);
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const id = randomUUID();
      this.options.store.addUser(id, { email: key, locale });
      user = { id, email: key, locale, role: "user" };
      await this.options.store.ledger.grantTrial({
        userId: id,
        email: key,
        sheets: this.options.trial.sheets,
        days: this.options.trial.days,
        now,
      });
    }
    const expiresAt = Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS;
    const cookie: CookieToSet = {
      name: SESSION_COOKIE,
      value: signSession(user.id, expiresAt, this.options.secret),
      options: {
        httpOnly: true,
        secure: request.secure,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      },
    };
    const outcome: VerifyOutcome = {
      ok: true,
      user: { id: user.id, email: user.email, locale: user.locale },
      isNewUser,
      cookies: [cookie],
    };
    return outcome;
  }

  async verifyCode(input: {
    email: string;
    code: string;
    locale: SessionUser["locale"];
    now: Date;
    request: AuthRequest;
  }): Promise<VerifyOutcome> {
    const key = MockAuthProvider.key(input.email);
    const issued = this.active.get(key);
    if (!issued || issued.used || issued.expiresAt <= input.now) return { ok: false };
    const given = Buffer.from(input.code);
    const expected = Buffer.from(issued.code);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return { ok: false };
    }
    return this.finish(key, issued, input.request, input.now, input.locale);
  }

  async verifyToken(input: {
    tokenHash: string;
    locale: SessionUser["locale"];
    now: Date;
    request: AuthRequest;
  }): Promise<VerifyOutcome> {
    const key = this.byToken.get(input.tokenHash);
    const issued = key ? this.active.get(key) : undefined;
    if (!key || !issued || issued.used || issued.expiresAt <= input.now)
      return { ok: false };
    return this.finish(key, issued, input.request, input.now, input.locale);
  }

  async rotateCode(input: { email: string; now: Date }): Promise<void> {
    const key = MockAuthProvider.key(input.email);
    const issued = this.active.get(key);
    if (issued) this.byToken.delete(issued.tokenHash);
    this.active.delete(key);
  }

  async currentUser(input: { request: AuthRequest; now: Date }): Promise<CurrentUser> {
    const value = input.request.cookies.find((c) => c.name === SESSION_COOKIE)?.value;
    const userId = readSession(value, this.options.secret, input.now);
    const user = userId ? this.options.store.directory.findById(userId) : undefined;
    return {
      user: user ? { id: user.id, email: user.email, locale: user.locale } : null,
      cookies: [],
    };
  }

  async signOut(input: { request: AuthRequest }): Promise<CookieToSet[]> {
    return [
      {
        name: SESSION_COOKIE,
        value: "",
        options: {
          httpOnly: true,
          secure: input.request.secure,
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        },
      },
    ];
  }
}
