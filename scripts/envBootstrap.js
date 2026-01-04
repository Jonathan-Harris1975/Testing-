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
  return ["1", "true", "yes", "on", "y"].includes(
    String(raw).toLowerCase()
  );
};

/* ============================================================
   ENV — AUTHORITATIVE CONTRACT
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

    ENABLE_FADES: bool("ENABLE_FADES", false),
    ENABLE_EDITORIAL_PASS: bool("ENABLE_EDITORIAL_PASS", true),

    INTERNAL_BASE_HOST: opt("INTERNAL_BASE_HOST", "localhost"),
    INTERNAL_BASE_PROTO: opt("INTERNAL_BASE_PROTO", "http"),
  },

  /* ---------------- AI ---------------- */
  ai: {
    MAX_RETRIES: num("AI_MAX_RETRIES", 5),
    MAX_TOKENS: num("AI_MAX_TOKENS", 4096),
    RETRY_BASE_MS: num("AI_RETRY_BASE_MS", 500),
    TEMPERATURE: num("AI_TEMPERATURE", 0.85),
    TIMEOUT: num("AI_TIMEOUT", 60000),
    TOP_P: num("AI_TOP_P", 0.9),

    OPENROUTER_API_BASE: req("OPENROUTER_API_BASE"),

    providers: {
      anthropic: {
        model: req("OPENROUTER_ANTHROPIC"),
        key: req("OPENROUTER_API_KEY_ANTHROPIC"),
      },
      chatgpt: {
        model: req("OPENROUTER_CHATGPT"),
        key: req("OPENROUTER_API_KEY_CHATGPT"),
      },
      google: {
        model: req("OPENROUTER_GOOGLE"),
        key: req("OPENROUTER_API_KEY_GOOGLE"),
      },
      deepseek: {
        model: req("OPENROUTER_DEEPSEEK"),
        key: req("OPENROUTER_API_KEY_DEEPSEEK"),
      },
      meta: {
        model: req("OPENROUTER_META"),
        key: req("OPENROUTER_API_KEY_META"),
      },
      artwork: {
        model: req("OPENROUTER_ART"),
        key: req("OPENROUTER_API_KEY_ART"),
      },
    },
  },

  /* ---------------- Podcast ---------------- */
  podcast: {
    TITLE: req("PODCAST_TITLE"),
    AUTHOR: req("PODCAST_AUTHOR"),
    DESCRIPTION: req("PODCAST_DESCRIPTION"),
    LINK: req("PODCAST_LINK"),

    LANGUAGE: opt("PODCAST_LANGUAGE", "en-uk"),
    EXPLICIT: bool("PODCAST_EXPLICIT", false),

    CATEGORY_1: req("PODCAST_CATEGORY_1"),
    CATEGORY_2: req("PODCAST_CATEGORY_2"),
    COPYRIGHT: req("PODCAST_COPYRIGHT"),
    IMAGE_URL: req("PODCAST_IMAGE_URL"),

    OWNER_NAME: req("PODCAST_OWNER_NAME"),
    OWNER_EMAIL: req("PODCAST_OWNER_EMAIL"),
    USER_AGENT: req("PODCASTINDEX_USER_AGENT"),

    INTRO_URL: req("PODCAST_INTRO_URL"),
    OUTRO_URL: req("PODCAST_OUTRO_URL"),

    FFMPEG_TIMEOUT_MS: num("PODCAST_FFMPEG_TIMEOUT_MS", 900000),

    rss: {
      ENABLED: bool("PODCAST_RSS_ENABLED", true),
      EP_MODE: req("PODCAST_RSS_EP"),
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
      API_KEY: req("API_KEY_PODCAST_INDEX"),
      API_SECRET: req("API_SECRET_PODCAST_INDEX"),
    },

    funding: {
      TEXT: opt("funding_text"),
      URL: opt("funding_url"),
    },

    itunes: {
      TYPE: opt("itunes_type"),
      KEYWORDS: opt("itunes_keywords"),
    },
  },

  /* ---------------- RSS ---------------- */
  rss: {
    FEED_URL: req("FEED_URL"),
    FEED_CUTOFF_HOURS: num("FEED_CUTOFF_HOURS", 48),
    FEED_FRESHNESS_HOURS: num("FEED_FRESHNESS_HOURS", 24),
    FEED_RETENTION_DAYS: num("FEED_RETENTION_DAYS", 60),

    TITLE: opt("RSS_FEED_TITLE"),
    DESCRIPTION: opt("RSS_FEED_DESCRIPTION"),

    MIN_SOURCE_CHARS: num("RSS_MIN_SOURCE_CHARS", 220),
    TOPIC_GUARD_MIN_SHARED: num("RSS_TOPIC_GUARD_MIN_SHARED", 2),
    TOPIC_GUARD_MIN_OVERLAP: num("RSS_TOPIC_GUARD_MIN_OVERLAP", 0.12),

    MAX_FEEDS_PER_RUN: num("MAX_FEEDS_PER_RUN", 50),
    MAX_RSS_FEEDS_PER_RUN: num("MAX_RSS_FEEDS_PER_RUN", 5),
    MAX_URL_FEEDS_PER_RUN: num("MAX_URL_FEEDS_PER_RUN", 1),
    MAX_ITEMS_PER_FEED: num("MAX_ITEMS_PER_FEED", 5),
    MAX_TOTAL_ITEMS: num("MAX_TOTAL_ITEMS", 500),
  },

  /* ---------------- TTS ---------------- */
  tts: {
    POLLY_VOICE_ID: req("POLLY_VOICE_ID"),
    CONCURRENCY: num("TTS_CONCURRENCY", 3),
    MAX_CHARS: num("MAX_POLLY_NATURAL_CHUNK_CHARS", 2800),
    MAX_CHUNK_RETRIES: num("MAX_CHUNK_RETRIES", 5),
    RETRY_DELAY_MS: num("RETRY_DELAY_MS", 2500),
    RETRY_BACKOFF_MULTIPLIER: num("RETRY_BACKOFF_MULTIPLIER", 2),
    MIN_SUMMARY_CHARS: num("MIN_SUMMARY_CHARS", 900),
    MAX_SUMMARY_CHARS: num("MAX_SUMMARY_CHARS", 2400),
  },

  /* ---------------- R2 ---------------- */
  r2: {
    endpoint: req("R2_ENDPOINT"),
    region: req("R2_REGION"),
    accessKeyId: req("R2_ACCESS_KEY_ID"),
    secretAccessKey: req("R2_SECRET_ACCESS_KEY"),

    buckets: {
      podcast: req("R2_BUCKET_PODCAST"),
      rawText: req("R2_BUCKET_RAW_TEXT"),
      chunks: req("R2_BUCKET_CHUNKS"),
      merged: req("R2_BUCKET_MERGED"),
      edited: req("R2_BUCKET_EDITED_AUDIO"),
      meta: req("R2_BUCKET_META"),
      metaSystem: req("R2_BUCKET_META_SYSTEM"),
      rss: req("R2_BUCKET_RSS_FEEDS"),
      podcastRss: req("R2_BUCKET_PODCAST_RSS_FEEDS"),
      transcripts: req("R2_BUCKET_TRANSCRIPTS"),
      art: req("R2_BUCKET_ART"),
    },

    publicBase: {
      podcast: req("R2_PUBLIC_BASE_URL_PODCAST"),
      rawText: req("R2_PUBLIC_BASE_URL_RAW_TEXT"),
      chunks: req("R2_PUBLIC_BASE_URL_CHUNKS"),
      merged: req("R2_PUBLIC_BASE_URL_MERGE"),
      edited: req("R2_PUBLIC_BASE_URL_EDITED_AUDIO"),
      meta: req("R2_PUBLIC_BASE_URL_META"),
      metaSystem: req("R2_PUBLIC_BASE_URL_META_SYSTEM"),
      rss: req("R2_PUBLIC_BASE_URL_RSS"),
      podcastRss: req("R2_PUBLIC_BASE_URL_PODCAST_RSS"),
      transcript: req("R2_PUBLIC_BASE_URL_TRANSCRIPT"),
      art: req("R2_PUBLIC_BASE_URL_ART"),
    },
  },

  /* ---------------- Outreach ---------------- */
  outreach: {
    API_SERP_KEY: req("API_SERP_KEY"),
    API_OPENPAGERANK_KEY: req("API_OPENPAGERANK_KEY"),
    API_URLSCAN_KEY: req("API_URLSCAN_KEY"),
    API_PROSPEO_KEY: req("API_PROSPEO_KEY"),
    API_HUNTER_KEY: req("API_HUNTER_KEY"),
    API_APOLLO_KEY: req("API_APOLLO_KEY"),
    API_ZERO_KEY: req("API_ZERO_KEY"),

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

  /* ---------------- Short.io ---------------- */
  shortio: {
    API_KEY: req("SHORTIO_API_KEY"),
    DOMAIN: req("SHORTIO_DOMAIN"),
  },

  /* ---------------- Weather ---------------- */
  weather: {
    RAPIDAPI_HOST: req("RAPIDAPI_HOST"),
    RAPIDAPI_KEY: req("RAPIDAPI_KEY"),
  },

  /* ---------------- Google ---------------- */
  google: {
    CLIENT_EMAIL: req("GOOGLE_CLIENT_EMAIL"),
    PRIVATE_KEY: req("GOOGLE_PRIVATE_KEY"),
    SHEET_ID: req("GOOGLE_SHEET_ID"),
  },

  /* ---------------- AWS ---------------- */
  aws: {
    REGION: req("AWS_REGION"),
    ACCESS_KEY_ID: req("AWS_ACCESS_KEY_ID"),
    SECRET_ACCESS_KEY: req("AWS_SECRET_ACCESS_KEY"),
  },
};

/* ============================================================
   Phase-3 compatibility aliases (remove in Phase 4)
============================================================ */
ENV.PORT = ENV.core.PORT;

ENV.R2_BUCKET_RAW_TEXT = ENV.r2.buckets.rawText;
ENV.R2_BUCKET_PODCAST = ENV.r2.buckets.podcast;
ENV.R2_BUCKET_CHUNKS = ENV.r2.buckets.chunks;
ENV.R2_BUCKET_META = ENV.r2.buckets.meta;
ENV.R2_BUCKET_MERGED = ENV.r2.buckets.merged;
