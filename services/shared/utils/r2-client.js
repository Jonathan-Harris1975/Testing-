// ============================================================
// ☁️ Cloudflare R2 Client — Phase 4 (ENV-driven, compat-safe)
// ============================================================

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { ENV } from "../../../scripts/envBootstrap.js";
import { log } from "../../../logger.js";

/* ============================================================
   🧠 Client
============================================================ */
export const s3 = new S3Client({
  region: ENV.r2.region || "auto",
  endpoint: ENV.r2.endpoint,
  credentials: {
    accessKeyId: ENV.r2.accessKeyId,
    secretAccessKey: ENV.r2.secretAccessKey,
  },
});

/* ============================================================
   🪣 Buckets + Public URLs (authoritative)
============================================================ */
export const R2_BUCKETS = ENV.r2.buckets;
export const R2_PUBLIC_URLS = ENV.r2.publicBase;

/* ============================================================
   🔁 Phase-3 / Legacy compatibility exports (REQUIRED)
============================================================ */
// These are still imported by multiple services
export const R2_BUCKET_RAW_AUDIO = R2_BUCKETS.chunks;
export const R2_BUCKET_RAW_TEXT_KEY = R2_BUCKETS.rawText;
export const R2_BUCKET_PODCAST_KEY = R2_BUCKETS.podcast;

export const R2_PUBLIC_BASE_URL_PODCAST_RESOLVED =
  R2_PUBLIC_URLS.podcast;

export const R2_PUBLIC_BASE_URL_RSS_RESOLVED =
  R2_PUBLIC_URLS.rss;

/* ============================================================
   🧩 Validation
============================================================ */
export function ensureBucketKey(bucketKey) {
  const bucket = R2_BUCKETS[bucketKey];
  if (!bucket) {
    const valid = Object.keys(R2_BUCKETS).join(", ");
    throw new Error(
      `❌ Unknown R2 bucket key '${bucketKey}'. Valid keys: ${valid}`
    );
  }
  return bucket;
}

/* ============================================================
   ⚙️ Upload / Download
============================================================ */
export async function uploadBuffer(
  bucketKey,
  key,
  buffer,
  contentType = "application/octet-stream"
) {
  const Bucket = ensureBucketKey(bucketKey);

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = R2_PUBLIC_URLS[bucketKey];
  if (!base) {
    throw new Error(`❌ No public URL configured for bucket '${bucketKey}'`);
  }

  return `${base}/${encodeURIComponent(key)}`;
}

export async function uploadText(
  bucketKey,
  key,
  text,
  contentType = "text/plain"
) {
  return uploadBuffer(
    bucketKey,
    key,
    Buffer.from(text, "utf-8"),
    contentType
  );
}

export async function getObjectAsText(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);

  const res = await s3.send(
    new GetObjectCommand({ Bucket, Key: key })
  );

  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

/* ============================================================
   🧰 Utilities
============================================================ */
export async function listKeys(bucketKey, prefix = "") {
  const Bucket = ensureBucketKey(bucketKey);
  const { Contents } = await s3.send(
    new ListObjectsV2Command({ Bucket, Prefix: prefix })
  );
  return Contents ? Contents.map((c) => c.Key) : [];
}

export async function deleteObject(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);
  await s3.send(
    new DeleteObjectCommand({ Bucket, Key: key })
  );
  log.info("🗑️ R2 object deleted", { bucket: Bucket, key });
}

/* ============================================================
   🔁 Legacy aliases (DO NOT REMOVE YET)
============================================================ */
export const putObject = uploadBuffer;
export const r2Put = uploadBuffer;

export const putText = uploadText;

export const getObject = getObjectAsText;
export const r2Get = getObjectAsText;

export const putJson = async (bucketKey, key, obj) =>
  uploadText(
    bucketKey,
    key,
    JSON.stringify(obj, null, 2),
    "application/json"
  );

export function buildPublicUrl(bucketKey, key) {
  const base = R2_PUBLIC_URLS[bucketKey];
  if (!base) {
    throw new Error(`❌ No public URL configured for ${bucketKey}`);
  }
  return `${base}/${encodeURIComponent(key)}`;
}

/* ============================================================
   🧾 Startup Log (debug only)
============================================================ */
log.debug("r2-client.initialized", {
  endpoint: ENV.r2.endpoint,
  region: ENV.r2.region,
  buckets: Object.keys(R2_BUCKETS),
});

/* ============================================================
   📦 Default Export (legacy-friendly)
============================================================ */
export default {
  s3,
  R2_BUCKETS,
  R2_PUBLIC_URLS,

  // Phase-3 exports
  R2_BUCKET_RAW_AUDIO,
  R2_BUCKET_RAW_TEXT_KEY,
  R2_BUCKET_PODCAST_KEY,
  R2_PUBLIC_BASE_URL_PODCAST_RESOLVED,
  R2_PUBLIC_BASE_URL_RSS_RESOLVED,

  // Core API
  uploadBuffer,
  uploadText,
  getObjectAsText,
  listKeys,
  deleteObject,

  // Legacy API
  putObject,
  putText,
  putJson,
  buildPublicUrl,
  getObject,
  r2Put,
  r2Get,
};
