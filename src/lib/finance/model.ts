/**
 * Community Wealth Financial Model
 * ---------------------------------------------------------------------------
 * Pure, dependency-free functions so the model can be unit tested, rendered on
 * the server, and run in the interactive calculator on the client.
 *
 * IMPORTANT: Every number produced here is a PROJECTION based on stated
 * assumptions. Nothing here represents actual members, contributions or awards.
 * Percentages for regulatory levies, taxes and processing are PLACEHOLDERS
 * pending professional tax, regulatory and payments advice.
 */

export const NAIRA = "₦";

export type BucketKey =
  | "awards"
  | "business"
  | "community"
  | "reserve"
  | "referral"
  | "regulatory"
  | "processing"
  | "operations"
  | "assurance";

export interface Bucket {
  key: BucketKey;
  label: string;
  /** What kind of money this is — kept distinct on purpose. */
  nature: "Award" | "Business investment" | "Community fund" | "Reserve" | "Referral reward" | "Statutory" | "Operating expense";
  description: string;
}

export const BUCKETS: Bucket[] = [
  { key: "awards", label: "Beneficiary award pool", nature: "Award", description: "Funds paid to members selected under the approved, independently supervised selection process." },
  { key: "business", label: "Business development capital", nature: "Business investment", description: "Ring-fenced capital for feasibility-tested ventures, held and managed under a separately regulated structure." },
  { key: "community", label: "Community development fund", nature: "Community fund", description: "Grants for skills, local infrastructure and supplier development — not repayable, not a return to members." },
  { key: "reserve", label: "Emergency & liquidity reserve", nature: "Reserve", description: "Protects award obligations and member refunds if participation falls below forecast." },
  { key: "referral", label: "Referral rewards (proposed)", nature: "Referral reward", description: "1% of each day's actual contribution pool, shared by members in proportion to their verified, eligible direct referrals. Inactive until legally approved." },
  { key: "regulatory", label: "Regulatory levies & taxes", nature: "Statutory", description: "PLACEHOLDER — final rates depend on licensing route and formal tax opinion." },
  { key: "processing", label: "Payment processing", nature: "Operating expense", description: "Collection, settlement and payout costs. Micro-payments are expensive; see batching proposal." },
  { key: "operations", label: "Operations & administration", nature: "Operating expense", description: "Staff, technology, KYC, support, security and member communications." },
  { key: "assurance", label: "Audit, assurance & governance", nature: "Operating expense", description: "Independent auditors, selection observers, trustee and board oversight." },
];

export type Allocation = Record<BucketKey, number>; // percentages, sum = 100

export interface ModelInputs {
  /** Registered members. Registration is unlimited. */
  members: number;
  /** Daily places available. Once filled, the day closes. */
  dailyCap: number;
  dailyContribution: number; // naira
  /** Share of registered members who try to take a place on an average day, 0–1. */
  participationRate: number;
  daysPerMonth: number;
  awardAmount: number; // naira per beneficiary (used for custom what-if analysis)
  awardCount: number; // beneficiaries per month
}

export interface ModelResult {
  /** Places actually taken per day = min(members × participation, cap). */
  placesPerDay: number;
  capReached: boolean;
  grossMonthly: number;
  grossDaily: number;
  awardCost: number;
  awardShareOfGross: number; // 0–1+, can exceed 1
  nonAwardFunds: number; // may be negative
  feasible: boolean;
  fundableAwards: (poolShare: number) => number;
  fundableAwardSize: (poolShare: number) => number;
  /** Places per day required so award cost equals `poolShare` of gross. */
  membersRequired: (poolShare: number) => number;
  /** Approximate probability a member holding a place every day is selected in a month. */
  monthlySelectionOdds: number;
  perMemberMonthly: number;
}

export const DAILY_PLACES = 10_000_000;

export const CONCEPT_INPUTS: ModelInputs = {
  members: 10_000_000,
  dailyCap: DAILY_PLACES,
  dailyContribution: 100,
  participationRate: 1,
  daysPerMonth: 30,
  awardAmount: 1_000_000_000,
  awardCount: 30,
};

export function placesTaken(i: Pick<ModelInputs, "members" | "participationRate" | "dailyCap">) {
  return Math.min(Math.round(i.members * i.participationRate), i.dailyCap);
}

export function runModel(i: ModelInputs): ModelResult {
  const placesPerDay = placesTaken(i);
  const grossDaily = placesPerDay * i.dailyContribution;
  const grossMonthly = grossDaily * i.daysPerMonth;
  const awardCost = i.awardAmount * i.awardCount;
  const awardShareOfGross = grossMonthly > 0 ? awardCost / grossMonthly : Infinity;
  return {
    placesPerDay,
    capReached: i.members * i.participationRate >= i.dailyCap,
    grossDaily,
    grossMonthly,
    awardCost,
    awardShareOfGross,
    nonAwardFunds: grossMonthly - awardCost,
    feasible: awardShareOfGross <= RECOMMENDED_MAX_AWARD_SHARE,
    fundableAwards: (s) => (i.awardAmount > 0 ? Math.floor((grossMonthly * s) / i.awardAmount) : 0),
    fundableAwardSize: (s) => (i.awardCount > 0 ? (grossMonthly * s) / i.awardCount : 0),
    membersRequired: (s) => {
      const perPlace = i.dailyContribution * i.daysPerMonth * s;
      return perPlace > 0 ? Math.ceil(awardCost / perPlace) : Infinity;
    },
    monthlySelectionOdds: Math.min(1, i.awardCount / Math.max(1, placesPerDay)),
    perMemberMonthly: i.dailyContribution * i.daysPerMonth,
  };
}

/* ----------------------------- adopted policy ---------------------------- */

/**
 * ADOPTED POLICY (founder decision): 60% of verified monthly inflow to
 * winners, 40% to the organisation's ring-fenced funds and costs.
 * Awards are always computed from money ALREADY COLLECTED — never promised in advance.
 */
export const RECOMMENDED_MAX_AWARD_SHARE = 0.6;

export const ADOPTED_ALLOCATION: Allocation = {
  awards: 60,
  business: 12,
  community: 5,
  /** Reduced from 6% to fund the 1% referral allocation — approved by the founders (November 2026). */
  reserve: 5,
  referral: 1,
  regulatory: 8,
  processing: 3,
  operations: 5,
  assurance: 1,
};

export const AWARD_TIERS = {
  winners: 30,
  grandCount: 3,
  grandAmount: 1_000_000_000,
  enterpriseCount: 27,
  /** Below this monthly award pool, the 30 awards are shared equally instead of tiered. */
  minPoolForGrand: 5_000_000_000,
} as const;

export interface TierResult {
  pool: number;
  tiered: boolean;
  grand: { count: number; amount: number };
  enterprise: { count: number; amount: number };
}

/** Award structure produced by a given monthly award pool. */
export function tieredAwards(pool: number): TierResult {
  const t = AWARD_TIERS;
  if (pool >= t.minPoolForGrand) {
    return { pool, tiered: true, grand: { count: t.grandCount, amount: t.grandAmount }, enterprise: { count: t.enterpriseCount, amount: (pool - t.grandCount * t.grandAmount) / t.enterpriseCount } };
  }
  return { pool, tiered: false, grand: { count: 0, amount: 0 }, enterprise: { count: t.winners, amount: pool / t.winners } };
}

/** Awards for a month, from gross collected inflow under the adopted policy. */
export function adoptedAwards(grossMonthly: number): TierResult {
  return tieredAwards((grossMonthly * ADOPTED_ALLOCATION.awards) / 100);
}

/* -------------------------------- scenarios ------------------------------ */

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  inputs: ModelInputs;
  allocation: Allocation;
  verdict: "Not viable" | "Viable with conditions" | "Adopted";
  awards: { count: number; amount: number; label: string }[];
  tradeOffs: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "concept",
    name: "A · Original concept",
    tagline: "30 awards of ₦1 billion from ₦30 billion",
    inputs: CONCEPT_INPUTS,
    allocation: { awards: 100, business: 0, community: 0, reserve: 0, referral: 0, regulatory: 0, processing: 0, operations: 0, assurance: 0 },
    verdict: "Not viable",
    awards: [{ count: 30, amount: 1_000_000_000, label: "Grand awards" }],
    tradeOffs: [
      "Consumes 100% of inflow — nothing left for bank charges, taxes, staff, audit or reserves.",
      "No funding for the business and jobs ecosystem that makes the initiative different.",
      "Any day with unsold places creates an unfunded promise.",
    ],
  },
  {
    id: "ninety",
    name: "B · 90% to winners",
    tagline: "30 awards of ₦900 million, 10% charge",
    inputs: { ...CONCEPT_INPUTS, awardAmount: 900_000_000 },
    allocation: { awards: 90, business: 0, community: 0, reserve: 0, referral: 0, regulatory: 7, processing: 3, operations: 0, assurance: 0 },
    verdict: "Not viable",
    awards: [{ count: 30, amount: 900_000_000, label: "Awards" }],
    tradeOffs: [
      "₦3bn left is consumed by bank charges and estimated levies before any staff are paid.",
      "No reserve, no audit budget, no business fund — the scheme becomes a plain lottery.",
    ],
  },
  {
    id: "conservative",
    name: "C · 40% to winners",
    tagline: "3 × ₦1 billion + 27 × ₦333 million",
    inputs: { ...CONCEPT_INPUTS, awardAmount: 400_000_000 },
    allocation: { awards: 40, business: 20, community: 10, reserve: 8, referral: 0, regulatory: 8, processing: 3, operations: 9, assurance: 2 },
    verdict: "Viable with conditions",
    awards: [
      { count: 3, amount: 1_000_000_000, label: "Grand awards" },
      { count: 27, amount: 333_333_333, label: "Enterprise awards" },
    ],
    tradeOffs: [
      "Strongest funding for businesses, jobs and community projects.",
      "Smaller awards make the proposition less compelling to members.",
    ],
  },
  {
    id: "adopted",
    name: "D · 60% winners / 40% team",
    tagline: "3 × ₦1 billion + 27 × ₦556 million every month",
    inputs: { ...CONCEPT_INPUTS, awardAmount: 600_000_000 },
    allocation: ADOPTED_ALLOCATION,
    verdict: "Adopted",
    awards: [
      { count: 3, amount: 1_000_000_000, label: "Grand awards" },
      { count: 27, amount: 555_555_556, label: "Enterprise awards" },
    ],
    tradeOffs: [
      "Keeps 30 winners every month and three ₦1 billion grand awards.",
      "Funds a ₦3.6bn/month business fund so jobs are created whatever winners decide.",
      "Award amounts follow money actually collected — smaller in months with unsold places.",
    ],
  },
];

export const ADOPTED = SCENARIOS.find((s) => s.id === "adopted")!;

export function allocate(gross: number, a: Allocation): Record<BucketKey, number> {
  const out = {} as Record<BucketKey, number>;
  (Object.keys(a) as BucketKey[]).forEach((k) => (out[k] = (gross * a[k]) / 100));
  return out;
}

export function allocationTotal(a: Allocation): number {
  return (Object.values(a) as number[]).reduce((s, v) => s + v, 0);
}

/* ---------------------------- formatting helpers --------------------------- */

export function formatNaira(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n);
  if (opts.compact) {
    const d = opts.decimals ?? 1;
    if (v >= 1e12) return `${sign}${NAIRA}${trim((v / 1e12).toFixed(d))}tn`;
    if (v >= 1e9) return `${sign}${NAIRA}${trim((v / 1e9).toFixed(d))}bn`;
    if (v >= 1e6) return `${sign}${NAIRA}${trim((v / 1e6).toFixed(d))}m`;
    if (v >= 1e3) return `${sign}${NAIRA}${trim((v / 1e3).toFixed(d))}k`;
  }
  return `${sign}${NAIRA}${v.toLocaleString("en-NG", { maximumFractionDigits: opts.decimals ?? 0 })}`;
}

export function formatCount(n: number, compact = false): string {
  if (!Number.isFinite(n)) return "—";
  if (compact) {
    if (n >= 1e6) return `${trim((n / 1e6).toFixed(1))}m`;
    if (n >= 1e3) return `${trim((n / 1e3).toFixed(1))}k`;
  }
  return Math.round(n).toLocaleString("en-NG");
}

export function formatOdds(p: number): string {
  if (p <= 0) return "—";
  if (p >= 1) return "certain";
  return `1 in ${Math.round(1 / p).toLocaleString("en-NG")}`;
}

function trim(s: string) {
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}
