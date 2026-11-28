import { handleFinalize } from "@/lib/documents/handlers";

export const dynamic = "force-dynamic";
// Reading a 50 MB file from storage and opening it takes a few seconds; the default would do,
// but a slow storage response must not cut it short (S-04 sets the same for processing).
export const maxDuration = 60;

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  return handleFinalize(request, (await params).id);
}
