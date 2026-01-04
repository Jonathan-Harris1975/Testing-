// services/rss-feed-creator/startup/rss-init.js
import { ensureR2Sources } from "../utils/rss-bootstrap.js";
import { info } from "../../../logger.js";

(async () => {
  info("🧩 RSS bootstrap starting...");
  await ensureR2Sources();
  info("🟩 RSS bootstrap complete.");
})();
