// services/rss-feed-creator/utils/rss-bootstrap.js
import { info } from "../../../logger.js";
import { ensureBucketKey } from "../../shared/utils/r2-client.js";

/**
 * RSS Init should NOT try to "create" buckets (R2 buckets are provisioned in Cloudflare).
 * What we *can* do safely at cold start is:
 *   - Validate that the bucket keys we rely on map to real bucket names
 *   - Log the resolved bucket names for debugging
 */
export async function ensureR2Sources() {
  const keys = ["rss", "podcastRss"];

  for (const key of keys) {
    const bucketName = ensureBucketKey(key);
    info(`🪣 R2 bucket key ok: ${key} → ${bucketName}`);
  }

  return true;
}
