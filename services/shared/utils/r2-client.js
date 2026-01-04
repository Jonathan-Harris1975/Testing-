// services/shared/utils/r2-client.js
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { log } from "../../../logger.js";
import { getR2Config } from "./r2-config.js";

/* ============================================================
   Config + Client (constructed once, safely)
============================================================ */
const {
  endpoint,
  region,
  credentials,
  buckets: R2_BUCKETS,
  publicUrls: R2_PUBLIC_URLS,
} = getR2Config();

export const s3 = new S3Client({
  region,
  endpoint,
  credentials,
});

/* ============================================================
   Validation Helper
============================================================ */
export function ensureBucketKey(bucketKey) {
  const bucket = R2_BUCKETS[bucketKey];
  if (!bucket) {
    const valid = Object.keys(R2_BUCKETS).join(", ");
    throw new Error(`❌ Unknown R2 bucket key: ${bucketKey} — valid keys: ${valid}`);
  }
  return bucket;
}

/* ============================================================
   Upload / Download
============================================================ */
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

export const putJson = async (bucketKey, key, obj) =>
  uploadText(bucketKey, key, JSON.stringify(obj, null, 2), "application/json");

/* ============================================================
   Utilities
============================================================ */
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

/* ============================================================
   Startup Log
============================================================ */
log.debug("r2-client.initialized", {
  endpoint,
  region,
  buckets: Object.keys(R2_BUCKETS),
});  );
  return streamToString(res.Body);
}

export async function putJson(bucket, key, data) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    })
  );
}

export function ensureBucketKey(key) {
  const name = ENV.r2.buckets[key];
  if (!name) {
    throw new Error(`Unknown R2 bucket key: ${key}`);
  }
  return name;
}

/* ============================================================
   Explicit export (clean)
============================================================ */
export { client };
