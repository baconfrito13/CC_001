import { handleRegisterUpload } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  return handleRegisterUpload(request, (await params).id);
}
