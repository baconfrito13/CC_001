import { createHmac, timingSafeEqual } from "node:crypto";
import {
  assertSignedUrlTtl,
  type Bucket,
  FINALIZE_WINDOW_SECONDS,
  type ObjectStorage,
  type SignedUploadUrl,
  type SignedUrl,
} from "./types";

/** What a signed URL allows: it is part of the signature, so a download URL cannot upload. */
export type SignedOperation = "download" | "upload";

interface StoredObject {
  body: Uint8Array;
  contentType: string;
}

/**
 * In-memory storage for development and tests. Signed URLs point at a development route
 * (`/api/dev/storage/...`, which exists only while the memory adapters are active) and carry an
 * HMAC signature, the operation they allow and an expiry, like the real ones, so the same
 * rules can be tested.
 */
export class MemoryObjectStorage implements ObjectStorage {
  readonly name = "memory" as const;
  private readonly objects = new Map<string, StoredObject>();

  constructor(private readonly secret: string) {}

  private static key(bucket: Bucket, path: string) {
    return `${bucket}/${path}`;
  }

  async put(input: {
    bucket: Bucket;
    path: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<void> {
    this.objects.set(MemoryObjectStorage.key(input.bucket, input.path), {
      body: input.body.slice(),
      contentType: input.contentType,
    });
  }

  async get(input: { bucket: Bucket; path: string }): Promise<Uint8Array | null> {
    return (
      this.objects.get(MemoryObjectStorage.key(input.bucket, input.path))?.body.slice() ??
      null
    );
  }

  async remove(input: { bucket: Bucket; paths: string[] }): Promise<void> {
    for (const path of input.paths) {
      this.objects.delete(MemoryObjectStorage.key(input.bucket, path));
    }
  }

  async removePrefix(input: { bucket: Bucket; prefix: string }): Promise<number> {
    const start = MemoryObjectStorage.key(input.bucket, input.prefix);
    let removed = 0;
    for (const key of [...this.objects.keys()]) {
      if (key.startsWith(start)) {
        this.objects.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  /** Test helper: how many objects does a bucket hold? */
  count(bucket: Bucket): number {
    return [...this.objects.keys()].filter((key) => key.startsWith(`${bucket}/`)).length;
  }

  private sign(
    operation: SignedOperation,
    bucket: Bucket,
    path: string,
    expiresAtSeconds: number,
  ): string {
    return createHmac("sha256", this.secret)
      .update(`${operation}\n${bucket}\n${path}\n${expiresAtSeconds}`)
      .digest("hex");
  }

  /** Does the object exist? (Test helper and the development route.) */
  has(bucket: Bucket, path: string): boolean {
    return this.objects.has(MemoryObjectStorage.key(bucket, path));
  }

  async createSignedUploadUrl(input: {
    bucket: Bucket;
    path: string;
    now: Date;
  }): Promise<SignedUploadUrl> {
    const exp = Math.floor(input.now.getTime() / 1000) + FINALIZE_WINDOW_SECONDS;
    const sig = this.sign("upload", input.bucket, input.path, exp);
    return {
      url: `/api/dev/storage/${input.bucket}/${input.path}?exp=${exp}&sig=${sig}&op=upload`,
      expiresAt: new Date(exp * 1000),
    };
  }

  async createSignedDownloadUrl(input: {
    bucket: Bucket;
    path: string;
    expiresInSeconds: number;
    now: Date;
  }): Promise<SignedUrl> {
    assertSignedUrlTtl(input.expiresInSeconds);
    const exp = Math.floor(input.now.getTime() / 1000) + input.expiresInSeconds;
    const sig = this.sign("download", input.bucket, input.path, exp);
    return {
      url: `/api/dev/storage/${input.bucket}/${input.path}?exp=${exp}&sig=${sig}&op=download`,
      expiresAt: new Date(exp * 1000),
    };
  }

  /** What the development route calls: is this URL still valid, and for this exact file? */
  verifySignedUrl(input: {
    operation?: SignedOperation;
    bucket: Bucket;
    path: string;
    exp: number;
    sig: string;
    now: Date;
  }): boolean {
    if (!Number.isInteger(input.exp) || input.exp * 1000 <= input.now.getTime())
      return false;
    const expected = Buffer.from(
      this.sign(input.operation ?? "download", input.bucket, input.path, input.exp),
      "hex",
    );
    const given = Buffer.from(input.sig, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  }
}
