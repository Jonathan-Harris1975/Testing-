// ============================================================
// 🧠 AI Podcast Suite — Bootstrap Sequence
// ============================================================
// Ensures env, repo hygiene, RSS, R2, and services are ready
// before the web server starts.
// ============================================================

import { execSync } from "child_process";
import { info, debug, error } from "../logger.js";

function run(cmd, label, { optional = false } = {}) {
  try {
    info(`🔎 Running ${label}...`);
    execSync(cmd, { stdio: "inherit" });
    info(`🟩 ${label} completed successfully.`);
  } catch (err) {
    if (optional) {
      info(`⚠️ ${label} skipped or not required.`);
      return;
    }
    error(`❌ ${label} failed: ${err.message}`);
    process.exit(1);
  }
}

(async () => {
  debug("🧩 Starting AI-management-suite bootstrap sequence...");
  debug("---------------------------------------------");

  // 1️⃣ Load and validate environment variables
  run("node ./scripts/envBootstrap.js", "Environment Bootstrap");

  
  // 2️⃣ Initialize RSS feed data into R2 (critical)
  run(
    "node ./services/rss-feed-creator/startup/rss-init.js",
    "RSS Init"
  );

  // 3️⃣ Perform runtime sanity checks
  run("node ./scripts/startupCheck.js", "Startup Check");

  // 4️⃣ Validate temp storage + Cloudflare R2 connectivity
  run("node ./scripts/tempStorage.js", "R2 Check");

  // 5️⃣ Launch the main web server
  run("node ./server.js", "Start Server");

  debug("---------------------------------------------");
  info("🏁 Bootstrap complete — container entering idle mode.");
})();
