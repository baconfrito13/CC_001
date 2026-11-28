import { handleCreateProject } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleCreateProject(request);
}
