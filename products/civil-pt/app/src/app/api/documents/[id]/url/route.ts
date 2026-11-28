import { handleDownloadUrl } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  return handleDownloadUrl(request, (await params).id);
}
