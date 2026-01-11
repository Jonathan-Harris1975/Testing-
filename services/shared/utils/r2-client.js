// ============================================================
// ☁️ Cloudflare R2 Client — Phase 5 (ENV-driven, compat-tolerant)
// ============================================================
//
// Goals:
//   • Single R2 client driven by ENV (no process.env here)
//   • Bucket *keys* (aliases) used across services
//   • Backwards/Phase-3 compatibility: tolerate callers passing
//     real bucket names instead of bucket keys
//   • Provide a couple of legacy exports used by older codepaths
// ============================================================

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

import { ENV } from "../../../scripts/envBootstrap.js";
import { log } from "../../../logger.js";

// ------------------------------------------------------------
// 🧠 Client
// ------------------------------------------------------------
export const s3 = new S3Client({
  region: ENV.r2.region || "auto",
  endpoint: ENV.r2.endpoint,
  credentials: {
    accessKeyId: ENV.r2.accessKeyId,
    secretAccessKey: ENV.r2.secretAccessKey,
  },
});

// ------------------------------------------------------------
// 🪣 Buckets + Public URLs (authoritative)
// ------------------------------------------------------------
const B = ENV.r2.buckets;
const U = ENV.r2.publicBase;

// Canonical bucket-key map (keys -> bucket names)
export const R2_BUCKETS = {
  // Canonical keys (preferred)
  podcast: B.podcast,
  rawText: B.rawText,
  chunks: B.chunks,
  merged: B.merged,
  edited: B.edited,
  meta: B.meta,
  metaSystem: B.metaSystem,
  rss: B.rss,
  podcastRss: B.podcastRss,
  transcripts: B.transcripts,
  art: B.art,

  // Compatibility aliases (older code)
  rawtext: B.rawText,
  "raw-text": B.rawText,
  transcript: B.transcripts,
  transcriptS: B.transcripts, // just in case
  rssfeeds: B.rss,
  "rss-feeds": B.rss,
  "podcast-chunks": B.chunks,
  rawAudio: B.chunks,
  rawaudio: B.chunks,
  "raw-audio": B.chunks,
  editedAudio: B.edited,
  "edited-audio": B.edited,
  metasystem: B.metaSystem,
  metaSystem: B.metaSystem,
};

export const R2_PUBLIC_URLS = {
  // Canonical keys (preferred)
  podcast: U.podcast,
  rawText: U.rawText,
  chunks: U.chunks,
  merged: U.merged,
  edited: U.edited,
  meta: U.meta,
  metaSystem: U.metaSystem,
  rss: U.rss,
  podcastRss: U.podcastRss,
  transcript: U.transcript,
  transcripts: U.transcript,
  art: U.art,

  // Compatibility aliases
  rawtext: U.rawText,
  "raw-text": U.rawText,
  rssfeeds: U.rss,
  "rss-feeds": U.rss,
  "podcast-chunks": U.chunks,
  rawAudio: U.chunks,
  rawaudio: U.chunks,
  "raw-audio": U.chunks,
  editedAudio: U.edited,
  "edited-audio": U.edited,
  metasystem: U.metaSystem,
  metaSystem: U.metaSystem,
};

// ------------------------------------------------------------
// 🔁 Legacy exports used by older services (do not remove yet)
// ------------------------------------------------------------
// These are *bucket keys* (aliases), not bucket names.
export const R2_BUCKET_RAW_AUDIO = "rawAudio";
export const R2_BUCKET_RAW_TEXT_KEY = "rawText";
export const R2_BUCKET_PODCAST_KEY = "podcast";

// RSS base (prefer podcast RSS, fall back to newsletter RSS)
export const R2_PUBLIC_BASE_URL_RSS_RESOLVED = U.podcastRss || U.rss || "";

// ------------------------------------------------------------
// 🧩 Validation
// ------------------------------------------------------------
export function ensureBucketKey(bucketKeyOrName) {
  // Preferred: bucketKey resolves to bucket name
  const bucket = R2_BUCKETS[bucketKeyOrName];
  if (bucket) return bucket;

  // Compat: allow passing a real bucket name (value) directly
  const values = new Set(Object.values(R2_BUCKETS).filter(Boolean));
  if (values.has(bucketKeyOrName)) return bucketKeyOrName;

  const valid = Object.keys(R2_BUCKETS).join(", ");
  throw new Error(
    `❌ Unknown R2 bucket key/name '${bucketKeyOrName}'. Valid keys: ${valid}`
  );
}

function ensurePublicBase(bucketKeyOrName) {
  const base = R2_PUBLIC_URLS[bucketKeyOrName];
  if (base) return base;

  // Compat: if caller passed real bucket name, try to infer the key by value
  const bucketName = ensureBucketKey(bucketKeyOrName);
  const inferredKey =
    Object.entries(R2_BUCKETS).find(([, v]) => v === bucketName)?.[0] || null;

  if (inferredKey && R2_PUBLIC_URLS[inferredKey]) return R2_PUBLIC_URLS[inferredKey];

  throw new Error(
    `❌ No public URL configured for bucket '${bucketKeyOrName}' (bucketName='${bucketName}')`
  );
}

// ------------------------------------------------------------
// ⚙️ Upload / Download
// ------------------------------------------------------------
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

  const base = ensurePublicBase(bucketKey);
  return `${base}/${encodeURIComponent(key)}`;
}

export async function uploadText(
  bucketKey,
  key,
  text,
  contentType = "text/plain"
) {
  return uploadBuffer(bucketKey, key, Buffer.from(text, "utf-8"), contentType);
}

export async function getObjectAsText(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);

  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// ------------------------------------------------------------
// 🧰 Utilities
// ------------------------------------------------------------
export async function listKeys(bucketKey, prefix = "") {
  const Bucket = ensureBucketKey(bucketKey);
  const { Contents } = await s3.send(
    new ListObjectsV2Command({ Bucket, Prefix: prefix })
  );
  return Contents ? Contents.map((c) => c.Key) : [];
}

export async function deleteObject(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);
  await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
  log.info("🗑️ R2 object deleted", { bucket: Bucket, key });
}

// ------------------------------------------------------------
// 🪣 Bucket ensure (best-effort for R2)
// ------------------------------------------------------------
export async function ensureBucket(bucketNameOrKey) {
  const Bucket = ensureBucketKey(bucketNameOrKey);
  try {
    await s3.send(new HeadBucketCommand({ Bucket }));
  } catch (err) {
    // Cloudflare R2 often returns 404 for missing bucket
    await s3.send(new CreateBucketCommand({ Bucket }));
  }
  return Bucket;
}

// ------------------------------------------------------------
// 🔁 Phase-3 / Legacy Compatibility aliases
// ------------------------------------------------------------
export const putObject = uploadBuffer;
export const r2Put = uploadBuffer;
export const putText = uploadText;
export const getObject = getObjectAsText;
export const r2Get = getObjectAsText;

export const putJson = async (bucketKey, key, obj) =>
  uploadText(bucketKey, key, JSON.stringify(obj, null, 2), "application/json");

export function buildPublicUrl(bucketKey, key) {
  const base = ensurePublicBase(bucketKey);
  return `${base}/${encodeURIComponent(key)}`;
}

// ------------------------------------------------------------
// 🧾 Startup Log (debug only)
// ------------------------------------------------------------
log.debug("r2-client.initialized", {
  endpoint: ENV.r2.endpoint,
  region: ENV.r2.region,
  bucketKeys: Object.keys(R2_BUCKETS),
});

// ------------------------------------------------------------
// 📦 Default Export (legacy-friendly)
// ------------------------------------------------------------
export default {
  s3,
  R2_BUCKETS,
  R2_PUBLIC_URLS,
  R2_BUCKET_RAW_AUDIO,
  R2_BUCKET_RAW_TEXT_KEY,
  R2_BUCKET_PODCAST_KEY,
  R2_PUBLIC_BASE_URL_RSS_RESOLVED,
  ensureBucketKey,
  ensureBucket,
  uploadBuffer,
  uploadText,
  getObjectAsText,
  listKeys,
  deleteObject,
  putObject,
  putText,
  putJson,
  buildPublicUrl,
  getObject,
  r2Put,
  r2Get,
};
