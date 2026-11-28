import { handleMaintenance } from "@/lib/documents/maintenance";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleMaintenance(request);
}
