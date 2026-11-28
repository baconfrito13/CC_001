import { createHmac } from "node:crypto";

/**
 * Keyed hash used wherever a stable pseudonym is needed without storing the raw value: the
 * `user_ref` of log lines, the `email_hash` of `auth_attempts`, the IP hash of rate limits.
 * Truncated to `length` hex characters (default 16 = 64 bits, plenty to correlate log lines).
 */
export function hmacRef(value: string, salt: string, length = 16): string {
  return createHmac("sha256", salt).update(value, "utf8").digest("hex").slice(0, length);
}
