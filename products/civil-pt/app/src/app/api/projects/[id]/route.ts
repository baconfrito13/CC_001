import { handleDeleteProject } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Context) {
  return handleDeleteProject(request, (await params).id);
}
