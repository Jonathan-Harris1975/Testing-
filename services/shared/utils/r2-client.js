// services/shared/utils/r2-client.js
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { ENV } from "../../../scripts/envBootstrap.js";

/* ============================================================
   Client (constructed once, safely)
============================================================ */
const client = new S3Client({
  region: ENV.r2.region,
  endpoint: ENV.r2.endpoint,
  credentials: {
    accessKeyId: ENV.r2.accessKeyId,
    secretAccessKey: ENV.r2.secretAccessKey,
  },
});

/* ============================================================
   Helpers
============================================================ */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

/* ============================================================
   Public API (canonical)
============================================================ */
export async function getObjectAsText(bucket, key) {
  const res = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
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
