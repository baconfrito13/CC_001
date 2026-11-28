/**
 * Structured JSON logs, one line per event, with an allow-list of fields (SR-09).
 *
 * Anything not on the list is dropped, so an email, a project name, a file name or text read
 * from a PDF can never reach stdout (Vercel logs, Sentry breadcrumbs) by accident. Callers pass
 * a static event name as `msg` and identifiers as fields; for users use `user_ref` (a keyed
 * hash, see `hmacRef`), never the id or the email.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export const LOG_FIELDS = [
  "route",
  "request_id",
  "user_ref",
  "duration_ms",
  "sheet_id",
  "error_code",
  "status",
  "adapter",
  "check",
  "count",
] as const;

export type LogField = (typeof LOG_FIELDS)[number];
export type LogFields = Partial<Record<LogField, string | number | boolean | null>>;

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
}

export type LogSink = (level: LogLevel, line: string) => void;

const allowed = new Set<string>(LOG_FIELDS);
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

function redact(value: unknown): unknown {
  return typeof value === "string" ? value.replace(EMAIL, "[redacted]") : value;
}

const consoleSink: LogSink = (level, line) => {
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export function createLogger(
  sink: LogSink = consoleSink,
  now: () => Date = () => new Date(),
): Logger {
  const write = (level: LogLevel, msg: string, fields: LogFields = {}) => {
    const entry: Record<string, unknown> = {
      level,
      ts: now().toISOString(),
      msg: redact(msg),
    };
    // `fields` is typed, but callers may spread untyped objects: filter at runtime too.
    for (const [key, value] of Object.entries(fields)) {
      if (allowed.has(key) && value !== undefined) entry[key] = redact(value);
    }
    sink(level, JSON.stringify(entry));
  };
  return {
    debug: (msg, fields) => write("debug", msg, fields),
    info: (msg, fields) => write("info", msg, fields),
    warn: (msg, fields) => write("warn", msg, fields),
    error: (msg, fields) => write("error", msg, fields),
  };
}

/**
 * The only thing worth logging about a caught error: a short stable code. The message of a
 * third-party error may contain the very data (an email, a file name) we must not log.
 */
export function errorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && /^[A-Za-z0-9_.:-]{1,64}$/.test(code)) return code;
    const name = (error as { name?: unknown }).name;
    if (typeof name === "string" && /^[A-Za-z0-9_]{1,64}$/.test(name)) return name;
  }
  return "unknown";
}

export const logger = createLogger();
