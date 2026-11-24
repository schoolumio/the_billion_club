/** Referral code + identity normalisation helpers. Pure and dependency-free. */

export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L
export const CODE_PATTERN = /^TBC[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

/** Accepts user-typed codes ("tbc 7k3m-9q") and returns canonical form or null. */
export function normalizeCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const c = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return CODE_PATTERN.test(c) ? c : null;
}

export function generateCode(random: () => number = Math.random): string {
  let s = "TBC";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return s;
}

/**
 * Canonical email used for duplicate detection: lower-case; for providers that
 * ignore dots and "+tags" (Gmail), those are stripped so a.b+x@gmail.com and
 * ab@gmail.com are the same person.
 */
export function normalizeEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return e;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  local = local.split("+")[0];
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

/** Nigerian numbers to E.164 (+234…). Returns null when not plausibly valid. */
export function normalizePhone(phone: string): string | null {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = "234" + d.slice(1);
  if (d.length === 10 && /^[789]/.test(d)) d = "234" + d;
  if (!/^\d{11,15}$/.test(d)) return null;
  return `+${d}`;
}

export function referralUrl(baseUrl: string, code: string, campaign?: string | null): string {
  const u = new URL("/join", baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");
  u.searchParams.set("ref", code);
  if (campaign) u.searchParams.set("c", campaign);
  return u.toString();
}

/** Masks a name for activity feeds: "Adaeze Okafor" → "Adaeze O." */
export function maskName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1) + "•••";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
