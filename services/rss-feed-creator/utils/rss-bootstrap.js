// services/rss-feed-creator/utils/rss-bootstrap.js
import { info } from "../../../logger.js";
import { ensureBucketKey } from "../../shared/utils/r2-client.js";

export async function ensureR2Sources() {
  for (const key of ["rss", "podcastRss"]) {
    const bucket = ensureBucketKey(key);
    info(`🪣 R2 bucket resolved: ${key} → ${bucket}`);
  }
}
