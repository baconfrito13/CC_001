import { problem } from "@/lib/core/problem";
import { devRoutesEnabled } from "@/lib/dev";
import { getEnv } from "@/lib/env";
import { getObjectStorage } from "@/lib/storage";
import { MemoryObjectStorage } from "@/lib/storage/memory";
import { assertObjectPath } from "@/lib/storage/paths";
import { BUCKETS, type Bucket } from "@/lib/storage/types";

export const dynamic = "force-dynamic";

/**
 * The stand-in for Supabase Storage in test mode: the signed URLs of the memory adapter point
 * here. It checks the signature, the operation and the expiry exactly like the real service
 * checks its token, and only exists while every test adapter is active (see src/lib/dev.ts).
 */
type Context = { params: Promise<{ bucket: string; path: string[] }> };

async function resolve(
  request: Request,
  params: Context["params"],
  operation: "upload" | "download",
) {
  const env = getEnv();
  if (!devRoutesEnabled(env)) return { response: problem(404, "not_found") } as const;
  const storage = await getObjectStorage();
  if (!(storage instanceof MemoryObjectStorage))
    return { response: problem(404, "not_found") } as const;

  const { bucket, path: segments } = await params;
  const path = segments.map(decodeURIComponent).join("/");
  const url = new URL(request.url);
  const valid =
    (BUCKETS as readonly string[]).includes(bucket) &&
    storage.verifySignedUrl({
      operation,
      bucket: bucket as Bucket, // reason: checked against BUCKETS just above
      path,
      exp: Number(url.searchParams.get("exp")),
      sig: url.searchParams.get("sig") ?? "",
      now: new Date(),
    });
  if (!valid) return { response: problem(403, "forbidden") } as const;
  try {
    assertObjectPath(path);
  } catch {
    return { response: problem(400, "invalid_request") } as const;
  }
  return { storage, bucket: bucket as Bucket, path, env } as const; // reason: checked above
}

export async function GET(request: Request, { params }: Context) {
  const resolved = await resolve(request, params, "download");
  if ("response" in resolved) return resolved.response;
  const body = await resolved.storage.get({
    bucket: resolved.bucket,
    path: resolved.path,
  });
  if (!body) return problem(404, "not_found");
  return new Response(body.slice().buffer, {
    headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
  });
}

/** What the browser sends: multipart like the Supabase client, or the raw file. */
async function readUpload(request: Request): Promise<Uint8Array | null> {
  const type = request.headers.get("content-type") ?? "";
  if (type.toLowerCase().startsWith("multipart/form-data")) {
    const form = await request.formData();
    for (const value of form.values()) {
      if (typeof value !== "string") return new Uint8Array(await value.arrayBuffer());
    }
    return null;
  }
  return new Uint8Array(await request.arrayBuffer());
}

export async function PUT(request: Request, { params }: Context) {
  const resolved = await resolve(request, params, "upload");
  if ("response" in resolved) return resolved.response;
  // The bucket limit of the real service (50 MB), with a little room for the multipart framing.
  const limit = (resolved.env.MAX_PDF_MB + 1) * 1024 * 1024;
  if (Number(request.headers.get("content-length") ?? 0) > limit) {
    return problem(413, "payload_too_large");
  }
  const body = await readUpload(request);
  if (!body || body.byteLength === 0) return problem(400, "invalid_request");
  if (body.byteLength > limit) return problem(413, "payload_too_large");
  // Like `x-upsert: false`: an object is written once.
  if (resolved.storage.has(resolved.bucket, resolved.path))
    return problem(409, "conflict");
  await resolved.storage.put({
    bucket: resolved.bucket,
    path: resolved.path,
    body,
    contentType: "application/pdf",
  });
  return Response.json({ Key: `${resolved.bucket}/${resolved.path}` });
}
