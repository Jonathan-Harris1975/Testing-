// services/rss-feed-creator/utils/rss-bootstrap.js
import { info } from "../../../logger.js";
import { ensureBucketKey } from "../../shared/utils/r2-client.js";

/**
 * RSS bootstrap must be SIDE-EFFECT FREE.
 * Only validate config and log resolved buckets.
 */
export async function ensureR2Sources() {
  for (const key of ["rss", "podcastRss"]) {
    const bucket = await ensureBucketKey(key);
    info(`🪣 R2 bucket resolved: ${key} → ${bucket}`);
  }
}
