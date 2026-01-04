// services/shared/utils/r2-client.js
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Phase 4 SAFE R2 CLIENT
 *
 * IMPORTANT:
 * - This module MUST NOT assume envBootstrap has already executed.
 * - ESM imports are evaluated before runtime sequencing.
 * - Therefore we lazily resolve ENV *inside functions*, never at top-level.
 */

let _client = null;
let _env = null;

function loadEnv() {
  if (_env) return _env;
  // dynamic import to avoid early evaluation
  const mod = await import("../../../scripts/envBootstrap.js");
  _env = mod.ENV;
  if (!_env?.r2) {
    throw new Error("ENV.r2 is not initialised after envBootstrap");
  }
  return _env;
}

export async function getR2Client() {
  if (_client) return _client;

  const ENV = await loadEnv();
  const { endpoint, region, accessKeyId, secretAccessKey } = ENV.r2;

  _client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _client;
}

export async function ensureBucketKey(key) {
  const ENV = await loadEnv();
  const name = ENV.r2.buckets[key];
  if (!name) {
    throw new Error(`Unknown R2 bucket key: ${key}`);
  }
  return name;
}
