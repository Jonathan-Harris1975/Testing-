import { ENV } from "../../../scripts/envBootstrap.js";
import { info, warn } from "../../../logger.js";
import { google } from "googleapis";

export function getSheetsClient() {
  const email = ENV.google.CLIENT_EMAIL;
  const key = ENV.google.PRIVATE_KEY;
  const sheet = ENV.google.SHEET_ID;

  if (!email || !key || !sheet) {
    warn("📄 Google Sheets disabled — missing credentials");
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  info("📄 Google Sheets client initialised");
  return google.sheets({ version: "v4", auth });
}
