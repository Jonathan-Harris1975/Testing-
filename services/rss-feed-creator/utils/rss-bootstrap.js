// services/rss-feed-creator/utils/rss-bootstrap.js
import { info } from "../../../logger.js";
import { ensureBucket } from "../../shared/utils/r2-client.js";
import { ENV } from "../../../scripts/envBootstrap.js";

export async function ensureR2Sources() {
  const buckets = [
    ENV.r2.buckets.rss,
    ENV.r2.buckets.podcastRss,
  ];

  for (const bucket of buckets) {
    info(`🪣 Ensuring R2 bucket exists: ${bucket}`);
    await ensureBucket(bucket);
  }
}
