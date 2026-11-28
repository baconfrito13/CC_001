import { problem } from "@/lib/core/problem";
import { devRoutesEnabled } from "@/lib/dev";
import { getEnv } from "@/lib/env";
import { getEvents } from "@/lib/events";
import { getObjectStorage } from "@/lib/storage";
import { MemoryObjectStorage } from "@/lib/storage/memory";

export const dynamic = "force-dynamic";

/**
 * Test mode only (see src/lib/dev.ts): what the server holds that a browser cannot see, so the
 * e2e tests can prove "nothing stays stored" and "the event was recorded". The events carry no
 * personal data by construction (src/lib/events.ts).
 */
export async function GET() {
  if (!devRoutesEnabled(getEnv())) return problem(404, "not_found");
  const storage = await getObjectStorage();
  if (!(storage instanceof MemoryObjectStorage)) return problem(404, "not_found");
  return Response.json(
    {
      objects: { uploads: storage.count("uploads"), geometry: storage.count("geometry") },
      events: getEvents().memory.events.map((event) => ({
        name: event.name,
        props: event.props,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
