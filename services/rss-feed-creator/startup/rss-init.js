import { info } from "../../../logger.js";
import { ensureBucketKey } from "../../shared/utils/r2-client.js";

export async function ensureR2Sources() {
  ensureBucketKey("rss");
  ensureBucketKey("podcastRss");
  info("🟩 RSS bootstrap complete.");
}

if (process.argv[1]?.includes("rss-init.js")) {
  info("🧩 RSS bootstrap starting...");
  await ensureR2Sources();
}
