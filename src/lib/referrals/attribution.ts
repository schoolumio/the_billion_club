/**
 * ATTRIBUTION POLICY (single source of truth; mirrored in the public policy).
 *
 * 1. The referral code that counts is the one shown in the registration form
 *    at the moment the person submits it. The form is pre-filled from, in order:
 *      a) the `ref` parameter of the link they opened on this visit;
 *      b) the referral cookie set by the most recent referral link they opened
 *         (valid 30 days);
 *    and the registrant can see, change or clear it before submitting.
 * 2. Direct registrations with no code are "organic" and credit nobody.
 * 3. Once an account is created the attribution is permanent (DB-enforced).
 * 4. A code belonging to the registrant's own identity is never credited.
 * 5. Single level only: nobody is ever credited for their referrals' referrals.
 */
import { normalizeCode } from "./codes.ts";

export type AttributionSource = "link" | "manual_code" | "campaign";

export interface AttributionInput {
  formCode?: string | null; // what the registrant submitted
  linkCode?: string | null; // ?ref= on the landing URL
  cookieCode?: string | null; // tbc_ref cookie
  campaign?: string | null;
}

export interface Attribution {
  code: string | null;
  source: AttributionSource | null;
  campaign: string | null;
}

export function resolveAttribution(i: AttributionInput): Attribution {
  const form = normalizeCode(i.formCode);
  if (!form) return { code: null, source: null, campaign: null };
  const fromLink = form === normalizeCode(i.linkCode) || form === normalizeCode(i.cookieCode);
  const campaign = fromLink && i.campaign && /^[a-z0-9-]{2,40}$/.test(i.campaign) ? i.campaign : null;
  return { code: form, source: campaign ? "campaign" : fromLink ? "link" : "manual_code", campaign };
}

/** The value to pre-fill in the form. */
export function prefillCode(linkCode?: string | null, cookieCode?: string | null): string | null {
  return normalizeCode(linkCode) ?? normalizeCode(cookieCode);
}
