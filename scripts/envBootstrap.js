// scripts/envBootstrap.js
import process from "process";

/* ============================================================
   Helpers
============================================================ */
const req = (k) => {
  const v = process.env[k];
  if (v === undefined || String(v).trim() === "") {
    throw new Error(`Missing env: ${k}`);
  }
  return v;
};

const opt = (k, d = undefined) => {
  const v = process.env[k];
  return v === undefined ? d : v;
};

const num = (k, d = undefined) => {
  const raw = opt(k, d);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new Error(`Env ${k} must be numeric (got "${raw}")`);
  }
  return n;
};

const bool = (k, d = false) => {
  const raw = opt(k, d);
  if (raw === undefined) return undefined;
  return ["1", "true", "yes", "on", "y"].includes(String(raw).toLowerCase());
};

/* ============================================================
   Canonical ENV Contract (Phase 2)
   - Grouped structure for long-term clarity
   - Flat aliases added for Phase 3 migrations (remove later)
============================================================ */
export const ENV = {
  /* ---------------- Core ---------------- */
  core: {
    NODE_ENV: opt("NODE_ENV", "production"),
    PORT: num("PORT", 3000),
    LOG_LEVEL: opt("LOG_LEVEL", "info"),
    APP_TITLE: opt("APP_TITLE", "AI Management Suite"),
    APP_URL: opt("APP_URL"),
    DEBUG_ROUTES: bool("DEBUG_ROUTES", false),
    AUTO_CALL: opt("AUTO_CALL", "yes"),
    INTERNAL_BASE_HOST: opt("INTERNAL_BASE_HOST", "127.0.0.1"),
    INTERNAL_BASE_PROTO: opt("INTERNAL_BASE_PROTO", "http"),
  },

  /* ---------------- AI Runtime ---------------- */
  ai: {
    OPENROUTER_API_BASE: opt("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1"),
    AI_MAX_RETRIES: num("AI_MAX_RETRIES", 5),
    AI_MAX_TOKENS: num("AI_MAX_TOKENS", 4096),
    AI_RETRY_BASE_MS: num("AI_RETRY_BASE_MS", 500),
    AI_TEMPERATURE: num("AI_TEMPERATURE", 0.85),
    AI_TIMEOUT: num("AI_TIMEOUT", 60000),
    AI_TOP_P: num("AI_TOP_P", 0.9),

    openrouter: {
      providers: {
        google: { name: opt("OPENROUTER_GOOGLE"), apiKey: opt("OPENROUTER_API_KEY_GOOGLE") },
        chatgpt: { name: opt("OPENROUTER_CHATGPT"), apiKey: opt("OPENROUTER_API_KEY_CHATGPT") },
        deepseek: { name: opt("OPENROUTER_DEEPSEEK"), apiKey: opt("OPENROUTER_API_KEY_DEEPSEEK") },
        anthropic: { name: opt("OPENROUTER_ANTHROPIC"), apiKey: opt("OPENROUTER_API_KEY_ANTHROPIC") },
        meta: { name: opt("OPENROUTER_META"), apiKey: opt("OPENROUTER_API_KEY_META") },
        artwork: { name: opt("OPENROUTER_ART"), apiKey: opt("OPENROUTER_API_KEY_ART") },
      },
      headers: {
        "HTTP-Referer": opt("APP_URL", "http://localhost:3000"),
        "X-Title": opt("APP_TITLE", "Podcast Script Generation"),
      },
    },
  },

  /* ---------------- RapidAPI / Weather ---------------- */
  rapidapi: {
    RAPIDAPI_KEY: opt("RAPIDAPI_KEY"),
    RAPIDAPI_HOST: opt("RAPIDAPI_HOST", "weatherapi-com.p.rapidapi.com"),
  },

  /* ---------------- Outreach (parked) ---------------- */
  outreach: {
    API_SERP_KEY: opt("API_SERP_KEY"),
    API_OPENPAGERANK_KEY: opt("API_OPENPAGERANK_KEY"),
    API_URLSCAN_KEY: opt("API_URLSCAN_KEY"),
    API_PROSPEO_KEY: opt("API_PROSPEO_KEY"),
    API_HUNTER_KEY: opt("API_HUNTER_KEY"),
    API_APOLLO_KEY: opt("API_APOLLO_KEY"),
    API_ZERO_KEY: opt("API_ZERO_KEY"),
    SERP_RATE_DELAY_MS: num("SERP_RATE_DELAY_MS"),
    URLSCAN_DELAY_MS: num("URLSCAN_DELAY_MS"),
    APOLLO_DELAY_MS: num("APOLLO_DELAY_MS"),
    HUNTER_DELAY_MS: num("HUNTER_DELAY_MS"),
    SERP_RESULT_LIMIT: num("SERP_RESULT_LIMIT", 30),
    OUTREACH_BATCH_SIZE: num("OUTREACH_BATCH_SIZE"),
    OUTREACH_MIN_LEAD_SCORE: num("OUTREACH_MIN_LEAD_SCORE"),
    OUTREACH_MIN_EMAIL_SCORE: num("OUTREACH_MIN_EMAIL_SCORE"),
  },

  /* ---------------- RSS / Feeds ---------------- */
  rss: {
    FEED_URL: opt("FEED_URL"),
    FEED_CUTOFF_HOURS: num("FEED_CUTOFF_HOURS", 48),
    FEED_FRESHNESS_HOURS: num("FEED_FRESHNESS_HOURS", 24),
    FEED_RETENTION_DAYS: num("FEED_RETENTION_DAYS", 60),

    RSS_FEED_TITLE: opt("RSS_FEED_TITLE"),
    RSS_FEED_DESCRIPTION: opt("RSS_FEED_DESCRIPTION"),

    RSS_MIN_SOURCE_CHARS: num("RSS_MIN_SOURCE_CHARS", 220),
    RSS_TOPIC_GUARD_MIN_SHARED: num("RSS_TOPIC_GUARD_MIN_SHARED", 2),
    RSS_TOPIC_GUARD_MIN_OVERLAP: num("RSS_TOPIC_GUARD_MIN_OVERLAP", 0.12),

    MAX_RSS_FEEDS_PER_RUN: num("MAX_RSS_FEEDS_PER_RUN", 5),
    MAX_URL_FEEDS_PER_RUN: num("MAX_URL_FEEDS_PER_RUN", 1),
    MAX_ITEMS_PER_FEED: num("MAX_ITEMS_PER_FEED", 20),
    FEED_RETENTION_DAYS_ROTATION: num("FEED_RETENTION_DAYS", 7),
  },

  /* ---------------- Podcast metadata ---------------- */
  podcast: {
    PODCAST_TITLE: opt("PODCAST_TITLE", "Podcast"),
    PODCAST_AUTHOR: opt("PODCAST_AUTHOR", ""),
    PODCAST_DESCRIPTION: opt("PODCAST_DESCRIPTION", ""),
    PODCAST_LINK: opt("PODCAST_LINK", ""),
    PODCAST_LANGUAGE: opt("PODCAST_LANGUAGE", "en-gb"),
    PODCAST_EXPLICIT: opt("PODCAST_EXPLICIT", "no"),
    PODCAST_CATEGORY_1: opt("PODCAST_CATEGORY_1", ""),
    PODCAST_CATEGORY_2: opt("PODCAST_CATEGORY_2", ""),
    PODCAST_COPYRIGHT: opt("PODCAST_COPYRIGHT", ""),
    PODCAST_IMAGE_URL: opt("PODCAST_IMAGE_URL", ""),
    PODCAST_OWNER_NAME: opt("PODCAST_OWNER_NAME", ""),
    PODCAST_OWNER_EMAIL: opt("PODCAST_OWNER_EMAIL", ""),
    PODCAST_LOCKED: opt("PODCAST_LOCKED", "yes"),
    PODCAST_LOCKED_OWNER_EMAIL: opt("PODCAST_LOCKED_OWNER_EMAIL"),
    PODCAST_GENERATOR: opt("PODCAST_GENERATOR"),
    PODCAST_GUID: opt("PODCAST_GUID"),
    PODCAST_RSS_FEED_URL: opt("PODCAST_RSS_FEED_URL"),
    PODCASTINDEX_USER_AGENT: opt("PODCASTINDEX_USER_AGENT"),
    PODCAST_INTRO_URL: opt("PODCAST_INTRO_URL"),
    PODCAST_OUTRO_URL: opt("PODCAST_OUTRO_URL"),
    PODCAST_FFMPEG_TIMEOUT_MS: num("PODCAST_FFMPEG_TIMEOUT_MS", 900000),
    PODCAST_RSS_EP: opt("PODCAST_RSS_EP", "Yes"),
    PODCAST_RSS_ENABLED: opt("PODCAST_RSS_ENABLED", "yes"),
    AUTO_CALL: opt("AUTO_CALL", "yes"),
    API_KEY_PODCAST_INDEX: opt("API_KEY_PODCAST_INDEX", ""),
    API_SECRET_PODCAST_INDEX: opt("API_SECRET_PODCAST_INDEX", ""),
    funding_text: opt("funding_text", ""),
    funding_url: opt("funding_url", ""),
    itunes_keywords: opt("itunes_keywords", ""),
    itunes_type: opt("itunes_type", "episodic"),
  },

  /* ---------------- Polly / TTS ---------------- */
  tts: {
    AWS_REGION: opt("AWS_REGION", "eu-west-2"),
    POLLY_VOICE_ID: opt("POLLY_VOICE_ID", "Brian"),
    TTS_CONCURRENCY: num("TTS_CONCURRENCY", 3),
    MAX_POLLY_NATURAL_CHUNK_CHARS: num("MAX_POLLY_NATURAL_CHUNK_CHARS", 2800),
    MAX_CHUNK_RETRIES: num("MAX_CHUNK_RETRIES", 5),
    RETRY_DELAY_MS: num("RETRY_DELAY_MS", 1200),
    RETRY_BACKOFF_MULTIPLIER: num("RETRY_BACKOFF_MULTIPLIER", 2.1),
    MAX_SUMMARY_CHARS: num("MAX_SUMMARY_CHARS", 2400),
    MIN_SUMMARY_CHARS: num("MIN_SUMMARY_CHARS", 900),
    MAX_SSML_CHUNK_BYTES: num("MAX_SSML_CHUNK_BYTES", 4200),
    AI_TIMEOUT: num("AI_TIMEOUT", 30000),
  },

  /* ---------------- R2 ---------------- */
  r2: {
    R2_ENDPOINT: opt("R2_ENDPOINT"),
    R2_REGION: opt("R2_REGION", "auto"),
    R2_ACCESS_KEY_ID: opt("R2_ACCESS_KEY_ID"),
    R2_SECRET_ACCESS_KEY: opt("R2_SECRET_ACCESS_KEY"),

    R2_BUCKET_PODCAST: opt("R2_BUCKET_PODCAST"),
    R2_BUCKET_RAW_TEXT: opt("R2_BUCKET_RAW_TEXT"),
    R2_BUCKET_CHUNKS: opt("R2_BUCKET_CHUNKS"),
    R2_BUCKET_RAW: opt("R2_BUCKET_RAW"),
    R2_BUCKET_META: opt("R2_BUCKET_META"),
    R2_BUCKET_META_SYSTEM: opt("R2_BUCKET_META_SYSTEM"),
    R2_BUCKET_MERGED: opt("R2_BUCKET_MERGED"),
    R2_BUCKET_EDITED_AUDIO: opt("R2_BUCKET_EDITED_AUDIO"),
    R2_BUCKET_TRANSCRIPTS: opt("R2_BUCKET_TRANSCRIPTS"),
    R2_BUCKET_RSS_FEEDS: opt("R2_BUCKET_RSS_FEEDS", "rss-feeds"),
    R2_BUCKET_PODCAST_RSS_FEEDS: opt("R2_BUCKET_PODCAST_RSS_FEEDS"),
    R2_BUCKET_ART: opt("R2_BUCKET_ART"),

    R2_PUBLIC_BASE_URL_PODCAST: opt("R2_PUBLIC_BASE_URL_PODCAST"),
    R2_PUBLIC_BASE_URL_RAW_TEXT: opt("R2_PUBLIC_BASE_URL_RAW_TEXT"),
    R2_PUBLIC_BASE_URL_META: opt("R2_PUBLIC_BASE_URL_META"),
    R2_PUBLIC_BASE_URL_MERGE: opt("R2_PUBLIC_BASE_URL_MERGE"),
    R2_PUBLIC_BASE_URL_RSS: opt("R2_PUBLIC_BASE_URL_RSS"),
    R2_PUBLIC_BASE_URL_ART: opt("R2_PUBLIC_BASE_URL_ART"),
    R2_PUBLIC_BASE_URL_CHUNKS: opt("R2_PUBLIC_BASE_URL_CHUNKS"),
    R2_PUBLIC_BASE_URL_EDITED_AUDIO: opt("R2_PUBLIC_BASE_URL_EDITED_AUDIO"),
    R2_PUBLIC_BASE_URL_PODCAST_RSS: opt("R2_PUBLIC_BASE_URL_PODCAST_RSS"),
    R2_PUBLIC_BASE_URL_TRANSCRIPT: opt("R2_PUBLIC_BASE_URL_TRANSCRIPT"),
    R2_PUBLIC_BASE_URL_META_SYSTEM: opt("R2_PUBLIC_BASE_URL_META_SYSTEM"),
  },

  /* ---------------- Google Sheets ---------------- */
  google: {
    GOOGLE_CLIENT_EMAIL: opt("GOOGLE_CLIENT_EMAIL"),
    GOOGLE_PRIVATE_KEY: opt("GOOGLE_PRIVATE_KEY"),
    GOOGLE_SHEET_ID: opt("GOOGLE_SHEET_ID"),
  },

  /* ---------------- Short.io ---------------- */
  shortio: {
    SHORTIO_API_KEY: opt("SHORTIO_API_KEY"),
    SHORTIO_DOMAIN: opt("SHORTIO_DOMAIN"),
  },

  /* ---------------- AWS creds (if used) ---------------- */
  aws: {
    AWS_REGION: opt("AWS_REGION", "eu-west-2"),
    AWS_ACCESS_KEY_ID: opt("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_ACCESS_KEY: opt("AWS_SECRET_ACCESS_KEY"),
  },
};

// Require a small set only if present is needed for boot. Keep minimal.
const _requiredForBoot = ["NODE_ENV", "PORT"];
_requiredForBoot.forEach((k) => req(k));

/* ============================================================
   Phase 3 compatibility: expose flat aliases on ENV
   This allows service-by-service migration from process.env -> ENV.*
   Remove once all services use grouped access.
============================================================ */
const FLAT_KEYS = [
  // core
  "NODE_ENV","PORT","LOG_LEVEL","APP_TITLE","APP_URL","DEBUG_ROUTES","AUTO_CALL","INTERNAL_BASE_HOST","INTERNAL_BASE_PROTO",
  // ai/runtime
  "AI_MAX_RETRIES","AI_MAX_TOKENS","AI_RETRY_BASE_MS","AI_TEMPERATURE","AI_TIMEOUT","AI_TOP_P","OPENROUTER_API_BASE",
  "OPENROUTER_ANTHROPIC","OPENROUTER_API_KEY_ANTHROPIC","OPENROUTER_API_KEY_ART","OPENROUTER_API_KEY_CHATGPT","OPENROUTER_API_KEY_DEEPSEEK","OPENROUTER_API_KEY_GOOGLE","OPENROUTER_API_KEY_META",
  "OPENROUTER_ART","OPENROUTER_CHATGPT","OPENROUTER_DEEPSEEK","OPENROUTER_GOOGLE","OPENROUTER_META",
  // rapid
  "RAPIDAPI_HOST","RAPIDAPI_KEY",
  // outreach
  "API_SERP_KEY","API_OPENPAGERANK_KEY","API_URLSCAN_KEY","API_PROSPEO_KEY","API_HUNTER_KEY","API_APOLLO_KEY","API_ZERO_KEY",
  "SERP_RATE_DELAY_MS","URLSCAN_DELAY_MS","APOLLO_DELAY_MS","HUNTER_DELAY_MS","RETRY_DELAY_MS","RETRY_BACKOFF_MULTIPLIER",
  "SERP_RESULT_LIMIT","OUTREACH_BATCH_SIZE","OUTREACH_MIN_LEAD_SCORE","OUTREACH_MIN_EMAIL_SCORE",
  // rss/feed
  "FEED_URL","FEED_CUTOFF_HOURS","FEED_FRESHNESS_HOURS","FEED_RETENTION_DAYS","RSS_FEED_TITLE","RSS_FEED_DESCRIPTION",
  "RSS_MIN_SOURCE_CHARS","RSS_TOPIC_GUARD_MIN_SHARED","RSS_TOPIC_GUARD_MIN_OVERLAP","MAX_RSS_FEEDS_PER_RUN","MAX_URL_FEEDS_PER_RUN","MAX_ITEMS_PER_FEED",
  // podcast
  "PODCAST_TITLE","PODCAST_AUTHOR","PODCAST_DESCRIPTION","PODCAST_LINK","PODCAST_LANGUAGE","PODCAST_EXPLICIT","PODCAST_CATEGORY_1","PODCAST_CATEGORY_2",
  "PODCAST_COPYRIGHT","PODCAST_IMAGE_URL","PODCAST_OWNER_NAME","PODCAST_OWNER_EMAIL","PODCAST_LOCKED","PODCAST_LOCKED_OWNER_EMAIL",
  "PODCAST_RSS_FEED_URL","PODCAST_GUID","PODCAST_GENERATOR","PODCASTINDEX_USER_AGENT","PODCAST_INTRO_URL","PODCAST_OUTRO_URL",
  "PODCAST_FFMPEG_TIMEOUT_MS","PODCAST_RSS_EP","PODCAST_RSS_ENABLED","API_KEY_PODCAST_INDEX","API_SECRET_PODCAST_INDEX",
  "funding_text","funding_url","itunes_keywords","itunes_type",
  // tts/polly
  "POLLY_VOICE_ID","TTS_CONCURRENCY","MAX_POLLY_NATURAL_CHUNK_CHARS","MAX_CHUNK_RETRIES","MAX_SUMMARY_CHARS","MIN_SUMMARY_CHARS","MAX_SSML_CHUNK_BYTES",
  "AWS_REGION","AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY",
  // r2
  "R2_ENDPOINT","R2_REGION","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_PODCAST","R2_BUCKET_RAW_TEXT","R2_BUCKET_CHUNKS","R2_BUCKET_RAW","R2_BUCKET_META","R2_BUCKET_META_SYSTEM","R2_BUCKET_MERGED",
  "R2_BUCKET_EDITED_AUDIO","R2_BUCKET_TRANSCRIPTS","R2_BUCKET_RSS_FEEDS","R2_BUCKET_PODCAST_RSS_FEEDS","R2_BUCKET_ART",
  "R2_PUBLIC_BASE_URL_PODCAST","R2_PUBLIC_BASE_URL_RAW_TEXT","R2_PUBLIC_BASE_URL_META","R2_PUBLIC_BASE_URL_MERGE","R2_PUBLIC_BASE_URL_RSS",
  "R2_PUBLIC_BASE_URL_ART","R2_PUBLIC_BASE_URL_CHUNKS","R2_PUBLIC_BASE_URL_EDITED_AUDIO","R2_PUBLIC_BASE_URL_PODCAST_RSS","R2_PUBLIC_BASE_URL_TRANSCRIPT","R2_PUBLIC_BASE_URL_META_SYSTEM",
  // google
  "GOOGLE_CLIENT_EMAIL","GOOGLE_PRIVATE_KEY","GOOGLE_SHEET_ID",
  // shortio
  "SHORTIO_API_KEY","SHORTIO_DOMAIN",
];

for (const k of FLAT_KEYS) {
  // Prefer the raw env value, but keep numeric/bool coercion where we already applied it.
  // Most existing code expects strings; that is fine.
  ENV[k] = opt(k);
}

// Overwrite a few known numerics with their coerced values for safety where used as numbers
ENV.PORT = ENV.core.PORT;
ENV.AI_TIMEOUT = ENV.ai.AI_TIMEOUT;
ENV.AI_MAX_TOKENS = ENV.ai.AI_MAX_TOKENS;
ENV.AI_MAX_RETRIES = ENV.ai.AI_MAX_RETRIES;
ENV.AI_RETRY_BASE_MS = ENV.ai.AI_RETRY_BASE_MS;
ENV.AI_TEMPERATURE = ENV.ai.AI_TEMPERATURE;
ENV.AI_TOP_P = ENV.ai.AI_TOP_P;

ENV.TTS_CONCURRENCY = ENV.tts.TTS_CONCURRENCY;
ENV.MAX_POLLY_NATURAL_CHUNK_CHARS = ENV.tts.MAX_POLLY_NATURAL_CHUNK_CHARS;
ENV.MAX_CHUNK_RETRIES = ENV.tts.MAX_CHUNK_RETRIES;
ENV.RETRY_DELAY_MS = ENV.tts.RETRY_DELAY_MS;
ENV.RETRY_BACKOFF_MULTIPLIER = ENV.tts.RETRY_BACKOFF_MULTIPLIER;
ENV.MAX_SSML_CHUNK_BYTES = ENV.tts.MAX_SSML_CHUNK_BYTES;
ENV.MAX_SUMMARY_CHARS = ENV.tts.MAX_SUMMARY_CHARS;
ENV.MIN_SUMMARY_CHARS = ENV.tts.MIN_SUMMARY_CHARS;

ENV.FEED_CUTOFF_HOURS = ENV.rss.FEED_CUTOFF_HOURS;
ENV.FEED_FRESHNESS_HOURS = ENV.rss.FEED_FRESHNESS_HOURS;
ENV.FEED_RETENTION_DAYS = ENV.rss.FEED_RETENTION_DAYS;
ENV.RSS_MIN_SOURCE_CHARS = ENV.rss.RSS_MIN_SOURCE_CHARS;
ENV.RSS_TOPIC_GUARD_MIN_SHARED = ENV.rss.RSS_TOPIC_GUARD_MIN_SHARED;
ENV.RSS_TOPIC_GUARD_MIN_OVERLAP = ENV.rss.RSS_TOPIC_GUARD_MIN_OVERLAP;
ENV.MAX_RSS_FEEDS_PER_RUN = ENV.rss.MAX_RSS_FEEDS_PER_RUN;
ENV.MAX_URL_FEEDS_PER_RUN = ENV.rss.MAX_URL_FEEDS_PER_RUN;
ENV.MAX_ITEMS_PER_FEED = ENV.rss.MAX_ITEMS_PER_FEED;
