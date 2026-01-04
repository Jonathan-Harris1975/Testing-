// services/outreach/utils/filters.js
import { ENV } from "../../../scripts/envBootstrap.js";

export function passesLeadScore(lead) {
  return lead.score >= ENV.outreach.OUTREACH_MIN_LEAD_SCORE;
}

export function passesEmailScore(emailScore) {
  return emailScore >= ENV.outreach.OUTREACH_MIN_EMAIL_SCORE;
}

/* Legacy compatibility — remove in Phase 4 */
export function extractGoodLeads(leads = []) {
  return leads.filter(
    (l) =>
      passesLeadScore(l) &&
      passesEmailScore(l.emailScore ?? 0)
  );
}
