// services/shared/utils/r2-client.js
import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../../../scripts/envBootstrap.js";

/**
 * Bomb-proof R2 client:
 * - No top-level async/await (so no ESM syntax traps)
 * - No dynamic import (so no 'Unexpected reserved word')
 * - Reads from ENV (which is import-safe in CI)
 * - Creates the S3 client lazily the first time it's needed
 */

let _client = null;

function assertR2Env() {
  const { endpoint, region, accessKeyId, secretAccessKey, buckets } = ENV.r2 || {};
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials missing – check R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY");
  }
  if (!region) {
    throw new Error("R2 region missing – check R2_REGION");
  }
  if (!buckets || typeof buckets !== "object") {
    throw new Error("R2 buckets not configured – check envBootstrap ENV.r2.buckets");
  }
  return { endpoint, region, accessKeyId, secretAccessKey, buckets };
}

export function getR2Client() {
  if (_client) return _client;

  const { endpoint, region, accessKeyId, secretAccessKey } = assertR2Env();

  _client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _client;
}

export function ensureBucketKey(key) {
  const { buckets } = assertR2Env();
  const name = buckets[key];
  if (!name) throw new Error(`Unknown R2 bucket key: ${key}`);
  return name;
}
