// services/outreach/utils/filters.js
import { ENV } from "../../../scripts/envBootstrap.js";

export function passesLeadScore(lead) {
  if (typeof ENV.outreach.OUTREACH_MIN_LEAD_SCORE !== "number") {
    throw new Error("OUTREACH_MIN_LEAD_SCORE must be a number");
  }
  return lead.score >= ENV.outreach.OUTREACH_MIN_LEAD_SCORE;
}

export function passesEmailScore(emailScore) {
  if (typeof ENV.outreach.OUTREACH_MIN_EMAIL_SCORE !== "number") {
    throw new Error("OUTREACH_MIN_EMAIL_SCORE must be a number");
  }
  return emailScore >= ENV.outreach.OUTREACH_MIN_EMAIL_SCORE;
}
