/**
 * Registration risk scoring. Signals ADD UP; no single network signal (such as
 * a shared IP) rejects anyone, because families, offices, campuses and mobile
 * carriers legitimately share networks and devices.
 *
 *  score < REVIEW_AT       → referral proceeds normally (pending until verified)
 *  REVIEW_AT ≤ score       → referral goes to manual review + fraud alert
 *  hard blocks             → bot honeypot, impossible timing, identity duplicate
 */
export const REVIEW_AT = 40;

export interface RiskSignals {
  honeypotFilled: boolean;
  formFillMs: number;
  sameDeviceAsReferrer: boolean;
  sameIpAsReferrer: boolean;
  /** Registrations attributed to this referrer from the same IP hash in the last hour. */
  referrerIpVelocity1h: number;
  /** Registrations attributed to this referrer in the last hour (all IPs). */
  referrerVelocity1h: number;
  /** Accounts already created from this device. */
  deviceAccounts: number;
  disposableEmail: boolean;
  nameMatchesReferrer: boolean;
}

export interface RiskResult { block: boolean; score: number; flags: string[] }

export function scoreRegistration(s: RiskSignals): RiskResult {
  const flags: string[] = [];
  let score = 0;
  if (s.honeypotFilled) return { block: true, score: 100, flags: ["BOT_HONEYPOT"] };
  if (s.formFillMs < 2500) return { block: true, score: 100, flags: ["BOT_TIMING"] };
  const add = (n: number, f: string) => { score += n; flags.push(f); };
  if (s.sameDeviceAsReferrer) add(35, "SAME_DEVICE_AS_REFERRER");
  if (s.sameIpAsReferrer) add(10, "SAME_NETWORK_AS_REFERRER");
  if (s.referrerIpVelocity1h >= 5) add(30, "IP_VELOCITY");
  if (s.referrerVelocity1h >= 50) add(20, "REFERRER_VELOCITY");
  if (s.deviceAccounts >= 3) add(30, "DEVICE_MULTI_ACCOUNT");
  else if (s.deviceAccounts >= 1) add(10, "DEVICE_REUSED");
  if (s.disposableEmail) add(25, "DISPOSABLE_EMAIL");
  if (s.nameMatchesReferrer) add(30, "NAME_MATCHES_REFERRER");
  return { block: false, score: Math.min(score, 99), flags };
}

const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com",
  "trashmail.com", "getnada.com", "sharklasers.com", "dispostable.com", "throwawaymail.com", "maildrop.cc",
]);
export const isDisposableEmail = (email: string) => DISPOSABLE.has(email.split("@")[1]?.toLowerCase() ?? "");

export const sameName = (a: string, b: string) => a.trim().toLowerCase().replace(/\s+/g, " ") === b.trim().toLowerCase().replace(/\s+/g, " ");
