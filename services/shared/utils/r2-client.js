// ============================================================
// ☁️ Cloudflare R2 Client — ENV-driven + Backwards Compatible
// ============================================================
//
// This module intentionally preserves the *old* API surface so that
// existing services keep working while we migrate them to ENV-based
// config (Phase 4+).
//
// Exports kept:
//   - s3 (alias of the S3Client)
//   - R2_BUCKETS / R2_PUBLIC_URLS (alias maps)
//   - ensureBucketKey, ensureBucket
//   - uploadBuffer/uploadText/getObjectAsText/listKeys/deleteObject
//   - legacy aliases: putObject, r2Put, putText, getObject, r2Get, putJson
//   - buildPublicUrl + resolved URL constants
//

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { log } from "../../../logger.js";
import { ENV } from "../../../scripts/envBootstrap.js";

/* ============================================================
   Guard
============================================================ */

if (!ENV?.r2) {
  throw new Error(
    "ENV.r2 is not initialised – scripts/envBootstrap.js must load before R2 client"
  );
}

/* ============================================================
   Client
============================================================ */

export const s3 = new S3Client({
  region: ENV.r2.region || "auto",
  endpoint: ENV.r2.endpoint,
  credentials: {
    accessKeyId: ENV.r2.accessKeyId,
    secretAccessKey: ENV.r2.secretAccessKey,
  },
});

// Back-compat alias (some code uses { client } or { r2 })
export const client = s3;
export const r2 = s3;

/* ============================================================
   Buckets + Public URL aliases
============================================================ */

// Canonical resolved bucket names from ENV
const B = ENV.r2.buckets;
const U = ENV.r2.publicBase;

// NOTE: These are alias *maps* (keys -> bucket name / public base URL)
// to support legacy call sites that pass "rss", "rawText", etc.
export const R2_BUCKETS = {
  // Core
  podcast: B.podcast,
  rawText: B.rawText,
  rawtext: B.rawText,
  "raw-text": B.rawText,
  meta: B.meta,
  merged: B.merged,
  art: B.art,

  // Audio chunks / raw audio (TTS output, pre-merge)
  chunks: B.chunks,
  "podcast-chunks": B.chunks,
  rawAudio: B.chunks,
  rawaudio: B.chunks,
  "raw-audio": B.chunks,

  // Edited/mastered audio
  edited: B.edited,
  editedAudio: B.edited,
  "edited-audio": B.edited,

  // RSS
  rss: B.rss,
  "rss-feeds": B.rss,
  rssfeeds: B.rss,
  podcastRss: B.podcastRss,

  // Transcripts
  transcripts: B.transcripts,
  transcript: B.transcripts,

  // Meta system
  metasystem: B.metaSystem,
  metaSystem: B.metaSystem,
};

export const R2_PUBLIC_URLS = {
  podcast: U.podcast,
  rawText: U.rawText,
  rawtext: U.rawText,
  "raw-text": U.rawText,
  meta: U.meta,
  merged: U.merged,
  art: U.art,

  chunks: U.chunks,
  "podcast-chunks": U.chunks,
  rawAudio: U.chunks,
  rawaudio: U.chunks,
  "raw-audio": U.chunks,

  edited: U.edited,
  editedAudio: U.edited,
  "edited-audio": U.edited,

  rss: U.rss,
  "rss-feeds": U.rss,
  podcastRss: U.podcastRss,

  transcript: U.transcript,
  transcripts: U.transcript,

  metasystem: U.metaSystem,
  metaSystem: U.metaSystem,
};

// "Wire-only" canonical exports kept from the pre-ENV client
export const R2_BUCKET_RAW_AUDIO = B.chunks;
export const R2_BUCKET_RAW_TEXT_KEY = B.rawText;
export const R2_BUCKET_PODCAST_KEY = B.podcast;
export const R2_PUBLIC_BASE_URL_PODCAST_RESOLVED = U.podcast;
export const R2_PUBLIC_BASE_URL_RSS_RESOLVED = U.rss;

/* ============================================================
   Validation helpers
============================================================ */

export function ensureBucketKey(bucketKey) {
  const bucket = R2_BUCKETS[bucketKey];
  if (!bucket) {
    const valid = Object.keys(R2_BUCKETS).sort().join(", ");
    throw new Error(
      `❌ Unknown R2 bucket key: ${bucketKey} — valid keys: ${valid}`
    );
  }
  return bucket;
}

// R2 buckets must already exist; keep the call site alive
export async function ensureBucket() {
  return;
}

/* ============================================================
   Stream helpers
============================================================ */

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/* ============================================================
   Upload / Download
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
    throw new Error(
      `❌ No public URL configured for R2 bucket alias '${bucketKey}'`
    );
  }

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
  const buf = await streamToBuffer(res.Body);
  return buf.toString("utf-8");
}

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

export async function putJson(bucketKey, key, obj) {
  return uploadText(bucketKey, key, JSON.stringify(obj, null, 2), "application/json");
}

export function buildPublicUrl(bucketKey, key) {
  const base = R2_PUBLIC_URLS[bucketKey];
  if (!base) throw new Error(`❌ No public URL configured for ${bucketKey}`);
  return `${base}/${encodeURIComponent(key)}`;
}

/* ============================================================
   Legacy aliases
============================================================ */

export const putObject = uploadBuffer;
export const r2Put = uploadBuffer;
export const putText = uploadText;
export const getObject = getObjectAsText;
export const r2Get = getObjectAsText;

log.debug?.("r2-client.initialized", {
  endpoint: ENV.r2.endpoint,
  region: ENV.r2.region,
  buckets: Object.keys(R2_BUCKETS).length,
});

export default {
  s3,
  client,
  r2,
  R2_BUCKETS,
  R2_PUBLIC_URLS,
  R2_BUCKET_RAW_AUDIO,
  R2_BUCKET_RAW_TEXT_KEY,
  R2_BUCKET_PODCAST_KEY,
  R2_PUBLIC_BASE_URL_PODCAST_RESOLVED,
  R2_PUBLIC_BASE_URL_RSS_RESOLVED,
  ensureBucketKey,
  ensureBucket,
  uploadBuffer,
  uploadText,
  getObjectAsText,
  listKeys,
  deleteObject,
  putObject,
  putJson,
  putText,
  buildPublicUrl,
  getObject,
  r2Put,
  r2Get,
};
