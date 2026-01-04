import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { ENV } from "../../../scripts/envBootstrap.js";
import { log } from "../../../logger.js";

export const s3 = new S3Client({
  region: ENV.r2.region,
  endpoint: ENV.r2.endpoint,
  credentials: {
    accessKeyId: ENV.r2.accessKeyId,
    secretAccessKey: ENV.r2.secretAccessKey,
  },
});

export const R2_BUCKETS = ENV.r2.buckets;
export const R2_PUBLIC_URLS = ENV.r2.publicBase;

export function ensureBucketKey(key) {
  const bucket = R2_BUCKETS[key];
  if (!bucket) throw new Error(`Unknown R2 bucket key: ${key}`);
  return bucket;
}

export async function uploadBuffer(bucketKey, key, buffer, contentType) {
  const Bucket = ensureBucketKey(bucketKey);
  await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: buffer, ContentType: contentType }));
  return `${R2_PUBLIC_URLS[bucketKey]}/${encodeURIComponent(key)}`;
}

export async function getObjectAsText(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
  const chunks = [];
  for await (const c of res.Body) chunks.push(c);
  return Buffer.concat(chunks).toString("utf-8");
}

export async function listKeys(bucketKey, prefix = "") {
  const Bucket = ensureBucketKey(bucketKey);
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: prefix }));
  return Contents ? Contents.map(c => c.Key) : [];
}

export async function deleteObject(bucketKey, key) {
  const Bucket = ensureBucketKey(bucketKey);
  await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
  log.info("🗑️ R2 object deleted", { Bucket, key });
}
