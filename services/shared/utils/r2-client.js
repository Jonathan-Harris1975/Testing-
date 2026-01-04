// services/shared/utils/r2-client.js
import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../../../scripts/envBootstrap.js";

if (!ENV?.r2) {
  throw new Error("ENV.r2 is not initialised – envBootstrap must run before R2 client loads");
}

const {
  endpoint,
  region,
  accessKeyId,
  secretAccessKey,
  buckets,
} = ENV.r2;

export const r2 = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function ensureBucketKey(key) {
  const name = buckets[key];
  if (!name) {
    throw new Error(`Unknown R2 bucket key: ${key}`);
  }
  return name;
}
