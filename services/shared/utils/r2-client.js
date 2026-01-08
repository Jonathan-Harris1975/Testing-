// ============================================================
// ☁️ Cloudflare R2 Client — Phase 5 (ENV-driven, compat-tolerant)
// ============================================================
//
// Goals:
//   • Single S3Client initialised from scripts/envBootstrap.js (ENV.r2.*)
//   • Bucket + public URL alias maps (keys + legacy synonyms)
//   • Safe guards + retries for transient R2 failures
//   • No process env usage anywhere in the repo (Phase 5)
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

/* ============================================================
   Alias Maps (bucket keys + legacy synonyms)
============================================================ */
const B = ENV.r2.buckets;
const U = ENV.r2.publicBase;

// Bucket *key* -> bucket *name*
export const R2_BUCKETS = {
  // canonical
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

  // synonyms / legacy
  rawtext: B.rawText,
  "raw-text": B.rawText,

  // raw audio (TTS output pre-merge) historically pointed at "chunks"
  rawAudio: B.chunks,
  rawaudio: B.chunks,
  "raw-audio": B.chunks,
  "podcast-chunks": B.chunks,

  // rss naming drift
  "rss-feeds": B.rss,
  rssfeeds: B.rss,

  // podcast rss drift
  podcastRSS: B.podcastRss,
  "podcast-rss": B.podcastRss,

  // transcripts drift
  transcript: B.transcripts,

  // edited drift
  editedAudio: B.edited,
  "edited-audio": B.edited,

  // metasystem drift
  metasystem: B.metaSystem,
  metasys: B.metaSystem,
};

// Bucket *key* -> public base URL
export const R2_PUBLIC_URLS = {
  // canonical
  podcast: U.podcast,
  rawText: U.rawText,
  chunks: U.chunks,
  merged: U.merged,
  edited: U.edited,
  meta: U.meta,
  metaSystem: U.metaSystem,
  rss: U.rss,
  podcastRss: U.podcastRss,
  transcripts: U.transcript,
  art: U.art,

  // synonyms / legacy
  rawtext: U.rawText,
  "raw-text": U.rawText,

  rawAudio: U.chunks,
  rawaudio: U.chunks,
  "raw-audio": U.chunks,
  "podcast-chunks": U.chunks,

  "rss-feeds": U.rss,
  rssfeeds: U.rss,

  podcastRSS: U.podcastRss,
  "podcast-rss": U.podcastRss,

  transcript: U.transcript,
  editedAudio: U.edited,
  "edited-audio": U.edited,

  metasystem: U.metaSystem,
  metasys: U.metaSystem,
};

/* ============================================================
   Helpers
============================================================ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normaliseKey(bucketKey) {
  // If a caller mistakenly passes the *bucket name* instead of the key,
  // accept it (Phase 5 guard-rail) by mapping it back to a known key.
  const asString = String(bucketKey || "").trim();
  if (!asString) return asString;

  // direct key
  if (R2_BUCKETS[asString]) return asString;

  // bucket name -> key
  for (const [k, bucketName] of Object.entries(R2_BUCKETS)) {
    if (bucketName && bucketName === asString) return k;
  }
  return asString;
}

export function ensureBucketKey(bucketKey) {
  const key = normaliseKey(bucketKey);
  const bucket = R2_BUCKETS[key];
  if (!bucket) {
    const valid = Object.keys(R2_BUCKETS).sort().join(", ");
    throw new Error(`❌ Unknown R2 bucket key '${bucketKey}'. Valid keys: ${valid}`);
  }
  return { key, bucket };
}

function ensurePublicBase(bucketKey) {
  const key = normaliseKey(bucketKey);
  const base = R2_PUBLIC_URLS[key];
  if (!base) {
    throw new Error(`❌ No public base URL configured for bucket key '${bucketKey}'`);
  }
  return { key, base };
}

async function sendWithRetry(fn, { label, retries = 3, baseDelayMs = 250 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      log.warn(`⚠️ R2 retry: ${label}`, {
        attempt: attempt + 1,
        retries: retries + 1,
        delayMs: delay,
        message: err?.message,
        name: err?.name,
      });
      await sleep(delay);
    }
  }
  throw lastErr;
}

/* ============================================================
   Bucket Probe (used by startup checks)
============================================================ */
export async function ensureBucket(bucketKeyOrName) {
  const { bucket } = ensureBucketKey(bucketKeyOrName);

  // There is no HEAD Bucket in R2. A minimal LIST is the safest probe.
  await sendWithRetry(
    () =>
      s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          MaxKeys: 1,
        })
      ),
    { label: `ensureBucket:${bucket}`, retries: 4, baseDelayMs: 300 }
  );

  return bucket;
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
  const { key: resolvedKey, bucket } = ensureBucketKey(bucketKey);

  await sendWithRetry(
    () =>
      s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      ),
    { label: `putObject:${bucket}/${key}`, retries: 3, baseDelayMs: 250 }
  );

  const { base } = ensurePublicBase(resolvedKey);
  return `${base}/${encodeURIComponent(key)}`;
}

export async function uploadText(bucketKey, key, text, contentType = "text/plain") {
  return uploadBuffer(bucketKey, key, Buffer.from(text, "utf-8"), contentType);
}

export async function getObjectAsText(bucketKey, key) {
  const { bucket } = ensureBucketKey(bucketKey);

  const res = await sendWithRetry(
    () => s3.send(new GetObjectCommand({ Bucket: bucket, Key: key })),
    { label: `getObject:${bucket}/${key}`, retries: 3, baseDelayMs: 250 }
  );

  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

export async function listKeys(bucketKey, prefix = "") {
  const { bucket } = ensureBucketKey(bucketKey);

  const { Contents } = await sendWithRetry(
    () => s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })),
    { label: `listKeys:${bucket}/${prefix}`, retries: 3, baseDelayMs: 250 }
  );

  return Contents ? Contents.map((c) => c.Key) : [];
}

export async function deleteObject(bucketKey, key) {
  const { bucket } = ensureBucketKey(bucketKey);

  await sendWithRetry(
    () => s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
    { label: `deleteObject:${bucket}/${key}`, retries: 3, baseDelayMs: 250 }
  );

  log.info("🗑️ R2 object deleted", { bucket, key });
}

/* ============================================================
   Convenience
============================================================ */
export const putJson = async (bucketKey, key, obj) =>
  uploadText(bucketKey, key, JSON.stringify(obj, null, 2), "application/json");

export function buildPublicUrl(bucketKey, key) {
  const { base } = ensurePublicBase(bucketKey);
  return `${base}/${encodeURIComponent(key)}`;
}

/* ============================================================
   Startup Log (debug)
============================================================ */
log.debug("r2-client.initialized", {
  endpoint: ENV.r2.endpoint,
  region: ENV.r2.region,
  buckets: Object.keys(R2_BUCKETS).length,
});
