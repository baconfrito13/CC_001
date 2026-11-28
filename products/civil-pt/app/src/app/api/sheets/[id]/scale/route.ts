import { handleSetScale } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  return handleSetScale(request, (await params).id);
}
