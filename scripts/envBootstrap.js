// scripts/envBootstrap.js
import process from "process";
import path from "path";
import { pathToFileURL } from "url";

/* ============================================================
   Helpers (never throw by default)
============================================================ */
const str = (k, d = undefined) => {
  const v = process.env[k];
  if (v === undefined) return d;
  const s = String(v);
  return s.trim() === "" ? d : s;
};

const num = (k, d = undefined) => {
  const raw = str(k, d);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (Number.isNaN(n)) return d;
  return n;
};

const bool = (k, d = false) => {
  const raw = str(k, undefined);
  if (raw === undefined) return d;
  return ["1", "true", "yes", "on", "y"].includes(String(raw).toLowerCase());
};

const reqKeys = (keys, { label = "ENV", allowEmpty = false } = {}) => {
  const missing = [];
  for (const k of keys) {
    const v = process.env[k];
    if (v === undefined) missing.push(k);
    else if (!allowEmpty && String(v).trim() === "") missing.push(k);
  }
  if (missing.length) {
    const msg = `${label} missing required keys: ${missing.join(", ")}`;
    const err = new Error(msg);
    err.missing = missing;
    throw err;
  }
};

/* ============================================================
   ENV — AUTHORITATIVE CONTRACT (safe to import in CI)
   - This file MUST be import-safe.
   - Strict validation happens when run as a script (bootstrap step).
============================================================ */
export const ENV = {
  core: {
    NODE_ENV: str("NODE_ENV", "production"),
    PORT: num("PORT", 3000),
    LOG_LEVEL: str("LOG_LEVEL", "info"),
    APP_TITLE: str("APP_TITLE"),
    APP_URL: str("APP_URL"),
    DEBUG_ROUTES: bool("DEBUG_ROUTES", false),
    AUTO_CALL: str("AUTO_CALL", "yes"),
    ENABLE_FADES: bool("ENABLE_FADES", false),
    ENABLE_EDITORIAL_PASS: bool("ENABLE_EDITORIAL_PASS", true),
    INTERNAL_BASE_HOST: str("INTERNAL_BASE_HOST", "localhost"),
    INTERNAL_BASE_PROTO: str("INTERNAL_BASE_PROTO", "http"),
  },

  ai: {
    MAX_RETRIES: num("AI_MAX_RETRIES", 5),
    MAX_TOKENS: num("AI_MAX_TOKENS", 4096),
    RETRY_BASE_MS: num("AI_RETRY_BASE_MS", 500),
    TEMPERATURE: num("AI_TEMPERATURE", 0.85),
    TIMEOUT: num("AI_TIMEOUT", 60000),
    TOP_P: num("AI_TOP_P", 0.9),
    OPENROUTER_API_BASE: str("OPENROUTER_API_BASE"),
    providers: {
      anthropic: { model: str("OPENROUTER_ANTHROPIC"), key: str("OPENROUTER_API_KEY_ANTHROPIC") },
      chatgpt:   { model: str("OPENROUTER_CHATGPT"),   key: str("OPENROUTER_API_KEY_CHATGPT") },
      google:    { model: str("OPENROUTER_GOOGLE"),    key: str("OPENROUTER_API_KEY_GOOGLE") },
      deepseek:  { model: str("OPENROUTER_DEEPSEEK"),  key: str("OPENROUTER_API_KEY_DEEPSEEK") },
      meta:      { model: str("OPENROUTER_META"),      key: str("OPENROUTER_API_KEY_META") },
      // artwork is OPTIONAL (warning only if missing)
      artwork:   { model: str("OPENROUTER_ART"),       key: str("OPENROUTER_API_KEY_ART") },
    },
  },

  podcast: {
    TITLE: str("PODCAST_TITLE"),
    AUTHOR: str("PODCAST_AUTHOR"),
    DESCRIPTION: str("PODCAST_DESCRIPTION"),
    LINK: str("PODCAST_LINK"),
    LANGUAGE: str("PODCAST_LANGUAGE", "en-uk"),
    EXPLICIT: bool("PODCAST_EXPLICIT", false),

    CATEGORY_1: str("PODCAST_CATEGORY_1"),
    CATEGORY_2: str("PODCAST_CATEGORY_2"),
    COPYRIGHT: str("PODCAST_COPYRIGHT"),
    IMAGE_URL: str("PODCAST_IMAGE_URL"),

    OWNER_NAME: str("PODCAST_OWNER_NAME"),
    OWNER_EMAIL: str("PODCAST_OWNER_EMAIL"),
    USER_AGENT: str("PODCASTINDEX_USER_AGENT"),

    INTRO_URL: str("PODCAST_INTRO_URL"),
    OUTRO_URL: str("PODCAST_OUTRO_URL"),

    FFMPEG_TIMEOUT_MS: num("PODCAST_FFMPEG_TIMEOUT_MS", 900000),

    rss: {
      ENABLED: bool("PODCAST_RSS_ENABLED", true),
      EP_MODE: str("PODCAST_RSS_EP", "Yes"),
    },

    retries: {
      PODCAST_RETRY_DELAY_MS: num("PODCAST_RETRY_DELAY_MS", 2500),
      MAX_PODCAST_RETRIES: num("MAX_PODCAST_RETRIES", 5),
    },

    editor: {
      EDIT_RETRY_DELAY_MS: num("EDIT_RETRY_DELAY_MS", 2500),
      MAX_EDIT_RETRIES: num("MAX_EDIT_RETRIES", 5),
    },

    media: {
      MIN_INTRO_DURATION: num("MIN_INTRO_DURATION", 0.08),
      MIN_OUTRO_DURATION: num("MIN_OUTRO_DURATION", 0.08),
    },

    index: {
      API_KEY: str("API_KEY_PODCAST_INDEX"),
      API_SECRET: str("API_SECRET_PODCAST_INDEX"),
    },

    funding: {
      TEXT: str("funding_text"),
      URL: str("funding_url"),
    },

    itunes: {
      TYPE: str("itunes_type"),
      KEYWORDS: str("itunes_keywords"),
    },
  },

  rss: {
    FEED_URL: str("FEED_URL"),
    FEED_CUTOFF_HOURS: num("FEED_CUTOFF_HOURS", 48),
    FEED_FRESHNESS_HOURS: num("FEED_FRESHNESS_HOURS", 24),
    FEED_RETENTION_DAYS: num("FEED_RETENTION_DAYS", 60),

    TITLE: str("RSS_FEED_TITLE"),
    DESCRIPTION: str("RSS_FEED_DESCRIPTION"),

    MIN_SOURCE_CHARS: num("RSS_MIN_SOURCE_CHARS", 220),
    TOPIC_GUARD_MIN_SHARED: num("RSS_TOPIC_GUARD_MIN_SHARED", 2),
    TOPIC_GUARD_MIN_OVERLAP: num("RSS_TOPIC_GUARD_MIN_OVERLAP", 0.12),

    MAX_FEEDS_PER_RUN: num("MAX_FEEDS_PER_RUN", 50),
    MAX_RSS_FEEDS_PER_RUN: num("MAX_RSS_FEEDS_PER_RUN", 5),
    MAX_URL_FEEDS_PER_RUN: num("MAX_URL_FEEDS_PER_RUN", 1),
    MAX_ITEMS_PER_FEED: num("MAX_ITEMS_PER_FEED", 5),
    MAX_TOTAL_ITEMS: num("MAX_TOTAL_ITEMS", 500),
  },

  tts: {
    POLLY_VOICE_ID: str("POLLY_VOICE_ID", "Brian"),
    CONCURRENCY: num("TTS_CONCURRENCY", 3),
    MAX_CHARS: num("MAX_POLLY_NATURAL_CHUNK_CHARS", 2800),
    MAX_CHUNK_RETRIES: num("MAX_CHUNK_RETRIES", 5),
    RETRY_DELAY_MS: num("RETRY_DELAY_MS", 2500),
    RETRY_BACKOFF_MULTIPLIER: num("RETRY_BACKOFF_MULTIPLIER", 2),
    MIN_SUMMARY_CHARS: num("MIN_SUMMARY_CHARS", 900),
    MAX_SUMMARY_CHARS: num("MAX_SUMMARY_CHARS", 2400),
  },

  r2: {
    endpoint: str("R2_ENDPOINT"),
    region: str("R2_REGION", "auto"),
    accessKeyId: str("R2_ACCESS_KEY_ID"),
    secretAccessKey: str("R2_SECRET_ACCESS_KEY"),
    buckets: {
      podcast: str("R2_BUCKET_PODCAST"),
      rawText: str("R2_BUCKET_RAW_TEXT"),
      chunks: str("R2_BUCKET_CHUNKS"),
      merged: str("R2_BUCKET_MERGED"),
      edited: str("R2_BUCKET_EDITED_AUDIO"),
      meta: str("R2_BUCKET_META"),
      metaSystem: str("R2_BUCKET_META_SYSTEM"),
      rss: str("R2_BUCKET_RSS_FEEDS"),
      podcastRss: str("R2_BUCKET_PODCAST_RSS_FEEDS"),
      transcripts: str("R2_BUCKET_TRANSCRIPTS"),
      art: str("R2_BUCKET_ART"),
    },
    publicBase: {
      podcast: str("R2_PUBLIC_BASE_URL_PODCAST"),
      rawText: str("R2_PUBLIC_BASE_URL_RAW_TEXT"),
      chunks: str("R2_PUBLIC_BASE_URL_CHUNKS"),
      merged: str("R2_PUBLIC_BASE_URL_MERGE"),
      edited: str("R2_PUBLIC_BASE_URL_EDITED_AUDIO"),
      meta: str("R2_PUBLIC_BASE_URL_META"),
      metaSystem: str("R2_PUBLIC_BASE_URL_META_SYSTEM"),
      rss: str("R2_PUBLIC_BASE_URL_RSS"),
      podcastRss: str("R2_PUBLIC_BASE_URL_PODCAST_RSS"),
      transcript: str("R2_PUBLIC_BASE_URL_TRANSCRIPT"),
      art: str("R2_PUBLIC_BASE_URL_ART"),
    },
  },

  outreach: {
    API_SERP_KEY: str("API_SERP_KEY"),
    API_OPENPAGERANK_KEY: str("API_OPENPAGERANK_KEY"),
    API_URLSCAN_KEY: str("API_URLSCAN_KEY"),
    API_PROSPEO_KEY: str("API_PROSPEO_KEY"),
    API_HUNTER_KEY: str("API_HUNTER_KEY"),
    API_APOLLO_KEY: str("API_APOLLO_KEY"),
    API_ZERO_KEY: str("API_ZERO_KEY"),

    SERP_RATE_DELAY_MS: num("SERP_RATE_DELAY_MS", 1500),
    URLSCAN_DELAY_MS: num("URLSCAN_DELAY_MS", 2000),
    APOLLO_DELAY_MS: num("APOLLO_DELAY_MS", 900),
    HUNTER_DELAY_MS: num("HUNTER_DELAY_MS", 600),

    SERP_RESULT_LIMIT: num("SERP_RESULT_LIMIT", 30),
    MAX_DOMAINS_PER_KEYWORD: num("MAX_DOMAINS_PER_KEYWORD", 30),

    OUTREACH_BATCH_SIZE: num("OUTREACH_BATCH_SIZE", 40),
    OUTREACH_MIN_LEAD_SCORE: num("OUTREACH_MIN_LEAD_SCORE", 12),
    OUTREACH_MIN_EMAIL_SCORE: num("OUTREACH_MIN_EMAIL_SCORE", 0.3),
  },

  shortio: { API_KEY: str("SHORTIO_API_KEY"), DOMAIN: str("SHORTIO_DOMAIN") },

  weather: { RAPIDAPI_HOST: str("RAPIDAPI_HOST"), RAPIDAPI_KEY: str("RAPIDAPI_KEY") },

  google: { CLIENT_EMAIL: str("GOOGLE_CLIENT_EMAIL"), PRIVATE_KEY: str("GOOGLE_PRIVATE_KEY"), SHEET_ID: str("GOOGLE_SHEET_ID") },

  aws: { REGION: str("AWS_REGION", "eu-west-2"), ACCESS_KEY_ID: str("AWS_ACCESS_KEY_ID"), SECRET_ACCESS_KEY: str("AWS_SECRET_ACCESS_KEY") },
};

/* ============================================================
   Phase-3 compatibility aliases (keep until Phase 4 fully done)
============================================================ */
ENV.PORT = ENV.core.PORT;

// Buckets (legacy flat names some services still expect)
ENV.R2_BUCKET_RAW_TEXT = ENV.r2.buckets.rawText;
ENV.R2_BUCKET_PODCAST = ENV.r2.buckets.podcast;
ENV.R2_BUCKET_CHUNKS = ENV.r2.buckets.chunks;
ENV.R2_BUCKET_META = ENV.r2.buckets.meta;
ENV.R2_BUCKET_MERGED = ENV.r2.buckets.merged;
ENV.R2_BUCKET_RSS_FEEDS = ENV.r2.buckets.rss;
ENV.R2_BUCKET_PODCAST_RSS_FEEDS = ENV.r2.buckets.podcastRss;
ENV.R2_BUCKET_TRANSCRIPTS = ENV.r2.buckets.transcripts;
ENV.R2_BUCKET_ART = ENV.r2.buckets.art;

ENV.R2_PUBLIC_BASE_URL_PODCAST = ENV.r2.publicBase.podcast;
ENV.R2_PUBLIC_BASE_URL_META = ENV.r2.publicBase.meta;
ENV.R2_PUBLIC_BASE_URL_MERGE = ENV.r2.publicBase.merged;
ENV.R2_PUBLIC_BASE_URL_RSS = ENV.r2.publicBase.rss;
ENV.R2_PUBLIC_BASE_URL_PODCAST_RSS = ENV.r2.publicBase.podcastRss;
ENV.R2_PUBLIC_BASE_URL_TRANSCRIPT = ENV.r2.publicBase.transcript;
ENV.R2_PUBLIC_BASE_URL_ART = ENV.r2.publicBase.art;

/* ============================================================
   Strict validation (bootstrap step)
============================================================ */
export function validateEnv() {
  // Core (needed for server to run)
  reqKeys(["APP_TITLE", "APP_URL", "OPENROUTER_API_BASE", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"], { label: "Core/R2" });

  // R2 bucket names that everything relies on
  reqKeys([
    "R2_BUCKET_PODCAST",
    "R2_BUCKET_RAW_TEXT",
    "R2_BUCKET_CHUNKS",
    "R2_BUCKET_META",
    "R2_BUCKET_MERGED",
    "R2_BUCKET_EDITED_AUDIO",
    "R2_BUCKET_RSS_FEEDS",
    "R2_BUCKET_PODCAST_RSS_FEEDS",
  ], { label: "R2 Buckets" });

  // RSS feed creator inputs
  reqKeys(["FEED_URL", "RSS_FEED_TITLE", "RSS_FEED_DESCRIPTION"], { label: "RSS" });

  // Podcast metadata used to generate feeds & episodes
  reqKeys([
    "PODCAST_TITLE",
    "PODCAST_AUTHOR",
    "PODCAST_DESCRIPTION",
    "PODCAST_LINK",
    "PODCAST_IMAGE_URL",
    "PODCAST_OWNER_EMAIL",
    "PODCAST_OWNER_NAME",
    "PODCASTINDEX_USER_AGENT",
    "API_KEY_PODCAST_INDEX",
    "API_SECRET_PODCAST_INDEX",
  ], { label: "Podcast" });

  // AI providers (artwork optional)
  reqKeys([
    "OPENROUTER_CHATGPT",
    "OPENROUTER_API_KEY_CHATGPT",
    "OPENROUTER_GOOGLE",
    "OPENROUTER_API_KEY_GOOGLE",
    "OPENROUTER_DEEPSEEK",
    "OPENROUTER_API_KEY_DEEPSEEK",
    "OPENROUTER_META",
    "OPENROUTER_API_KEY_META",
    "OPENROUTER_ANTHROPIC",
    "OPENROUTER_API_KEY_ANTHROPIC",
  ], { label: "OpenRouter providers" });

  return true;
}

/* ============================================================
   If executed directly: validate & print a short summary
============================================================ */
function isDirectRun() {
  try {
    const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  validateEnv();
  // keep output minimal and log-friendly
  // eslint-disable-next-line no-console
  console.log("✅ envBootstrap: validation passed");
}
