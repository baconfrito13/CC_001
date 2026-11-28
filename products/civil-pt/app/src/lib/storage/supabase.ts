import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assertSignedUrlTtl,
  type Bucket,
  type ObjectStorage,
  type SignedUploadUrl,
  type SignedUrl,
  StorageError,
} from "./types";

type StorageFailure = { message: string; statusCode?: string } | null;

/** The slice of a Supabase Storage bucket the adapter uses; a fake satisfies it in tests. */
export interface StorageBucketLike {
  upload(
    path: string,
    body: Uint8Array,
    options: { contentType: string; upsert: boolean },
  ): PromiseLike<{ error: StorageFailure }>;
  download(path: string): PromiseLike<{ data: Blob | null; error: StorageFailure }>;
  remove(paths: string[]): PromiseLike<{ error: StorageFailure }>;
  list(
    path: string,
    options: { limit: number; offset: number },
  ): PromiseLike<{ data: { name: string }[] | null; error: StorageFailure }>;
  createSignedUrl(
    path: string,
    expiresIn: number,
  ): PromiseLike<{ data: { signedUrl: string } | null; error: StorageFailure }>;
  createSignedUploadUrl(
    path: string,
  ): PromiseLike<{ data: { signedUrl: string } | null; error: StorageFailure }>;
}

/** Supabase signed upload URLs last 2 hours and the duration cannot be changed (storage-js docs). */
const SUPABASE_UPLOAD_URL_SECONDS = 7200;

export interface StorageClientLike {
  storage: { from(bucket: string): StorageBucketLike };
}

const LIST_PAGE = 100;

function fail(operation: string, error: NonNullable<StorageFailure>): never {
  throw new StorageError(operation, error.statusCode ?? "storage_error");
}

export function createSupabaseStorage(client: StorageClientLike): ObjectStorage {
  const bucketOf = (bucket: Bucket) => client.storage.from(bucket);

  return {
    name: "supabase",
    async put({ bucket, path, body, contentType }) {
      const { error } = await bucketOf(bucket).upload(path, body, {
        contentType,
        upsert: false,
      });
      if (error) fail("put", error);
    },
    async get({ bucket, path }) {
      const { data, error } = await bucketOf(bucket).download(path);
      if (error) {
        // Supabase answers a missing object with an error: treat "not found" as null.
        if (error.statusCode === "404" || /not found/i.test(error.message)) return null;
        fail("get", error);
      }
      return data ? new Uint8Array(await data.arrayBuffer()) : null;
    },
    async remove({ bucket, paths }) {
      if (paths.length === 0) return;
      const { error } = await bucketOf(bucket).remove(paths);
      if (error) fail("remove", error);
    },
    async removePrefix({ bucket, prefix }) {
      const folder = prefix.replace(/\/+$/, "");
      let removed = 0;
      // Always read the first page again: the previous page was just deleted.
      for (;;) {
        const { data, error } = await bucketOf(bucket).list(folder, {
          limit: LIST_PAGE,
          offset: 0,
        });
        if (error) fail("list", error);
        const names = (data ?? []).map((entry) => `${folder}/${entry.name}`);
        if (names.length === 0) return removed;
        const { error: removeError } = await bucketOf(bucket).remove(names);
        if (removeError) fail("remove", removeError);
        removed += names.length;
      }
    },
    async createSignedUploadUrl({ bucket, path, now }): Promise<SignedUploadUrl> {
      const { data, error } = await bucketOf(bucket).createSignedUploadUrl(path);
      if (error || !data) fail("sign_upload", error ?? { message: "no url" });
      return {
        url: data.signedUrl,
        expiresAt: new Date(now.getTime() + SUPABASE_UPLOAD_URL_SECONDS * 1000),
      };
    },
    async createSignedDownloadUrl({
      bucket,
      path,
      expiresInSeconds,
      now,
    }): Promise<SignedUrl> {
      assertSignedUrlTtl(expiresInSeconds);
      const { data, error } = await bucketOf(bucket).createSignedUrl(
        path,
        expiresInSeconds,
      );
      if (error || !data) fail("sign", error ?? { message: "no url" });
      return {
        url: data.signedUrl,
        expiresAt: new Date(now.getTime() + expiresInSeconds * 1000),
      };
    },
  };
}

export function createSupabaseObjectStorage(options: {
  url: string;
  serviceRoleKey: string;
}): ObjectStorage {
  return createSupabaseStorage(createAdminClient(options));
}
