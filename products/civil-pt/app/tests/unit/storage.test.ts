import { describe, expect, it } from "vitest";
import { MemoryObjectStorage } from "@/lib/storage/memory";
import {
  assertObjectPath,
  belongsTo,
  objectPath,
  projectPrefix,
} from "@/lib/storage/paths";
import { createSupabaseStorage, type StorageBucketLike } from "@/lib/storage/supabase";
import { MAX_SIGNED_URL_SECONDS, StorageError } from "@/lib/storage/types";

const USER = "a1000000-0000-4000-8000-000000000001";
const OTHER = "a1000000-0000-4000-8000-000000000002";
const PROJECT = "b1000000-0000-4000-8000-000000000001";
const OBJECT = "c1000000-0000-4000-8000-000000000001";
const NOW = new Date("2026-03-01T10:00:00.000Z");

describe("object paths (SR-01, SR-04)", () => {
  it("are built from server-generated ids only: <user>/<project>/<object>.<ext>", () => {
    expect(
      objectPath({ userId: USER, projectId: PROJECT, objectId: OBJECT, kind: "pdf" }),
    ).toBe(`${USER}/${PROJECT}/${OBJECT}.pdf`);
    expect(
      objectPath({
        userId: USER,
        projectId: PROJECT,
        objectId: OBJECT,
        kind: "geometry",
      }),
    ).toBe(`${USER}/${PROJECT}/${OBJECT}.json`);
    expect(projectPrefix(USER, PROJECT)).toBe(`${USER}/${PROJECT}/`);
  });

  it("refuse anything that is not a uuid, so a file name can never reach a path", () => {
    for (const bad of ["../../etc/passwd", "planta final.pdf", `${USER}/..`, "", "a/b"]) {
      expect(() =>
        objectPath({ userId: USER, projectId: bad, objectId: OBJECT, kind: "pdf" }),
      ).toThrow();
      expect(() => projectPrefix(bad, PROJECT)).toThrow();
    }
  });

  it("assertObjectPath accepts only the exact shape", () => {
    expect(() => assertObjectPath(`${USER}/${PROJECT}/${OBJECT}.pdf`)).not.toThrow();
    for (const bad of [
      `${USER}/${PROJECT}/${OBJECT}.exe`,
      `${USER}/${PROJECT}/../${OBJECT}.pdf`,
      `/${USER}/${PROJECT}/${OBJECT}.pdf`,
      `${USER}/${OBJECT}.pdf`,
      "..",
    ]) {
      expect(() => assertObjectPath(bad), bad).toThrow();
    }
  });

  it("belongsTo checks the owner folder", () => {
    const path = objectPath({
      userId: USER,
      projectId: PROJECT,
      objectId: OBJECT,
      kind: "pdf",
    });
    expect(belongsTo(USER, path)).toBe(true);
    expect(belongsTo(OTHER, path)).toBe(false);
  });
});

describe("memory storage", () => {
  const path = `${USER}/${PROJECT}/${OBJECT}.pdf`;

  it("stores, reads back a copy, and deletes", async () => {
    const storage = new MemoryObjectStorage("secret");
    const body = new Uint8Array([37, 80, 68, 70]);
    await storage.put({ bucket: "uploads", path, body, contentType: "application/pdf" });
    body[0] = 0; // the stored copy is not affected by later changes
    expect(await storage.get({ bucket: "uploads", path })).toEqual(
      new Uint8Array([37, 80, 68, 70]),
    );
    expect(await storage.get({ bucket: "geometry", path })).toBeNull();
    await storage.remove({ bucket: "uploads", paths: [path] });
    expect(await storage.get({ bucket: "uploads", path })).toBeNull();
  });

  it("US-02.5: removePrefix deletes a project's files and nothing else", async () => {
    const storage = new MemoryObjectStorage("secret");
    const put = (p: string) =>
      storage.put({
        bucket: "uploads",
        path: p,
        body: new Uint8Array([1]),
        contentType: "application/pdf",
      });
    const mine = [1, 2, 3].map(
      (n) => `${USER}/${PROJECT}/c100000${n}-0000-4000-8000-000000000001.pdf`,
    );
    const sameUserOtherProject = `${USER}/b1000000-0000-4000-8000-000000000002/${OBJECT}.pdf`;
    const otherUser = `${OTHER}/${PROJECT}/${OBJECT}.pdf`;
    for (const p of [...mine, sameUserOtherProject, otherUser]) await put(p);
    expect(
      await storage.removePrefix({
        bucket: "uploads",
        prefix: projectPrefix(USER, PROJECT),
      }),
    ).toBe(3);
    expect(storage.count("uploads")).toBe(2);
    expect(await storage.get({ bucket: "uploads", path: otherUser })).not.toBeNull();
  });

  it("SR-11: signed URLs last at most 10 minutes and expire", async () => {
    const storage = new MemoryObjectStorage("secret");
    const signed = await storage.createSignedDownloadUrl({
      bucket: "uploads",
      path,
      expiresInSeconds: MAX_SIGNED_URL_SECONDS,
      now: NOW,
    });
    expect(signed.expiresAt).toEqual(new Date(NOW.getTime() + 600_000));
    const url = new URL(signed.url, "http://localhost");
    const query = {
      exp: Number(url.searchParams.get("exp")),
      sig: url.searchParams.get("sig") ?? "",
    };
    const check = (
      over: Partial<{
        bucket: "uploads" | "geometry";
        path: string;
        now: Date;
        sig: string;
      }>,
    ) =>
      storage.verifySignedUrl({ bucket: "uploads", path, ...query, now: NOW, ...over });
    expect(check({})).toBe(true);
    expect(check({ now: new Date(NOW.getTime() + 599_000) })).toBe(true);
    expect(check({ now: new Date(NOW.getTime() + 600_000) })).toBe(false); // expired
    expect(check({ path: `${OTHER}/${PROJECT}/${OBJECT}.pdf` })).toBe(false); // another file
    expect(check({ bucket: "geometry" })).toBe(false); // another bucket
    expect(check({ sig: "00".repeat(32) })).toBe(false); // forged
    expect(check({ sig: "zz" })).toBe(false);
    expect(
      new MemoryObjectStorage("another-secret").verifySignedUrl({
        bucket: "uploads",
        path,
        ...query,
        now: NOW,
      }),
    ).toBe(false);

    for (const bad of [0, 601, 3600, 1.5, Number.NaN]) {
      await expect(
        storage.createSignedDownloadUrl({
          bucket: "uploads",
          path,
          expiresInSeconds: bad,
          now: NOW,
        }),
      ).rejects.toThrow(RangeError);
    }
  });
});

describe("supabase storage adapter", () => {
  function fakeBucket(overrides: Partial<StorageBucketLike> = {}) {
    const calls: { fn: string; args: unknown[] }[] = [];
    const files = new Map<string, Uint8Array>();
    const bucket: StorageBucketLike = {
      async upload(path, body, options) {
        calls.push({ fn: "upload", args: [path, options] });
        files.set(path, body);
        return { error: null };
      },
      async download(path) {
        const file = files.get(path);
        if (!file)
          return {
            data: null,
            error: { message: "Object not found", statusCode: "404" },
          };
        return { data: new Blob([file.slice()]), error: null };
      },
      async remove(paths) {
        calls.push({ fn: "remove", args: [paths] });
        for (const p of paths) files.delete(p);
        return { error: null };
      },
      async list(folder, options) {
        calls.push({ fn: "list", args: [folder, options] });
        const names = [...files.keys()]
          .filter((p) => p.startsWith(`${folder}/`))
          .map((p) => ({ name: p.slice(folder.length + 1) }));
        return { data: names.slice(0, options.limit), error: null };
      },
      async createSignedUrl(path, expiresIn) {
        calls.push({ fn: "sign", args: [path, expiresIn] });
        return {
          data: { signedUrl: `https://x.supabase.co/sign/${path}?token=t` },
          error: null,
        };
      },
      ...overrides,
    };
    const buckets: string[] = [];
    const storage = createSupabaseStorage({
      storage: {
        from(name) {
          buckets.push(name);
          return bucket;
        },
      },
    });
    return { storage, calls, files, buckets };
  }

  const path = `${USER}/${PROJECT}/${OBJECT}.pdf`;

  it("never overwrites: upsert is off, and the bucket is the one asked for", async () => {
    const { storage, calls, buckets } = fakeBucket();
    await storage.put({
      bucket: "uploads",
      path,
      body: new Uint8Array([1]),
      contentType: "application/pdf",
    });
    expect(calls[0]).toEqual({
      fn: "upload",
      args: [path, { contentType: "application/pdf", upsert: false }],
    });
    expect(buckets).toEqual(["uploads"]);
  });

  it("returns null for a missing object and the bytes for an existing one", async () => {
    const { storage } = fakeBucket();
    expect(await storage.get({ bucket: "uploads", path })).toBeNull();
    await storage.put({
      bucket: "uploads",
      path,
      body: new Uint8Array([7, 8]),
      contentType: "application/pdf",
    });
    expect(await storage.get({ bucket: "uploads", path })).toEqual(
      new Uint8Array([7, 8]),
    );
  });

  it("removePrefix lists the folder and removes page by page until it is empty", async () => {
    const { storage, files } = fakeBucket();
    for (let i = 0; i < 250; i += 1)
      files.set(`${USER}/${PROJECT}/f${i}.pdf`, new Uint8Array([1]));
    files.set(`${USER}/other/keep.pdf`, new Uint8Array([1]));
    expect(
      await storage.removePrefix({ bucket: "uploads", prefix: `${USER}/${PROJECT}/` }),
    ).toBe(250);
    expect([...files.keys()]).toEqual([`${USER}/other/keep.pdf`]);
  });

  it("turns provider errors into StorageError without the provider's message", async () => {
    const { storage } = fakeBucket({
      upload: async () => ({
        error: { message: `failed for ${path}`, statusCode: "500" },
      }),
    });
    const error = await storage
      .put({
        bucket: "uploads",
        path,
        body: new Uint8Array([1]),
        contentType: "application/pdf",
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).not.toContain(USER);
    expect(error.code).toBe("500");
  });

  it("SR-11: caps the signed URL lifetime and reports when it ends", async () => {
    const { storage } = fakeBucket();
    const signed = await storage.createSignedDownloadUrl({
      bucket: "geometry",
      path,
      expiresInSeconds: 120,
      now: NOW,
    });
    expect(signed.expiresAt).toEqual(new Date(NOW.getTime() + 120_000));
    await expect(
      storage.createSignedDownloadUrl({
        bucket: "geometry",
        path,
        expiresInSeconds: 3600,
        now: NOW,
      }),
    ).rejects.toThrow(RangeError);
  });
});

describe("storage adapter selection", () => {
  it("defaults to memory and signs its URLs with the configured salt", async () => {
    const { createObjectStorage } = await import("@/lib/storage");
    const { parseEnv } = await import("@/lib/env");
    const storage = await createObjectStorage(parseEnv({ HASH_SALT: "s".repeat(24) }));
    expect(storage.name).toBe("memory");
    const signed = await storage.createSignedDownloadUrl({
      bucket: "uploads",
      path: `${USER}/${PROJECT}/${OBJECT}.pdf`,
      expiresInSeconds: 60,
      now: NOW,
    });
    expect(signed.url).toContain("/api/dev/storage/uploads/");
  });

  it("needs the Supabase variables for the supabase adapter, checked at boot", async () => {
    const { parseEnv } = await import("@/lib/env");
    expect(() => parseEnv({ STORAGE_ADAPTER: "supabase" })).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/,
    );
  });
});
