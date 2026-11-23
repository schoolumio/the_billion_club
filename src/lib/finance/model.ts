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
  | "regulatory"
  | "processing"
  | "operations"
  | "assurance";

export interface Bucket {
  key: BucketKey;
  label: string;
  /** What kind of money this is — kept distinct on purpose. */
  nature: "Award" | "Business investment" | "Community fund" | "Reserve" | "Statutory" | "Operating expense";
  description: string;
}

export const BUCKETS: Bucket[] = [
  { key: "awards", label: "Beneficiary award pool", nature: "Award", description: "Funds paid to members selected under the approved, independently supervised selection process." },
  { key: "business", label: "Business development capital", nature: "Business investment", description: "Ring-fenced capital for feasibility-tested ventures, held and managed under a separately regulated structure." },
  { key: "community", label: "Community development fund", nature: "Community fund", description: "Grants for skills, local infrastructure and supplier development — not repayable, not a return to members." },
  { key: "reserve", label: "Emergency & liquidity reserve", nature: "Reserve", description: "Protects award obligations and member refunds if participation falls below forecast." },
  { key: "regulatory", label: "Regulatory levies & taxes", nature: "Statutory", description: "PLACEHOLDER — final rates depend on licensing route and formal tax opinion." },
  { key: "processing", label: "Payment processing", nature: "Operating expense", description: "Collection, settlement and payout costs. Micro-payments are expensive; see batching proposal." },
  { key: "operations", label: "Operations & administration", nature: "Operating expense", description: "Staff, technology, KYC, support, security and member communications." },
  { key: "assurance", label: "Audit, assurance & governance", nature: "Operating expense", description: "Independent auditors, selection observers, trustee and board oversight." },
];

export type Allocation = Record<BucketKey, number>; // percentages, sum = 100

export interface ModelInputs {
  members: number;
  dailyContribution: number; // naira
  /** Share of members contributing on an average day, 0–1. */
  participationRate: number;
  daysPerMonth: number;
  awardAmount: number; // naira per beneficiary
  awardCount: number; // beneficiaries per month
}

export interface ModelResult {
  grossMonthly: number;
  grossDaily: number;
  awardCost: number;
  awardShareOfGross: number; // 0–1+, can exceed 1
  nonAwardFunds: number; // may be negative
  feasible: boolean;
  /** Max awards fundable at the chosen award size if award pool = `poolShare` of gross. */
  fundableAwards: (poolShare: number) => number;
  /** Award size fundable for the chosen award count if award pool = `poolShare`. */
  fundableAwardSize: (poolShare: number) => number;
  /** Members required so award cost equals `poolShare` of gross. */
  membersRequired: (poolShare: number) => number;
  /** Probability a single eligible member is selected in a given month. */
  monthlySelectionOdds: number;
  /** Contribution per member per month, at full participation. */
  perMemberMonthly: number;
}

export const CONCEPT_INPUTS: ModelInputs = {
  members: 10_000_000,
  dailyContribution: 100,
  participationRate: 1,
  daysPerMonth: 30,
  awardAmount: 1_000_000_000,
  awardCount: 30,
};

export function runModel(i: ModelInputs): ModelResult {
  const grossDaily = i.members * i.dailyContribution * i.participationRate;
  const grossMonthly = grossDaily * i.daysPerMonth;
  const awardCost = i.awardAmount * i.awardCount;
  const awardShareOfGross = grossMonthly > 0 ? awardCost / grossMonthly : Infinity;
  const activeMembers = Math.max(1, Math.round(i.members * i.participationRate));
  return {
    grossDaily,
    grossMonthly,
    awardCost,
    awardShareOfGross,
    nonAwardFunds: grossMonthly - awardCost,
    feasible: awardShareOfGross <= RECOMMENDED_MAX_AWARD_SHARE,
    fundableAwards: (s) => (i.awardAmount > 0 ? Math.floor((grossMonthly * s) / i.awardAmount) : 0),
    fundableAwardSize: (s) => (i.awardCount > 0 ? (grossMonthly * s) / i.awardCount : 0),
    membersRequired: (s) => {
      const perMember = i.dailyContribution * i.participationRate * i.daysPerMonth * s;
      return perMember > 0 ? Math.ceil(awardCost / perMember) : Infinity;
    },
    monthlySelectionOdds: Math.min(1, i.awardCount / activeMembers),
    perMemberMonthly: i.dailyContribution * i.daysPerMonth,
  };
}

/**
 * Upper bound we recommend for the award pool as a share of gross inflow.
 * Above this, the model cannot fund processing, statutory obligations,
 * reserves and the ecosystem commitments that distinguish the initiative.
 */
export const RECOMMENDED_MAX_AWARD_SHARE = 0.4;

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  inputs: ModelInputs;
  allocation: Allocation;
  verdict: "Not viable" | "Viable with conditions" | "Recommended" | "Requires growth";
  /** Award structure description. */
  awards: { count: number; amount: number; label: string }[];
  tradeOffs: string[];
}

const BALANCED: Allocation = {
  awards: 40,
  business: 20,
  community: 10,
  reserve: 8,
  regulatory: 8,
  processing: 3,
  operations: 9,
  assurance: 2,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "concept",
    name: "A · The concept as proposed",
    tagline: "30 awards of ₦1 billion from ₦30 billion",
    inputs: CONCEPT_INPUTS,
    allocation: { awards: 100, business: 0, community: 0, reserve: 0, regulatory: 0, processing: 0, operations: 0, assurance: 0 },
    verdict: "Not viable",
    awards: [{ count: 30, amount: 1_000_000_000, label: "Grand awards" }],
    tradeOffs: [
      "Consumes 100% of gross inflow — and only if all 10 million members pay every single day.",
      "Leaves nothing for payment processing, which is unavoidable on every transaction.",
      "No funds for statutory levies, taxes, audit, staff, reserves or business development.",
      "Any shortfall in participation immediately creates an unfunded award obligation.",
    ],
  },
  {
    id: "balanced",
    name: "B · Keep ₦1 billion, fund fewer awards",
    tagline: "12 awards of ₦1 billion, full ecosystem funded",
    inputs: { ...CONCEPT_INPUTS, awardCount: 12 },
    allocation: BALANCED,
    verdict: "Viable with conditions",
    awards: [{ count: 12, amount: 1_000_000_000, label: "Grand awards" }],
    tradeOffs: [
      "Preserves the headline ₦1 billion award that defines the brand.",
      "Reduces monthly beneficiaries from 30 to 12 (at 100% participation).",
      "At 80% participation the pool funds 9 awards — the award count must float with real inflow.",
    ],
  },
  {
    id: "tiered",
    name: "C · Keep 30 beneficiaries, tier the awards",
    tagline: "3 × ₦1 billion + 27 × ₦333 million",
    inputs: { ...CONCEPT_INPUTS, awardAmount: 400_000_000 },
    allocation: BALANCED,
    verdict: "Recommended",
    awards: [
      { count: 3, amount: 1_000_000_000, label: "Grand awards" },
      { count: 27, amount: 333_333_333, label: "Enterprise awards" },
    ],
    tradeOffs: [
      "Keeps 30 beneficiaries per month and three ₦1 billion awards.",
      "Every award still capitalises a serious enterprise — ₦333 million is a substantial SME.",
      "Award tiers scale automatically with verified inflow, protecting solvency.",
    ],
  },
  {
    id: "expanded",
    name: "D · Full target through a larger base",
    tagline: "30 × ₦1 billion with 25 million members",
    inputs: { ...CONCEPT_INPUTS, members: 25_000_000 },
    allocation: BALANCED,
    verdict: "Requires growth",
    awards: [{ count: 30, amount: 1_000_000_000, label: "Grand awards" }],
    tradeOffs: [
      "Achieves the original 30 × ₦1 billion while funding the whole ecosystem.",
      "Requires 25 million daily contributors — or ₦250/day from 10 million — or ₦18 billion/month in sponsor co-funding.",
      "Best treated as a long-term milestone unlocked by growth, not a launch promise.",
    ],
  },
];

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
