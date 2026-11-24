/**
 * REFERRAL REWARD CALCULATION — the confirmed business rule:
 *
 *   Daily Referral Allocation        = Daily Contribution Pool × allocation (default 1%)
 *   Individual Referral Percentage   = Member's eligible direct referrals ÷ Total eligible users
 *   Individual Daily Referral Reward = Individual Referral Percentage × Daily Referral Allocation
 *
 * Money is integer kobo throughout; every share is floored, so the sum can
 * never exceed the allocation. Whatever is not distributed (organic members
 * in the denominator, caps, rounding) is reported as `unallocatedKobo`.
 *
 * Identity worth knowing: with denominator = members who paid that day and a
 * ₦100 contribution, each eligible referral is worth exactly 1% × ₦100 = ₦1/day.
 */

export interface CalcInput {
  poolKobo: number; // ACTUAL pool for the day (never projected)
  allocationBps: number; // 100 = 1%
  denominator: number; // total eligible users
  members: { userId: string; eligibleReferrals: number }[];
  perMemberCapBps?: number; // cap as bps of allocation; 0/undefined = none
}

export interface CalcLine { userId: string; eligibleReferrals: number; sharePpm: number; amountKobo: number; capped: boolean }

export interface CalcResult {
  allocationKobo: number;
  denominator: number;
  eligibleReferrals: number;
  distributedKobo: number;
  unallocatedKobo: number;
  lines: CalcLine[];
}

export class CalcError extends Error {}

export function calculateReferralRewards(i: CalcInput): CalcResult {
  if (!Number.isInteger(i.poolKobo) || i.poolKobo < 0) throw new CalcError("poolKobo must be a non-negative integer");
  if (!Number.isInteger(i.allocationBps) || i.allocationBps < 0 || i.allocationBps > 10_000) throw new CalcError("allocationBps must be 0–10000");
  if (!Number.isInteger(i.denominator) || i.denominator < 0) throw new CalcError("denominator must be a non-negative integer");
  const seen = new Set<string>();
  let eligible = 0;
  for (const m of i.members) {
    if (seen.has(m.userId)) throw new CalcError(`duplicate member ${m.userId}`);
    seen.add(m.userId);
    if (!Number.isInteger(m.eligibleReferrals) || m.eligibleReferrals < 0) throw new CalcError("eligibleReferrals must be a non-negative integer");
    eligible += m.eligibleReferrals;
  }
  if (eligible > i.denominator) throw new CalcError("eligible referrals exceed the denominator — inconsistent inputs");

  // BigInt keeps 10M-member × ₦bn arithmetic exact.
  const allocation = (BigInt(i.poolKobo) * BigInt(i.allocationBps)) / 10_000n;
  const cap = i.perMemberCapBps ? (allocation * BigInt(i.perMemberCapBps)) / 10_000n : null;
  const den = BigInt(i.denominator);
  let distributed = 0n;
  const lines: CalcLine[] = [];
  for (const m of [...i.members].sort((a, b) => (a.userId < b.userId ? -1 : 1))) {
    if (m.eligibleReferrals === 0 || den === 0n) continue;
    let amount = (allocation * BigInt(m.eligibleReferrals)) / den;
    let capped = false;
    if (cap !== null && amount > cap) { amount = cap; capped = true; }
    distributed += amount;
    lines.push({
      userId: m.userId,
      eligibleReferrals: m.eligibleReferrals,
      sharePpm: Number((BigInt(m.eligibleReferrals) * 1_000_000n) / den),
      amountKobo: Number(amount),
      capped,
    });
  }
  return {
    allocationKobo: Number(allocation),
    denominator: i.denominator,
    eligibleReferrals: eligible,
    distributedKobo: Number(distributed),
    unallocatedKobo: Number(allocation - distributed),
    lines,
  };
}

/** Member-facing estimate (never a promise). */
export function estimateShare(p: { poolKobo: number; allocationBps: number; denominator: number; eligibleReferrals: number }) {
  if (p.denominator <= 0) return { percentage: 0, amountKobo: 0 };
  const r = calculateReferralRewards({ poolKobo: p.poolKobo, allocationBps: p.allocationBps, denominator: p.denominator, members: [{ userId: "me", eligibleReferrals: Math.min(p.eligibleReferrals, p.denominator) }] });
  return { percentage: (p.eligibleReferrals / p.denominator) * 100, amountKobo: r.distributedKobo };
}

/** Canonical, order-independent JSON for hashing run inputs. */
export function canonicalInputs(i: CalcInput & { runDate: string; configVersion: number }): string {
  return JSON.stringify({
    runDate: i.runDate,
    configVersion: i.configVersion,
    poolKobo: i.poolKobo,
    allocationBps: i.allocationBps,
    denominator: i.denominator,
    perMemberCapBps: i.perMemberCapBps ?? 0,
    members: [...i.members].filter((m) => m.eligibleReferrals > 0).sort((a, b) => (a.userId < b.userId ? -1 : 1)).map((m) => [m.userId, m.eligibleReferrals]),
  });
}
