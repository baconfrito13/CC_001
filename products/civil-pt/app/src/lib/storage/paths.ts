import { z } from "zod";

/**
 * Object paths are built only from ids the server generated, never from what the user typed
 * (a file name can contain `..`, a slash or a project name). The first folder is the owner's
 * id: the storage policies of the migration compare it with `auth.uid()`.
 */

const id = z.uuid();
const OBJECT_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|json)$/;

const extensionOf = { pdf: "pdf", geometry: "json" } as const;

export function objectPath(input: {
  userId: string;
  projectId: string;
  objectId: string;
  kind: keyof typeof extensionOf;
}): string {
  const userId = id.parse(input.userId);
  const projectId = id.parse(input.projectId);
  const objectId = id.parse(input.objectId);
  return `${userId}/${projectId}/${objectId}.${extensionOf[input.kind]}`;
}

/** The folder that holds every file of a project: what deleting the project removes. */
export function projectPrefix(userId: string, projectId: string): string {
  return `${id.parse(userId)}/${id.parse(projectId)}/`;
}

/** Throws unless `path` is exactly `<user>/<project>/<object>.<pdf|json>` with uuids. */
export function assertObjectPath(path: string): void {
  if (!OBJECT_PATH.test(path) || !path.split("/").every((part) => part.length > 0)) {
    throw new RangeError("invalid object path");
  }
  for (const part of path.replace(/\.(pdf|json)$/, "").split("/")) id.parse(part);
}

/** True when the path lives under the user's own folder. */
export function belongsTo(userId: string, path: string): boolean {
  return path.startsWith(`${id.parse(userId)}/`);
}
