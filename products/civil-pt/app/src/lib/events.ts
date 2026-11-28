import { z } from "zod";

/**
 * Product events emitted by the server (docs/02-product.md section 9).
 *
 * The dictionary is the contract: every event has a fixed, strict set of properties and none
 * can carry personal data (SR-09): no email, no project or file name, no free text. An event
 * with an unknown property or a value of the wrong shape is rejected, not logged. The browser
 * analytics (PostHog, after consent) is separate; these are the events that only the server
 * can know, so they work without consent and identify nobody.
 */

const locale = z.enum(["en", "pt"]);
/** A file extension, lower case, at most 10 letters or digits ("pdf", "dwg", ""). */
const extension = z.string().regex(/^[a-z0-9]{0,10}$/);

export const EVENT_DICTIONARY = {
  signup_started: z.strictObject({ locale }),
  signup_completed: z.strictObject({ method: z.enum(["code", "link"]), locale }),
  project_created: z.strictObject({ projects_total: z.number().int().nonnegative() }),
  project_deleted: z.strictObject({}),
  sheet_uploaded: z.strictObject({
    pages: z.number().int().positive(),
    size_mb: z.number().nonnegative(),
  }),
  upload_rejected: z.strictObject({
    reason: z.enum(["type", "size", "pages", "interrupted"]),
    extension,
  }),
  scale_set: z.strictObject({
    source: z.enum(["detected", "manual"]),
    ratio: z.number().int().min(1).max(10_000),
  }),
} as const;

export type EventName = keyof typeof EVENT_DICTIONARY;
export type EventProps<N extends EventName> = z.input<(typeof EVENT_DICTIONARY)[N]>;

export interface RecordedEvent {
  name: EventName;
  props: Record<string, string | number | boolean>;
  at: Date;
}

export interface EventSink {
  record(event: RecordedEvent): void;
}

/** One JSON line per event on stdout: the hosting provider's log is the store for now. */
export function logEventSink(print: (line: string) => void = console.log): EventSink {
  return {
    record(event) {
      print(
        JSON.stringify({
          level: "info",
          ts: event.at.toISOString(),
          msg: "event",
          event: event.name,
          ...event.props,
        }),
      );
    },
  };
}

/** Keeps the last events in memory, for tests and the development inspector. */
export class MemoryEventSink implements EventSink {
  readonly events: RecordedEvent[] = [];

  constructor(private readonly limit = 200) {}

  record(event: RecordedEvent): void {
    this.events.push(event);
    if (this.events.length > this.limit) this.events.shift();
  }

  named(name: EventName): RecordedEvent[] {
    return this.events.filter((event) => event.name === name);
  }
}

export interface Tracker {
  track<N extends EventName>(name: N, props: EventProps<N>): void;
}

/**
 * The validating front of the sinks. A bad event is a programming error: it is dropped (a
 * product event must never break the request that raised it) and reported to `onInvalid`.
 */
export function createTracker(
  sinks: readonly EventSink[],
  options: { now?: () => Date; onInvalid?: (name: string) => void } = {},
): Tracker {
  const now = options.now ?? (() => new Date());
  return {
    track(name, props) {
      const parsed = EVENT_DICTIONARY[name].safeParse(props);
      if (!parsed.success) {
        options.onInvalid?.(name);
        return;
      }
      const event: RecordedEvent = { name, props: parsed.data, at: now() };
      for (const sink of sinks) sink.record(event);
    },
  };
}

const SLOT = Symbol.for("rastoplan.events");
type Slot = { [SLOT]?: { tracker: Tracker; memory: MemoryEventSink } };

/** The process-wide tracker (shared by every route bundle through globalThis). */
export function getEvents(): { tracker: Tracker; memory: MemoryEventSink } {
  const holder = globalThis as unknown as Slot; // reason: attaching a private symbol slot
  if (!holder[SLOT]) {
    const memory = new MemoryEventSink();
    holder[SLOT] = {
      memory,
      tracker: createTracker([logEventSink(), memory], {
        onInvalid: (name) =>
          console.error(
            JSON.stringify({ level: "error", msg: "event_invalid", event: name }),
          ),
      }),
    };
  }
  return holder[SLOT];
}
