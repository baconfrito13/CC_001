import { z } from "zod";
import type { SessionUser } from "@/lib/auth/types";
import { errorCode, type Logger, logger } from "@/lib/core/logger";
import { problem, zodErrors } from "@/lib/core/problem";
import { isSameOrigin, readJsonBody } from "@/lib/http";
import { parseScaleRatio } from "@/lib/scale";
import { toPublicDocument, toPublicSheet } from "./dto";
import type { DocumentsService } from "./service";

/**
 * Request handlers of the project, upload and scale routes (docs/04-architecture.md section 6).
 * Each one: same origin for writes (403), a signed-in user (401), a validated body (400), the
 * service, and a small JSON answer. A row that is not the caller's is a 404, the same as one
 * that does not exist. The routes in src/app/api only forward here.
 */

export interface WorkspaceHandlerDeps {
  documents: () => Promise<DocumentsService>;
  user: (request: Request) => Promise<SessionUser | null>;
  log: Logger;
}

async function defaultDeps(): Promise<WorkspaceHandlerDeps> {
  // Imported here so tests of the handlers never load the server-only modules.
  const [{ getDocumentsService }, { userFromRequest }] = await Promise.all([
    import("./context"),
    import("@/lib/auth"),
  ]);
  return { documents: getDocumentsService, user: userFromRequest, log: logger };
}

const BODY_LIMIT = 4_000;

/** SR-12 / T-14 in one place: 403 for another origin, 401 without a session. */
async function authorize(
  request: Request,
  deps: WorkspaceHandlerDeps,
  options: { write: boolean },
): Promise<{ ok: true; user: SessionUser } | { ok: false; response: Response }> {
  if (options.write && !isSameOrigin(request.headers)) {
    return { ok: false, response: problem(403, "forbidden") };
  }
  const user = await deps.user(request);
  if (!user) return { ok: false, response: problem(401, "unauthorized") };
  return { ok: true, user };
}

const uuid = z.uuid();
const validId = (value: string) => uuid.safeParse(value).success;

async function bodyOf(request: Request) {
  const body = await readJsonBody(request, BODY_LIMIT);
  if (body.ok) return { ok: true as const, data: body.data };
  const code =
    body.status === 413
      ? "payload_too_large"
      : body.status === 415
        ? "unsupported_media_type"
        : "invalid_request";
  return { ok: false as const, response: problem(body.status, code) };
}

const limited = (seconds: number) =>
  problem(429, "rate_limited", { headers: { "Retry-After": String(seconds) } });

const noStore = { "Cache-Control": "no-store" };

function failed(deps: WorkspaceHandlerDeps, route: string, error: unknown): Response {
  deps.log.error("workspace_request_failed", { route, error_code: errorCode(error) });
  return problem(500, "internal");
}

// ---------------------------------------------------------------------------------------

const CreateProjectSchema = z.strictObject({ name: z.string().trim().min(1).max(120) });

/** POST /api/projects */
export async function handleCreateProject(
  request: Request,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  const body = await bodyOf(request);
  if (!body.ok) return body.response;
  const parsed = CreateProjectSchema.safeParse(body.data);
  if (!parsed.success) {
    return problem(400, "invalid_request", { errors: zodErrors(parsed.error) });
  }
  try {
    const result = await (await deps.documents()).createProject({
      userId: auth.user.id,
      name: parsed.data.name,
    });
    if (!result.ok) return limited(result.retryAfterSeconds);
    return Response.json(
      { id: result.project.id, name: result.project.name },
      { status: 201, headers: noStore },
    );
  } catch (error) {
    return failed(deps, "/api/projects", error);
  }
}

/** DELETE /api/projects/:id */
export async function handleDeleteProject(
  request: Request,
  projectId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  if (!validId(projectId)) return problem(404, "not_found");
  try {
    const result = await (await deps.documents()).deleteProject({
      userId: auth.user.id,
      projectId,
    });
    return result.ok
      ? new Response(null, { status: 204, headers: noStore })
      : problem(404, "not_found");
  } catch (error) {
    // The files could not be removed: the project is still there, so the person can try again.
    deps.log.error("project_delete_failed", {
      route: "/api/projects/:id",
      error_code: errorCode(error),
    });
    return problem(503, "service_unavailable");
  }
}

const NewDocumentSchema = z.strictObject({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what is refused
    .refine((name) => !/[\u0000-\u001f\u007f]/.test(name)),
  sizeBytes: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});

const rejection = (reason: "type" | "size" | "pages") =>
  problem(422, "upload_rejected", { extra: { reason } });

/** POST /api/projects/:id/documents: register the upload and get the signed URL. */
export async function handleRegisterUpload(
  request: Request,
  projectId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  if (!validId(projectId)) return problem(404, "not_found");
  const body = await bodyOf(request);
  if (!body.ok) return body.response;
  const parsed = NewDocumentSchema.safeParse(body.data);
  if (!parsed.success) {
    return problem(400, "invalid_request", { errors: zodErrors(parsed.error) });
  }
  try {
    const result = await (await deps.documents()).registerUpload({
      userId: auth.user.id,
      projectId,
      ...parsed.data,
    });
    if (result.ok) {
      return Response.json(
        {
          documentId: result.documentId,
          uploadUrl: result.uploadUrl,
          finalizeBy: result.finalizeBy.toISOString(),
        },
        { status: 201, headers: noStore },
      );
    }
    if (result.reason === "rate_limited") return limited(result.retryAfterSeconds);
    if (result.reason === "rejected") return rejection(result.rejection);
    return problem(404, "not_found");
  } catch (error) {
    return failed(deps, "/api/projects/:id/documents", error);
  }
}

/** POST /api/documents/:id/finalize: check the uploaded file and create the sheets. */
export async function handleFinalize(
  request: Request,
  documentId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  if (!validId(documentId)) return problem(404, "not_found");
  try {
    const result = await (await deps.documents()).finalizeUpload({
      userId: auth.user.id,
      documentId,
    });
    if (result.ok) {
      return Response.json(
        { document: toPublicDocument(result.document) },
        { headers: noStore },
      );
    }
    if (result.reason === "rate_limited") return limited(result.retryAfterSeconds);
    if (result.reason === "rejected") {
      return result.rejection === "interrupted"
        ? problem(409, "upload_interrupted")
        : rejection(result.rejection);
    }
    return problem(404, "not_found");
  } catch (error) {
    return failed(deps, "/api/documents/:id/finalize", error);
  }
}

/** POST /api/documents/:id/abort: the browser lost the upload; drop what arrived. */
export async function handleAbort(
  request: Request,
  documentId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  if (!validId(documentId)) return problem(404, "not_found");
  try {
    await (await deps.documents()).abortUpload({ userId: auth.user.id, documentId });
    return new Response(null, { status: 204, headers: noStore });
  } catch (error) {
    return failed(deps, "/api/documents/:id/abort", error);
  }
}

/** GET /api/documents/:id/url: a short-lived download URL for the viewer and thumbnails. */
export async function handleDownloadUrl(
  request: Request,
  documentId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: false });
  if (!auth.ok) return auth.response;
  if (!validId(documentId)) return problem(404, "not_found");
  try {
    const result = await (await deps.documents()).downloadUrl({
      userId: auth.user.id,
      documentId,
    });
    if (result.ok) {
      return Response.json(
        { url: result.url, expiresAt: result.expiresAt.toISOString() },
        { headers: noStore },
      );
    }
    return result.reason === "rate_limited"
      ? limited(result.retryAfterSeconds)
      : problem(404, "not_found");
  } catch (error) {
    return failed(deps, "/api/documents/:id/url", error);
  }
}

const ScaleBodySchema = z.strictObject({ ratio: z.unknown() });

/** PUT /api/sheets/:id/scale (US-03). */
export async function handleSetScale(
  request: Request,
  sheetId: string,
  overrides: Partial<WorkspaceHandlerDeps> = {},
): Promise<Response> {
  const deps = { ...(await defaultDeps()), ...overrides };
  const auth = await authorize(request, deps, { write: true });
  if (!auth.ok) return auth.response;
  if (!validId(sheetId)) return problem(404, "not_found");
  const body = await bodyOf(request);
  if (!body.ok) return body.response;
  const parsed = ScaleBodySchema.safeParse(body.data);
  const ratio = parsed.success ? parseScaleRatio(parsed.data.ratio) : null;
  if (ratio === null) {
    return problem(400, "invalid_request", {
      errors: [{ path: "ratio", message: "must be a whole number from 1 to 10000" }],
    });
  }
  try {
    const result = await (await deps.documents()).setScale({
      userId: auth.user.id,
      sheetId,
      ratio,
    });
    if (result.ok) {
      return Response.json({ sheet: toPublicSheet(result.sheet) }, { headers: noStore });
    }
    return result.reason === "rate_limited"
      ? limited(result.retryAfterSeconds)
      : problem(404, "not_found");
  } catch (error) {
    return failed(deps, "/api/sheets/:id/scale", error);
  }
}
