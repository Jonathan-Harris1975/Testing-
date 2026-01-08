// scripts/envBootstrap.js
import process from "process";

const SCHEMA_ONLY = ["1","true","yes","on"].includes(String(process.env.CI || process.env.SCHEMA_VALIDATE_ONLY || "").toLowerCase());

/* ============================================================
   Helpers
============================================================ */
const __missing = [];

const req = (k) => {
  const v = process.env[k];
  if (v === undefined || String(v).trim() === "") {
    if (SCHEMA_ONLY) {
      __missing.push(k);
      return `__MISSING__${k}__`;
    }
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
  return ["1", "true", "yes", "on", "y"].includes(String(raw).toLowerCase());
};

const list = (k, d = []) => {
  const raw = opt(k, undefined);
  if (raw === undefined || String(raw).trim() === "") return d;
  const s = String(raw).trim();
  // Accept JSON array or comma-separated
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr : d;
    } catch {
      return d;
    }
  }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
};

const normalisePrivateKey = (raw) =>
  typeof raw === "string" ? raw.replace(/\\n/g, "\n") : raw;

/* ============================================================
   ENV — AUTHORITATIVE CONTRACT
   (Structured + Phase-3/4 compat aliases)
============================================================ */
export const ENV = {
  /* ---------------- Core ---------------- */
  core: {
    NODE_ENV: String(opt("NODE_ENV", "production")).trim().toLowerCase(),
    PORT: num("PORT", 3000),
    LOG_LEVEL: opt("LOG_LEVEL", "info"),

    APP_TITLE: req("APP_TITLE"),
    APP_URL: req("APP_URL"),

    DEBUG_ROUTES: bool("DEBUG_ROUTES", false),
    AUTO_CALL: opt("AUTO_CALL", "yes"),

    ENABLE_FADES: bool("ENABLE_FADES", false),
    ENABLE_EDITORIAL_PASS: bool("ENABLE_EDITORIAL_PASS", true),

    INTERNAL_BASE_HOST: opt("INTERNAL_BASE_HOST", "localhost"),
    INTERNAL_BASE_PROTO: opt("INTERNAL_BASE_PROTO", "http"),
    SHIPER: bool("SHIPER", false),
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
      // Artwork can be "soft" in non-art deployments
      artwork: {
        model: opt("OPENROUTER_ART", ""),
        key: opt("OPENROUTER_API_KEY_ART", ""),
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

    LOCKED: opt("PODCAST_LOCKED", "yes"),
    RSS_FEED_URL: opt("PODCAST_RSS_FEED_URL", ""),

    FFMPEG_TIMEOUT_MS: num("PODCAST_FFMPEG_TIMEOUT_MS", 900000),

    rss: {
      ENABLED: bool("PODCAST_RSS_ENABLED", true),
      EP_MODE: opt("PODCAST_RSS_EP", "Yes"),
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
      TEXT: req("funding_text"),
      URL: req("funding_url"),
    },

    itunes: {
      TYPE: req("itunes_type"),
      KEYWORDS: req("itunes_keywords"),
    },
  },

  /* ---------------- RSS ---------------- */
  rss: {
    FEED_URL: req("FEED_URL"),
    FEED_CUTOFF_HOURS: num("FEED_CUTOFF_HOURS", 48),
    FEED_FRESHNESS_HOURS: num("FEED_FRESHNESS_HOURS", 24),
    FEED_RETENTION_DAYS: num("FEED_RETENTION_DAYS", 60),

    TITLE: req("RSS_FEED_TITLE"),
    DESCRIPTION: req("RSS_FEED_DESCRIPTION"),

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

    SSML_ENABLED: bool("SSML_ENABLED", true),
    MAX_SSML_CHUNK_BYTES: num("MAX_SSML_CHUNK_BYTES", 4200),
  },

  /* ---------------- R2 ---------------- */
  r2: {
    endpoint: req("R2_ENDPOINT"),
    region: opt("R2_REGION", "auto"),
    accessKeyId: req("R2_ACCESS_KEY_ID"),
    secretAccessKey: req("R2_SECRET_ACCESS_KEY"),

    buckets: {
      rss: req("R2_BUCKET_RSS_FEEDS"),
      podcastRss: req("R2_BUCKET_PODCAST_RSS_FEEDS"),
      podcast: req("R2_BUCKET_PODCAST"),
      rawText: req("R2_BUCKET_RAW_TEXT"),
      chunks: req("R2_BUCKET_CHUNKS"),
      merged: req("R2_BUCKET_MERGED"),
      edited: req("R2_BUCKET_EDITED_AUDIO"),
      meta: req("R2_BUCKET_META"),
      metaSystem: req("R2_BUCKET_META_SYSTEM"),
      transcripts: req("R2_BUCKET_TRANSCRIPTS"),
      art: req("R2_BUCKET_ART"),
    },

    publicBase: {
      rss: req("R2_PUBLIC_BASE_URL_RSS"),
      podcastRss: req("R2_PUBLIC_BASE_URL_PODCAST_RSS"),
      podcast: req("R2_PUBLIC_BASE_URL_PODCAST"),
      rawText: req("R2_PUBLIC_BASE_URL_RAW_TEXT"),
      chunks: req("R2_PUBLIC_BASE_URL_CHUNKS"),
      merged: req("R2_PUBLIC_BASE_URL_MERGE"),
      edited: req("R2_PUBLIC_BASE_URL_EDITED_AUDIO"),
      meta: req("R2_PUBLIC_BASE_URL_META"),
      metaSystem: req("R2_PUBLIC_BASE_URL_META_SYSTEM"),
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

    // Optional run state keys (if you use them)
    OUTREACH_KEYWORDS: opt("OUTREACH_KEYWORDS", ""),
    OUTREACH_PROGRESS_KEY: opt("OUTREACH_PROGRESS_KEY", ""),
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
    PRIVATE_KEY: normalisePrivateKey(req("GOOGLE_PRIVATE_KEY")),
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
   Phase-3/4 flat aliases (remove when all services are migrated)
============================================================ */
ENV.PORT = ENV.core.PORT;
ENV.INTERNAL_BASE_HOST = ENV.core.INTERNAL_BASE_HOST;
ENV.INTERNAL_BASE_PROTO = ENV.core.INTERNAL_BASE_PROTO;

ENV.APP_TITLE = ENV.core.APP_TITLE;
ENV.APP_URL = ENV.core.APP_URL;
ENV.LOG_LEVEL = ENV.core.LOG_LEVEL;
ENV.DEBUG_ROUTES = ENV.core.DEBUG_ROUTES;
ENV.AUTO_CALL = ENV.core.AUTO_CALL;

ENV.ENABLE_FADES = ENV.core.ENABLE_FADES;
ENV.ENABLE_EDITORIAL_PASS = ENV.core.ENABLE_EDITORIAL_PASS;

ENV.AI_MAX_RETRIES = ENV.ai.MAX_RETRIES;
ENV.AI_MAX_TOKENS = ENV.ai.MAX_TOKENS;
ENV.AI_RETRY_BASE_MS = ENV.ai.RETRY_BASE_MS;
ENV.AI_TEMPERATURE = ENV.ai.TEMPERATURE;
ENV.AI_TIMEOUT = ENV.ai.TIMEOUT;
ENV.AI_TOP_P = ENV.ai.TOP_P;

ENV.OPENROUTER_API_BASE = ENV.ai.OPENROUTER_API_BASE;
ENV.OPENROUTER_ANTHROPIC = ENV.ai.providers.anthropic.model;
ENV.OPENROUTER_CHATGPT = ENV.ai.providers.chatgpt.model;
ENV.OPENROUTER_GOOGLE = ENV.ai.providers.google.model;
ENV.OPENROUTER_DEEPSEEK = ENV.ai.providers.deepseek.model;
ENV.OPENROUTER_META = ENV.ai.providers.meta.model;
ENV.OPENROUTER_ART = ENV.ai.providers.artwork.model;

ENV.OPENROUTER_API_KEY_ANTHROPIC = ENV.ai.providers.anthropic.key;
ENV.OPENROUTER_API_KEY_CHATGPT = ENV.ai.providers.chatgpt.key;
ENV.OPENROUTER_API_KEY_GOOGLE = ENV.ai.providers.google.key;
ENV.OPENROUTER_API_KEY_DEEPSEEK = ENV.ai.providers.deepseek.key;
ENV.OPENROUTER_API_KEY_META = ENV.ai.providers.meta.key;
ENV.OPENROUTER_API_KEY_ART = ENV.ai.providers.artwork.key;

ENV.PODCAST_TITLE = ENV.podcast.TITLE;
ENV.PODCAST_AUTHOR = ENV.podcast.AUTHOR;
ENV.PODCAST_DESCRIPTION = ENV.podcast.DESCRIPTION;
ENV.PODCAST_LINK = ENV.podcast.LINK;
ENV.PODCAST_LANGUAGE = ENV.podcast.LANGUAGE;
ENV.PODCAST_EXPLICIT = ENV.podcast.EXPLICIT;

ENV.PODCAST_CATEGORY_1 = ENV.podcast.CATEGORY_1;
ENV.PODCAST_CATEGORY_2 = ENV.podcast.CATEGORY_2;
ENV.PODCAST_COPYRIGHT = ENV.podcast.COPYRIGHT;
ENV.PODCAST_IMAGE_URL = ENV.podcast.IMAGE_URL;
ENV.PODCAST_OWNER_NAME = ENV.podcast.OWNER_NAME;
ENV.PODCAST_OWNER_EMAIL = ENV.podcast.OWNER_EMAIL;
ENV.PODCASTINDEX_USER_AGENT = ENV.podcast.USER_AGENT;
ENV.PODCAST_INTRO_URL = ENV.podcast.INTRO_URL;
ENV.PODCAST_OUTRO_URL = ENV.podcast.OUTRO_URL;
ENV.PODCAST_FFMPEG_TIMEOUT_MS = ENV.podcast.FFMPEG_TIMEOUT_MS;

ENV.PODCAST_RSS_ENABLED = ENV.podcast.rss.ENABLED;
ENV.PODCAST_RSS_EP = ENV.podcast.rss.EP_MODE;

ENV.PODCAST_RETRY_DELAY_MS = ENV.podcast.retries.PODCAST_RETRY_DELAY_MS;
ENV.MAX_PODCAST_RETRIES = ENV.podcast.retries.MAX_PODCAST_RETRIES;

ENV.EDIT_RETRY_DELAY_MS = ENV.podcast.editor.EDIT_RETRY_DELAY_MS;
ENV.MAX_EDIT_RETRIES = ENV.podcast.editor.MAX_EDIT_RETRIES;

ENV.MIN_INTRO_DURATION = ENV.podcast.media.MIN_INTRO_DURATION;
ENV.MIN_OUTRO_DURATION = ENV.podcast.media.MIN_OUTRO_DURATION;

ENV.API_KEY_PODCAST_INDEX = ENV.podcast.index.API_KEY;
ENV.API_SECRET_PODCAST_INDEX = ENV.podcast.index.API_SECRET;

ENV.funding_text = ENV.podcast.funding.TEXT;
ENV.funding_url = ENV.podcast.funding.URL;
ENV.itunes_type = ENV.podcast.itunes.TYPE;
ENV.itunes_keywords = ENV.podcast.itunes.KEYWORDS;

ENV.FEED_URL = ENV.rss.FEED_URL;
ENV.FEED_CUTOFF_HOURS = ENV.rss.FEED_CUTOFF_HOURS;
ENV.FEED_FRESHNESS_HOURS = ENV.rss.FEED_FRESHNESS_HOURS;
ENV.FEED_RETENTION_DAYS = ENV.rss.FEED_RETENTION_DAYS;
ENV.RSS_FEED_TITLE = ENV.rss.TITLE;
ENV.RSS_FEED_DESCRIPTION = ENV.rss.DESCRIPTION;
ENV.RSS_MIN_SOURCE_CHARS = ENV.rss.MIN_SOURCE_CHARS;
ENV.RSS_TOPIC_GUARD_MIN_SHARED = ENV.rss.TOPIC_GUARD_MIN_SHARED;
ENV.RSS_TOPIC_GUARD_MIN_OVERLAP = ENV.rss.TOPIC_GUARD_MIN_OVERLAP;

ENV.MAX_FEEDS_PER_RUN = ENV.rss.MAX_FEEDS_PER_RUN;
ENV.MAX_RSS_FEEDS_PER_RUN = ENV.rss.MAX_RSS_FEEDS_PER_RUN;
ENV.MAX_URL_FEEDS_PER_RUN = ENV.rss.MAX_URL_FEEDS_PER_RUN;
ENV.MAX_ITEMS_PER_FEED = ENV.rss.MAX_ITEMS_PER_FEED;
ENV.MAX_TOTAL_ITEMS = ENV.rss.MAX_TOTAL_ITEMS;

ENV.POLLY_VOICE_ID = ENV.tts.POLLY_VOICE_ID;
ENV.TTS_CONCURRENCY = ENV.tts.CONCURRENCY;
ENV.MAX_POLLY_NATURAL_CHUNK_CHARS = ENV.tts.MAX_CHARS;
ENV.MAX_CHUNK_RETRIES = ENV.tts.MAX_CHUNK_RETRIES;
ENV.RETRY_DELAY_MS = ENV.tts.RETRY_DELAY_MS;
ENV.RETRY_BACKOFF_MULTIPLIER = ENV.tts.RETRY_BACKOFF_MULTIPLIER;
ENV.MIN_SUMMARY_CHARS = ENV.tts.MIN_SUMMARY_CHARS;
ENV.MAX_SUMMARY_CHARS = ENV.tts.MAX_SUMMARY_CHARS;

ENV.R2_ENDPOINT = ENV.r2.endpoint;
ENV.R2_REGION = ENV.r2.region;
ENV.R2_ACCESS_KEY_ID = ENV.r2.accessKeyId;
ENV.R2_SECRET_ACCESS_KEY = ENV.r2.secretAccessKey;

ENV.R2_BUCKET_RSS_FEEDS = ENV.r2.buckets.rss;
ENV.R2_BUCKET_PODCAST_RSS_FEEDS = ENV.r2.buckets.podcastRss;
ENV.R2_BUCKET_PODCAST = ENV.r2.buckets.podcast;
ENV.R2_BUCKET_RAW_TEXT = ENV.r2.buckets.rawText;
ENV.R2_BUCKET_CHUNKS = ENV.r2.buckets.chunks;
ENV.R2_BUCKET_MERGED = ENV.r2.buckets.merged;
ENV.R2_BUCKET_EDITED_AUDIO = ENV.r2.buckets.edited;
ENV.R2_BUCKET_META = ENV.r2.buckets.meta;
ENV.R2_BUCKET_META_SYSTEM = ENV.r2.buckets.metaSystem;
ENV.R2_BUCKET_TRANSCRIPTS = ENV.r2.buckets.transcripts;
ENV.R2_BUCKET_ART = ENV.r2.buckets.art;

ENV.R2_PUBLIC_BASE_URL_RSS = ENV.r2.publicBase.rss;
ENV.R2_PUBLIC_BASE_URL_PODCAST_RSS = ENV.r2.publicBase.podcastRss;
ENV.R2_PUBLIC_BASE_URL_PODCAST = ENV.r2.publicBase.podcast;
ENV.R2_PUBLIC_BASE_URL_RAW_TEXT = ENV.r2.publicBase.rawText;
ENV.R2_PUBLIC_BASE_URL_CHUNKS = ENV.r2.publicBase.chunks;
ENV.R2_PUBLIC_BASE_URL_MERGE = ENV.r2.publicBase.merged;
ENV.R2_PUBLIC_BASE_URL_EDITED_AUDIO = ENV.r2.publicBase.edited;
ENV.R2_PUBLIC_BASE_URL_META = ENV.r2.publicBase.meta;
ENV.R2_PUBLIC_BASE_URL_META_SYSTEM = ENV.r2.publicBase.metaSystem;
ENV.R2_PUBLIC_BASE_URL_TRANSCRIPT = ENV.r2.publicBase.transcript;
ENV.R2_PUBLIC_BASE_URL_ART = ENV.r2.publicBase.art;

ENV.API_SERP_KEY = ENV.outreach.API_SERP_KEY;
ENV.API_OPENPAGERANK_KEY = ENV.outreach.API_OPENPAGERANK_KEY;
ENV.API_URLSCAN_KEY = ENV.outreach.API_URLSCAN_KEY;
ENV.API_PROSPEO_KEY = ENV.outreach.API_PROSPEO_KEY;
ENV.API_HUNTER_KEY = ENV.outreach.API_HUNTER_KEY;
ENV.API_APOLLO_KEY = ENV.outreach.API_APOLLO_KEY;
ENV.API_ZERO_KEY = ENV.outreach.API_ZERO_KEY;

ENV.SERP_RATE_DELAY_MS = ENV.outreach.SERP_RATE_DELAY_MS;
ENV.URLSCAN_DELAY_MS = ENV.outreach.URLSCAN_DELAY_MS;
ENV.APOLLO_DELAY_MS = ENV.outreach.APOLLO_DELAY_MS;
ENV.HUNTER_DELAY_MS = ENV.outreach.HUNTER_DELAY_MS;

ENV.SERP_RESULT_LIMIT = ENV.outreach.SERP_RESULT_LIMIT;
ENV.MAX_DOMAINS_PER_KEYWORD = ENV.outreach.MAX_DOMAINS_PER_KEYWORD;

ENV.OUTREACH_BATCH_SIZE = ENV.outreach.OUTREACH_BATCH_SIZE;
ENV.OUTREACH_MIN_LEAD_SCORE = ENV.outreach.OUTREACH_MIN_LEAD_SCORE;
ENV.OUTREACH_MIN_EMAIL_SCORE = ENV.outreach.OUTREACH_MIN_EMAIL_SCORE;
ENV.OUTREACH_KEYWORDS = ENV.outreach.OUTREACH_KEYWORDS;
ENV.OUTREACH_PROGRESS_KEY = ENV.outreach.OUTREACH_PROGRESS_KEY;

ENV.SHORTIO_API_KEY = ENV.shortio.API_KEY;
ENV.SHORTIO_DOMAIN = ENV.shortio.DOMAIN;

ENV.RAPIDAPI_HOST = ENV.weather.RAPIDAPI_HOST;
ENV.RAPIDAPI_KEY = ENV.weather.RAPIDAPI_KEY;

ENV.GOOGLE_CLIENT_EMAIL = ENV.google.CLIENT_EMAIL;
ENV.GOOGLE_PRIVATE_KEY = ENV.google.PRIVATE_KEY;
ENV.GOOGLE_SHEET_ID = ENV.google.SHEET_ID;

ENV.AWS_REGION = ENV.aws.REGION;
ENV.AWS_ACCESS_KEY_ID = ENV.aws.ACCESS_KEY_ID;
ENV.AWS_SECRET_ACCESS_KEY = ENV.aws.SECRET_ACCESS_KEY;


// If executed directly in CI, validate the contract file loads without crashing.
if (SCHEMA_ONLY && import.meta.url === `file://${process.argv[1]}`) {
  if (__missing.length) {
    console.log(`schema.validate.ok (missing ${__missing.length} keys in CI)`);
  } else {
    console.log('schema.validate.ok');
  }
}
