// scripts/envBootstrap.js
import process from "process";

/* Helpers */
const req = (k) => {
  const v = process.env[k];
  if (v === undefined || String(v).trim() === "") {
    throw new Error(`Missing env: ${k}`);
  }
  return v;
};
const opt = (k, d = undefined) => (process.env[k] === undefined ? d : process.env[k]);
const num = (k, d = undefined) => {
  const raw = opt(k, d);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (Number.isNaN(n)) throw new Error(`Env ${k} must be numeric`);
  return n;
};
const bool = (k, d = false) =>
  ["1","true","yes","on","y"].includes(String(opt(k, d)).toLowerCase());

export const ENV = {
  core: {
    NODE_ENV: opt("NODE_ENV", "production"),
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
  },

  google: {
    CLIENT_EMAIL: opt("GOOGLE_CLIENT_EMAIL"),
    PRIVATE_KEY: opt("GOOGLE_PRIVATE_KEY"),
    SHEET_ID: opt("GOOGLE_SHEET_ID"),
  },

  outreach: {
    OUTREACH_MIN_LEAD_SCORE: num("OUTREACH_MIN_LEAD_SCORE", 12),
    OUTREACH_MIN_EMAIL_SCORE: num("OUTREACH_MIN_EMAIL_SCORE", 0.3),
  },

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
};

// Phase‑3 flat aliases (temporary)
ENV.PORT = ENV.core.PORT;
ENV.GOOGLE_PRIVATE_KEY = ENV.google.PRIVATE_KEY;
ENV.GOOGLE_CLIENT_EMAIL = ENV.google.CLIENT_EMAIL;
ENV.GOOGLE_SHEET_ID = ENV.google.SHEET_ID;
