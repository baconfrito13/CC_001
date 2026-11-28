/**
 * Private file storage (docs/04-architecture.md sections 5.3 and 5.4): the customer's PDFs
 * (`uploads`) and the geometry packages the processor derives from them (`geometry`).
 *
 * Both buckets are private. The app talks to them with the service role, on behalf of a user
 * it has already authorised; a browser only ever gets a short-lived signed URL.
 */

export const BUCKETS = ["uploads", "geometry"] as const;
export type Bucket = (typeof BUCKETS)[number];

/** SR-11: a download URL is valid for at most 10 minutes. */
export const MAX_SIGNED_URL_SECONDS = 600;

export interface SignedUrl {
  url: string;
  expiresAt: Date;
}

/**
 * A URL the browser sends the PDF to with a PUT (multipart, the way the Supabase storage
 * client does), so the file never passes through the application (US-02 criterion 1). The
 * memory adapter keeps it valid for 10 minutes. Supabase fixes the validity of its signed
 * upload URLs at 2 hours and offers no way to shorten it: the application therefore refuses to
 * finalize a document older than 10 minutes and removes its object (SR-11).
 */
export type SignedUploadUrl = SignedUrl;

/** Why an upload was refused: the `reason` of the `upload_rejected` event (PRD section 9). */
export type UploadRejectReason = "type" | "size" | "pages" | "interrupted";

/** SR-11: a document must be finalized within 10 minutes of its upload URL being issued. */
export const FINALIZE_WINDOW_SECONDS = 600;

export interface ObjectStorage {
  readonly name: "memory" | "supabase";
  put(input: {
    bucket: Bucket;
    path: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<void>;
  /** The file, or null when it does not exist. */
  get(input: { bucket: Bucket; path: string }): Promise<Uint8Array | null>;
  remove(input: { bucket: Bucket; paths: string[] }): Promise<void>;
  /** Delete every file under `prefix` (e.g. `<user>/<project>/`); returns how many. */
  removePrefix(input: { bucket: Bucket; prefix: string }): Promise<number>;
  /** A URL a browser can upload ONE new object to (no overwrite). */
  createSignedUploadUrl(input: {
    bucket: Bucket;
    path: string;
    now: Date;
  }): Promise<SignedUploadUrl>;
  /** A URL a browser can download from, valid for `expiresInSeconds` (at most 600). */
  createSignedDownloadUrl(input: {
    bucket: Bucket;
    path: string;
    expiresInSeconds: number;
    now: Date;
  }): Promise<SignedUrl>;
}

/** A failed storage call. Carries a code only: paths contain user and project ids. */
export class StorageError extends Error {
  constructor(
    public readonly operation: string,
    public readonly code: string,
  ) {
    super(`storage ${operation} failed (${code})`);
    this.name = "StorageError";
  }
}

export function assertSignedUrlTtl(expiresInSeconds: number): void {
  if (
    !Number.isInteger(expiresInSeconds) ||
    expiresInSeconds < 1 ||
    expiresInSeconds > MAX_SIGNED_URL_SECONDS
  ) {
    throw new RangeError(`signed URLs last 1 to ${MAX_SIGNED_URL_SECONDS} seconds`);
  }
}
