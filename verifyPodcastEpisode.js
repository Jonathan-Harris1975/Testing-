// verifyPodcastEpisode.js
// Usage: node verifyPodcastEpisode.js TT-2025-11-23

import { ENV } from "./scripts/envBootstrap.js";

const sessionId = process.argv[2];

if (!sessionId) {
  console.error("Usage: node verifyPodcastEpisode.js <sessionId>");
  process.exit(1);
}

const META_BASE = ENV.r2.publicBase.meta;

if (!META_BASE) {
  console.error("R2_PUBLIC_BASE_URL_META not set");
  process.exit(1);
}

const metaUrl = `${META_BASE}/${sessionId}.json`;

(async () => {
  try {
    const res = await fetch(metaUrl);
    if (!res.ok) {
      console.error(`❌ Failed to fetch meta: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    const json = await res.json();
    console.log("✅ Meta JSON fetched successfully");
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("❌ Error fetching meta JSON", err);
    process.exit(1);
  }
})();
