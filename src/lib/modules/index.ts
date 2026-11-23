/**
 * Integration boundaries for capabilities that MUST NOT operate until the
 * financial model, regulatory approvals and operating rules are finalised.
 *
 * Each module exposes an interface plus a "disabled" implementation that
 * throws. Production implementations (licensed providers) plug in here
 * without touching UI or business code. Enabling any of them requires the
 * corresponding FEATURE_* flag AND a sign-off recorded in the compliance register.
 */

export class FeatureNotApprovedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not enabled: awaiting regulatory approval and compliance sign-off.`);
  }
}

/* ------------------------------ Payments --------------------------------- */
export interface PaymentIntent { memberId: string; amountKobo: number; days: string[]; channel: "card" | "transfer" | "ussd" | "mandate" }
export interface PaymentProvider {
  /** Create a collection request with a CBN-licensed partner; returns provider reference. */
  initiate(intent: PaymentIntent): Promise<{ reference: string; redirectUrl?: string }>;
  /** Verify a webhook signature and return a normalised, idempotent event. */
  verifyWebhook(rawBody: string, signature: string): Promise<{ reference: string; status: "success" | "failed"; amountKobo: number }>;
}

/* ------------------------------ Identity --------------------------------- */
export interface IdentityProvider {
  /** NIN/BVN verification via a licensed identity partner. Never store raw BVN. */
  verify(input: { memberId: string; nin?: string; bvnLast4?: string; fullName: string; dob: string }): Promise<{ status: "verified" | "rejected" | "review"; reference: string }>;
}

/* ------------------------------ Selection -------------------------------- */
export interface SelectionEngine {
  /**
   * Runs an approved, certified selection over an eligibility snapshot and
   * returns a verifiable record (seed commitment, snapshot hash, result).
   */
  select(input: { periodId: string; eligibilitySnapshotHash: string; awards: { tier: string; count: number; amountKobo: number }[] }): Promise<{ recordId: string; proof: string }>;
}

const disabled = <T extends object>(name: string): T =>
  new Proxy({} as T, { get: () => async () => { throw new FeatureNotApprovedError(name); } });

export const payments: PaymentProvider = disabled<PaymentProvider>("Payment processing");
export const identity: IdentityProvider = disabled<IdentityProvider>("Identity verification");
export const selection: SelectionEngine = disabled<SelectionEngine>("Beneficiary selection");
