// services/outreach/services/sheetService.js
//
// Google Sheets helper for Outreach logging.
// Phase 4: uses ENV (no direct process.env reads).
// Soft mode: if Google creds are not configured, we skip Sheets writes without crashing.

import { google } from "googleapis";
import { warn, debug } from "../../../logger.js";
import { ENV } from "../../../scripts/envBootstrap.js";

function extractSheetId(input) {
  if (!input) return null;
  const raw = String(input).trim();

  // Accept plain sheetId
  if (/^[a-zA-Z0-9-_]{20,}$/.test(raw) && !raw.includes("/")) return raw;

  // Accept Google Sheets URL
  const m = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

function getSheetsConfig() {
  const sheetId = extractSheetId(ENV.GOOGLE_SHEET_ID ?? ENV.google?.GOOGLE_SHEET_ID);
  const clientEmail = ENV.GOOGLE_CLIENT_EMAIL ?? ENV.google?.GOOGLE_CLIENT_EMAIL;
  const privateKeyRaw = ENV.GOOGLE_PRIVATE_KEY ?? ENV.google?.GOOGLE_PRIVATE_KEY;

  // Private keys often arrive with literal \n sequences in env vars
  const privateKey =
    typeof privateKeyRaw === "string"
      ? privateKeyRaw.replace(/\\n/g, "\n")
      : "";

  if (!sheetId || !clientEmail || !privateKey) return null;
  return { sheetId, clientEmail, privateKey };
}

function buildClient() {
  const cfg = getSheetsConfig();
  if (!cfg) return null;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: cfg.clientEmail,
      private_key: cfg.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return {
    sheets: google.sheets({ version: "v4", auth }),
    sheetId: cfg.sheetId,
  };
}

// Cache between calls (container lifetime)
let _client = null;
function getClient() {
  if (_client) return _client;
  _client = buildClient();
  if (!_client) {
    warn("⚠️ Sheets logging disabled — missing Google env (GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY/GOOGLE_SHEET_ID).", {
      service: "outreach",
    });
  } else {
    debug("🧾 Sheets logging enabled", { service: "outreach", sheetId: _client.sheetId });
  }
  return _client;
}

/**
 * Append rows to a sheet (soft-fail if Sheets not configured).
 *
 * @param {string} range e.g. "Sheet1!A1"
 * @param {any[][]} rows
 */
export async function appendLeadRows(range, rows) {
  const client = getClient();
  if (!client) return { ok: false, skipped: true };

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });

  return { ok: true };
}
