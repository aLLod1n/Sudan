import { promises as fs } from "node:fs";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Photo storage. Development writes to ./uploads and serves files through
 * /api/files/[...key]; production uses Cloudflare R2 (S3-compatible) with a
 * public bucket URL. Select with STORAGE_DRIVER=local|r2.
 */
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  /** Public URL for a stored key. */
  url(key: string): string;
}

// Runtime-only paths: marked turbopackIgnore below so the build does not
// trace (and bundle) the whole project into the server output.
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** Resolves a key inside the upload dir, rejecting path traversal. */
export function resolveLocalPath(key: string): string | null {
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(key) || key.includes("..")) return null;
  const full = path.join(LOCAL_UPLOAD_DIR, key);
  return full.startsWith(LOCAL_UPLOAD_DIR + path.sep) ? full : null;
}

class LocalStorage implements Storage {
  async put(key: string, body: Buffer) {
    const file = resolveLocalPath(key);
    if (!file) throw new Error(`Invalid storage key: ${key}`);
    await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ file, body);
  }

  async read(key: string) {
    const file = resolveLocalPath(key);
    if (!file) throw new Error(`Invalid storage key: ${key}`);
    return fs.readFile(/*turbopackIgnore: true*/ file);
  }

  async delete(key: string) {
    const file = resolveLocalPath(key);
    if (file) await fs.rm(/*turbopackIgnore: true*/ file, { force: true });
  }

  url(key: string) {
    return `/api/files/${key}`;
  }
}

class R2Storage implements Storage {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } =
      process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
      throw new Error("R2 storage selected but R2_* environment variables are missing");
    }
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
    this.bucket = R2_BUCKET;
    this.publicUrl = R2_PUBLIC_URL.replace(/\/$/, "");
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Keys are unique per upload, so files never change.
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  async read(key: string) {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!res.Body) throw new Error(`Empty object: ${key}`);
    return Buffer.from(await res.Body.transformToByteArray());
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  url(key: string) {
    return `${this.publicUrl}/${key}`;
  }
}

let instance: Storage | undefined;

export function getStorage(): Storage {
  instance ??= process.env.STORAGE_DRIVER === "r2" ? new R2Storage() : new LocalStorage();
  return instance;
}

/** Shortcut for rendering: storage key -> public URL. */
export function fileUrl(key: string): string {
  return getStorage().url(key);
}
