// ============================================================
// ☁️ Cloudflare R2 Client — Unified + Updated With New Buckets
// ============================================================
//
// Includes:
//   • metasystem bucket for episode counter + system files
//   • R2_PUBLIC_BASE_URL_META_SYSTEM
//   • R2_BUCKET_EDITED_AUDIO
//   • R2_PUBLIC_BASE_URL_EDITED_AUDIO
//   • Correct dual RSS setup (newsletter + podcast RSS)
//   • Backwards-compatible aliases for ALL services
// ============================================================

import { ENV } from "../../../scripts/envBootstrap.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { log } from "../../../logger.js";

// ------------------------------------------------------------
// 🔧 Environment Variables
// ------------------------------------------------------------
// ------------------------------------------------------------
// 🔐 Resolved config (Phase 4)
// ------------------------------------------------------------
//
// ENV is the only source of truth. We keep local constants with the
// previous names to avoid refactoring the rest of this module.
//
const R2_ACCESS_KEY_ID = ENV.r2.accessKeyId;
const R2_SECRET_ACCESS_KEY = ENV.r2.secretAccessKey;
const R2_ENDPOINT = ENV.r2.endpoint;
const R2_REGION = ENV.r2.region;

// Buckets (authoritative)
const R2_BUCKET_PODCAST = ENV.r2.buckets.podcast;
const R2_BUCKET_RAW = ENV.r2.buckets.chunks; // compat alias (raw audio bucket)
const R2_BUCKET_RAW_TEXT = ENV.r2.buckets.rawText;
const R2_BUCKET_META = ENV.r2.buckets.meta;
const R2_BUCKET_MERGED = ENV.r2.buckets.merged;
const R2_BUCKET_ART = ENV.r2.buckets.art;
const R2_BUCKET_RSS_FEEDS = ENV.r2.buckets.rss;
const R2_BUCKET_PODCAST_RSS_FEEDS = ENV.r2.buckets.podcastRss;
const R2_BUCKET_TRANSCRIPTS = ENV.r2.buckets.transcripts;
const R2_BUCKET_CHUNKS = ENV.r2.buckets.chunks;
const R2_BUCKET_EDITED_AUDIO = ENV.r2.buckets.edited;
const R2_BUCKET_META_SYSTEM = ENV.r2.buckets.metaSystem;

// Legacy/compat (read-only)
const R2_BUCKET_PODCAST_OUTPUT = ENV.r2.buckets.podcast;
const R2_BUCKET_RAW_TEXT_INPUT = ENV.r2.buckets.rawText;

// Public URLs
const R2_PUBLIC_BASE_URL_PODCAST = ENV.r2.publicBase.podcast;
const R2_PUBLIC_BASE_URL_RAW_TEXT = ENV.r2.publicBase.rawText;
const R2_PUBLIC_BASE_URL_META = ENV.r2.publicBase.meta;
const R2_PUBLIC_BASE_URL_MERGE = ENV.r2.publicBase.merged;
const R2_PUBLIC_BASE_URL_ART = ENV.r2.publicBase.art;
const R2_PUBLIC_BASE_URL_RSS = ENV.r2.publicBase.rss;
const R2_PUBLIC_BASE_URL_PODCAST_RSS = ENV.r2.publicBase.podcastRss;
const R2_PUBLIC_BASE_URL_TRANSCRIPT = ENV.r2.publicBase.transcript;


// ------------------------------------------------------------
// 🧠 Initialize Client
// ------------------------------------------------------------
export const s3 = new S3Client({
  region: R2_REGION || "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});


// ------------------------------------------------------------
// 🎧 Canonical bucket key exports (wire-only)
// ------------------------------------------------------------
// NOTE: These are bucket *keys* (aliases), not bucket names.
// They preserve existing runtime behaviour while making intent explicit.
export const R2_BUCKET_RAW_AUDIO = R2_BUCKET_RAW;
export const R2_BUCKET_RAW_TEXT_KEY = R2_BUCKET_RAW_TEXT || R2_BUCKET_RAW_TEXT_INPUT;
export const R2_BUCKET_PODCAST_KEY = R2_BUCKET_PODCAST || R2_BUCKET_PODCAST_OUTPUT;
export const R2_PUBLIC_BASE_URL_PODCAST_RESOLVED = R2_PUBLIC_BASE_URL_PODCAST || R2_PUBLIC_BASE_URL_PODCAST_OUTPUT;
export const R2_PUBLIC_BASE_URL_RSS_RESOLVED = R2_PUBLIC_BASE_URL_RSS || R2_PUBLIC_BASE_URL_RSS_FEEDS;

// ------------------------------------------------------------
// 🪣 Bucket Aliases (all services unify on these keys)
// ------------------------------------------------------------
export const R2_BUCKETS = {
  podcast:         R2_BUCKET_PODCAST,
  R2_BUCKET_RAW,
  rawtext:         R2_BUCKET_RAW_TEXT,
  rawText:         R2_BUCKET_RAW_TEXT,
  "raw-text":      R2_BUCKET_RAW_TEXT,
  meta:            R2_BUCKET_META,
  merged:          R2_BUCKET_MERGED,
  art:             R2_BUCKET_ART,

  chunks:          R2_BUCKET_CHUNKS,
  "podcast-chunks":R2_BUCKET_CHUNKS,

  // Raw audio (TTS output, pre-merge)
  rawAudio:        R2_BUCKET_CHUNKS,
  rawaudio:        R2_BUCKET_CHUNKS,
  "raw-audio":     R2_BUCKET_CHUNKS,

  // Newsletter RSS feed
  rss:             R2_BUCKET_RSS_FEEDS,
  "rss-feeds":     R2_BUCKET_RSS_FEEDS,
  rssfeeds:        R2_BUCKET_RSS_FEEDS,

  // Podcast RSS feed
  podcastRss:      R2_BUCKET_PODCAST_RSS_FEEDS,

  // Transcripts
  transcripts:     R2_BUCKET_TRANSCRIPTS,
  transcript:      R2_BUCKET_TRANSCRIPTS,

  // NEW — final edited/mastered audio
  edited:          R2_BUCKET_EDITED_AUDIO,

  // Legacy/compat (read-only)
  R2_BUCKET_PODCAST_OUTPUT,

  // Legacy/compat (read-only)
  R2_BUCKET_RAW_TEXT_INPUT,
  editedAudio:     R2_BUCKET_EDITED_AUDIO,

  // Legacy/compat (read-only)
  R2_BUCKET_PODCAST_OUTPUT,

  // Legacy/compat (read-only)
  R2_BUCKET_RAW_TEXT_INPUT,
  "edited-audio":  R2_BUCKET_EDITED_AUDIO,

  // Legacy/compat (read-only)
  R2_BUCKET_PODCAST_OUTPUT,

  // Legacy/compat (read-only)
  R2_BUCKET_RAW_TEXT_INPUT,

  // NEW — metasystem bucket (episode-counter + system files)
  metasystem:      R2_BUCKET_META_SYSTEM,
  metaSystem:      R2_BUCKET_META_SYSTEM,
};

// ------------------------------------------------------------
// 🌍 Public URL Aliases
// ------------------------------------------------------------
export const R2_PUBLIC_URLS = {
  podcast:         R2_PUBLIC_BASE_URL_PODCAST,
  rawtext:         R2_PUBLIC_BASE_URL_RAW_TEXT,
  rawText:         R2_PUBLIC_BASE_URL_RAW_TEXT,
  "raw-text":      R2_PUBLIC_BASE_URL_RAW_TEXT,
  meta:            R2_PUBLIC_BASE_URL_META,
  merged:          R2_PUBLIC_BASE_URL_MERGE,
  art:             R2_PUBLIC_BASE_URL_ART,
  rss:             R2_PUBLIC_BASE_URL_RSS,
  "rss-feeds":     R2_PUBLIC_BASE_URL_RSS,

  // ✅ FIX: both singular & plural transcript aliases
  transcript:      R2_PUBLIC_BASE_URL_TRANSCRIPT,
  transcripts:     R2_PUBLIC_BASE_URL_TRANSCRIPT,

  chunks:          R2_PUBLIC_BASE_URL_CHUNKS,
  "podcast-chunks":R2_PUBLIC_BASE_URL_CHUNKS,

  // Podcast RSS
  podcastRss:      R2_PUBLIC_BASE_URL_PODCAST_RSS,

  // Edited/mastered audio
  edited:          R2_PUBLIC_BASE_URL_EDITED_AUDIO,
  editedAudio:     R2_PUBLIC_BASE_URL_EDITED_AUDIO,
  "edited-audio":  R2_PUBLIC_BASE_URL_EDITED_AUDIO,

  // NEW — metasystem public URL
  metasystem:      R2_PUBLIC_BASE_URL_META_SYSTEM,

  // Legacy/compat (read-only)
  R2_PUBLIC_BASE_URL_RSS_FEEDS,

  // Legacy/compat (read-only)
  R2_PUBLIC_BASE_URL_PODCAST_OUTPUT,
  metaSystem:      R2_PUBLIC_BASE_URL_META_SYSTEM,

  // Legacy/compat (read-only)
  R2_PUBLIC_BASE_URL_RSS_FEEDS,

  // Legacy/compat (read-only)
  R2_PUBLIC_BASE_URL_PODCAST_OUTPUT,
};

// ------------------------------------------------------------
// 🧩 Validation Helper
// ------------------------------------------------------------
export function ensureBucketKey(bucketKey) {
  const bucket = R2_BUCKETS[bucketKey];
  if (!bucket) {
    const valid = Object.keys(R2_BUCKETS).join(", ");
    throw new Error(`❌ Unknown R2 bucket key: ${bucketKey} — valid keys: ${valid}`);
  }
  return bucket;
}

// ------------------------------------------------------------
// ⚙️ Upload / Download
// ------------------------------------------------------------
export async function uploadBuffer(bucketKey, key, buffer, contentType = "application/octet-stream") {
  const bucket = ensureBucketKey(bucketKey);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = R2_PUBLIC_URLS[bucketKey];
  if (!base) {
    throw new Error(`❌ No public URL configured for R2 bucket alias '${bucketKey}'`);
  }

  return `${base}/${encodeURIComponent(key)}`;
}

export async function uploadText(bucketKey, key, text, contentType = "text/plain") {
  return uploadBuffer(bucketKey, key, Buffer.from(text, "utf-8"), contentType);
}

export async function getObjectAsText(bucketKey, key) {
  const bucket = ensureBucketKey(bucketKey);
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const chunk of response.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// ------------------------------------------------------------
// 🔁 Legacy Aliases
// ------------------------------------------------------------
export const putObject = uploadBuffer;
export const r2Put = uploadBuffer;
export const putText = uploadText;
export const getObject = getObjectAsText;
export const r2Get = getObjectAsText;

export const putJson = async (bucketKey, key, obj) =>
  uploadText(bucketKey, key, JSON.stringify(obj, null, 2), "application/json");

export function buildPublicUrl(bucketKey, key) {
  const base = R2_PUBLIC_URLS[bucketKey];
  if (!base) throw new Error(`❌ No public URL configured for ${bucketKey}`);
  return `${base}/${encodeURIComponent(key)}`;
}

// ------------------------------------------------------------
// 🧰 Utilities
// ------------------------------------------------------------
export async function listKeys(bucketKey, prefix = "") {
  const bucket = ensureBucketKey(bucketKey);
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  return Contents ? Contents.map((c) => c.Key) : [];
}

export async function deleteObject(bucketKey, key) {
  const bucket = ensureBucketKey(bucketKey);
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  log.info("🗑️ R2 object deleted", { bucket, key });
}

// ------------------------------------------------------------
// 🧾 Startup Log
// ------------------------------------------------------------
log.debug("r2-client.initialized", {
  endpoint: R2_ENDPOINT,
  region: R2_REGION,
  buckets: Object.keys(R2_BUCKETS),
});

// ------------------------------------------------------------
// 📦 Default Export
// ------------------------------------------------------------
export default {
  s3,
  R2_BUCKETS,
  R2_PUBLIC_URLS,
  R2_BUCKET_RAW_AUDIO,
  R2_BUCKET_RAW_TEXT_KEY,
  R2_BUCKET_PODCAST_KEY,
  R2_PUBLIC_BASE_URL_PODCAST_RESOLVED,
  R2_PUBLIC_BASE_URL_RSS_RESOLVED,
  uploadBuffer,
  uploadText,
  getObjectAsText,
  deleteObject,
  listKeys,
  putObject,
  putJson,
  putText,
  buildPublicUrl,
  getObject,
  r2Put,
  r2Get,
};
