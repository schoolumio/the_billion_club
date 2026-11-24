/** Referral programme configuration. Stored as immutable versions in the DB. */

export interface Level { name: string; min: number }

export interface ReferralConfig {
  /** Whether new referral attributions are recorded. */
  referralsEnabled: boolean;
  /** Rewards engine state. Live runs require "active" AND fundingConfirmed AND legalApprovalRef. */
  rewardsState: "inactive" | "simulation_only" | "active";
  /** Allocation in basis points of the pool (100 = 1%). */
  allocationBps: number;
  /** Which pool the allocation is calculated on. */
  poolBasis: "net_received" | "gross_received";
  /** Denominator for each member's percentage. */
  denominator: "paying_members_on_day" | "all_verified_members";
  /** What makes a referral count in the numerator on a given day. */
  eligibility: "verified_and_paid_on_day" | "verified";
  /** Where any undistributed part of the allocation goes. */
  unallocatedPolicy: "return_to_reserve" | "carry_forward";
  /** Optional cap per member per day as bps of the allocation (0 = no cap). */
  perMemberCapBps: number;
  verification: "email" | "email_and_phone";
  /** Daily cut-off (Africa/Lagos) after which contributions count for the next day. */
  cutoffTime: string;
  distributionSchedule: "daily" | "weekly" | "monthly";
  fundingConfirmed: boolean;
  legalApprovalRef: string;
  baseUrl: string;
  levels: Level[];
}

export const DEFAULT_CONFIG: ReferralConfig = {
  referralsEnabled: true,
  rewardsState: "inactive",
  allocationBps: 100,
  poolBasis: "net_received",
  denominator: "paying_members_on_day",
  eligibility: "verified_and_paid_on_day",
  unallocatedPolicy: "return_to_reserve",
  perMemberCapBps: 0,
  verification: "email",
  cutoffTime: "23:59",
  distributionSchedule: "daily",
  fundingConfirmed: false,
  legalApprovalRef: "",
  baseUrl: "https://thebillionairecircle.club",
  levels: [
    { name: "Circle Starter", min: 1 },
    { name: "Circle Ambassador", min: 10 },
    { name: "Growth Champion", min: 50 },
    { name: "Community Builder", min: 250 },
    { name: "Founding Ambassador", min: 1_000 },
    { name: "TBC Growth Legend", min: 10_000 },
  ],
};

export function levelFor(verified: number, levels: Level[]) {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  let current: Level | null = null;
  let next: Level | null = null;
  for (const l of sorted) {
    if (verified >= l.min) current = l;
    else { next = l; break; }
  }
  const floor = current?.min ?? 0;
  const progress = next ? Math.min(1, (verified - floor) / (next.min - floor)) : 1;
  return { current, next, progress, remaining: next ? next.min - verified : 0 };
}

/** Why a live run is not allowed, or null when it is. */
export function liveRunBlocker(c: ReferralConfig): string | null {
  if (c.rewardsState !== "active") return "Rewards engine is not active.";
  if (!c.fundingConfirmed) return "Funding has not been confirmed.";
  if (!c.legalApprovalRef.trim()) return "No legal approval reference recorded.";
  return null;
}
