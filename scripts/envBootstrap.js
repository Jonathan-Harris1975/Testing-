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
  return ["1", "true", "yes", "on", "y"].includes(String(raw).toLowerCase());
};

/* ============================================================
   ENV — AUTHORITATIVE CONTRACT
============================================================ */
export const ENV = {
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

  ai: {
    MAX_RETRIES: num("AI_MAX_RETRIES", 5),
    MAX_TOKENS: num("AI_MAX_TOKENS", 4096),
    RETRY_BASE_MS: num("AI_RETRY_BASE_MS", 500),
    TEMPERATURE: num("AI_TEMPERATURE", 0.85),
    TIMEOUT: num("AI_TIMEOUT", 60000),
    TOP_P: num("AI_TOP_P", 0.9),

    OPENROUTER_API_BASE: opt(
      "OPENROUTER_API_BASE",
      "https://openrouter.ai/api/v1"
    ),
  },

  outreach: {
    OUTREACH_MIN_LEAD_SCORE: num("OUTREACH_MIN_LEAD_SCORE", 12),
    OUTREACH_MIN_EMAIL_SCORE: num("OUTREACH_MIN_EMAIL_SCORE", 0.3),
  },
};

ENV.PORT = ENV.core.PORT;
