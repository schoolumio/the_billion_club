import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateReferralRewards, estimateShare, canonicalInputs, CalcError } from "../src/lib/referrals/calc.ts";
import { normalizeCode, normalizeEmail, normalizePhone, generateCode, referralUrl, maskName, CODE_PATTERN } from "../src/lib/referrals/codes.ts";
import { resolveAttribution, prefillCode } from "../src/lib/referrals/attribution.ts";
import { scoreRegistration, REVIEW_AT, isDisposableEmail } from "../src/lib/referrals/risk.ts";
import { DEFAULT_CONFIG, levelFor, liveRunBlocker } from "../src/lib/referrals/config.ts";

const N = (naira: number) => naira * 100; // kobo

/* ------------------------------ calculation ------------------------------ */

test("the confirmed worked example: 10% of eligible users → 10% of ₦10m = ₦1m", () => {
  const r = calculateReferralRewards({
    poolKobo: N(1_000_000_000), allocationBps: 100, denominator: 10_000_000,
    members: [{ userId: "A", eligibleReferrals: 1_000_000 }],
  });
  assert.equal(r.allocationKobo, N(10_000_000));
  assert.equal(r.lines[0].amountKobo, N(1_000_000));
  assert.equal(r.lines[0].sharePpm, 100_000); // 10%
});

test("with denominator = payers and ₦100 each, every eligible referral is worth exactly ₦1", () => {
  for (const payers of [1_000, 250_000, 10_000_000]) {
    const r = calculateReferralRewards({ poolKobo: N(payers * 100), allocationBps: 100, denominator: payers, members: [{ userId: "A", eligibleReferrals: 7 }] });
    assert.equal(r.lines[0].amountKobo, N(7));
  }
});

test("organic members leave part of the allocation undistributed (reported, never lost)", () => {
  // 10,000 payers; only 6,000 of them were referred → 40% of the 1% is unallocated.
  const r = calculateReferralRewards({ poolKobo: N(1_000_000), allocationBps: 100, denominator: 10_000,
    members: [{ userId: "A", eligibleReferrals: 4_000 }, { userId: "B", eligibleReferrals: 2_000 }] });
  assert.equal(r.allocationKobo, N(10_000));
  assert.equal(r.distributedKobo, N(6_000));
  assert.equal(r.unallocatedKobo, N(4_000));
  assert.equal(r.distributedKobo + r.unallocatedKobo, r.allocationKobo);
});

test("rounding is floored per member and never over-distributes", () => {
  const members = Array.from({ length: 7 }, (_, k) => ({ userId: `m${k}`, eligibleReferrals: 1 }));
  const r = calculateReferralRewards({ poolKobo: 1_000, allocationBps: 100, denominator: 7, members });
  assert.equal(r.allocationKobo, 10);
  assert.ok(r.distributedKobo <= r.allocationKobo);
  assert.equal(r.distributedKobo + r.unallocatedKobo, 10);
});

test("per-member cap limits a single member and the excess is unallocated", () => {
  const r = calculateReferralRewards({ poolKobo: N(1_000_000), allocationBps: 100, denominator: 100, perMemberCapBps: 1_000,
    members: [{ userId: "whale", eligibleReferrals: 90 }, { userId: "small", eligibleReferrals: 10 }] });
  const whale = r.lines.find((l) => l.userId === "whale")!;
  assert.equal(whale.capped, true);
  assert.equal(whale.amountKobo, N(1_000)); // 10% of ₦10,000
  assert.equal(r.unallocatedKobo, N(10_000) - N(1_000) - N(1_000));
});

test("zero pool (pre-launch) yields zero for everyone", () => {
  const r = calculateReferralRewards({ poolKobo: 0, allocationBps: 100, denominator: 50, members: [{ userId: "A", eligibleReferrals: 20 }] });
  assert.equal(r.distributedKobo, 0);
});

test("inconsistent inputs are rejected", () => {
  assert.throws(() => calculateReferralRewards({ poolKobo: 100, allocationBps: 100, denominator: 5, members: [{ userId: "A", eligibleReferrals: 6 }] }), CalcError);
  assert.throws(() => calculateReferralRewards({ poolKobo: 100, allocationBps: 100, denominator: 5, members: [{ userId: "A", eligibleReferrals: 1 }, { userId: "A", eligibleReferrals: 1 }] }), CalcError);
  assert.throws(() => calculateReferralRewards({ poolKobo: 1.5, allocationBps: 100, denominator: 5, members: [] }), CalcError);
});

test("results are reproducible and the input hash is order-independent", () => {
  const a = { poolKobo: 99_999, allocationBps: 100, denominator: 30, members: [{ userId: "x", eligibleReferrals: 3 }, { userId: "y", eligibleReferrals: 11 }] };
  const b = { ...a, members: [...a.members].reverse() };
  assert.deepEqual(calculateReferralRewards(a), calculateReferralRewards(b));
  assert.equal(canonicalInputs({ ...a, runDate: "2026-11-24", configVersion: 1 }), canonicalInputs({ ...b, runDate: "2026-11-24", configVersion: 1 }));
});

test("estimateShare matches the formula", () => {
  const e = estimateShare({ poolKobo: N(1_000_000_000), allocationBps: 100, denominator: 10_000_000, eligibleReferrals: 250 });
  assert.equal(e.amountKobo, N(250));
  assert.ok(Math.abs(e.percentage - 0.0025) < 1e-9);
});

/* ------------------------------ codes & identity ------------------------- */

test("codes are generated in the safe alphabet and normalise user typing", () => {
  for (let i = 0; i < 200; i++) assert.match(generateCode(), CODE_PATTERN);
  assert.equal(normalizeCode(" tbc 7k3m-9q "), "TBC7K3M9Q");
  assert.equal(normalizeCode("TBC7K3M9Q"), "TBC7K3M9Q");
  assert.equal(normalizeCode("TBC0O1IL2"), null); // ambiguous characters never issued
  assert.equal(normalizeCode("<script>"), null);
  assert.equal(normalizeCode(""), null);
});

test("email aliases collapse to one identity", () => {
  assert.equal(normalizeEmail("Ada.Eze+tbc@Gmail.com"), "adaeze@gmail.com");
  assert.equal(normalizeEmail("adaeze@googlemail.com"), "adaeze@gmail.com");
  assert.equal(normalizeEmail("a.b@company.ng"), "a.b@company.ng");
});

test("Nigerian phone numbers normalise to E.164", () => {
  assert.equal(normalizePhone("0803 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("+234 803 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("8031234567"), "+2348031234567");
  assert.equal(normalizePhone("12"), null);
});

test("referral URL uses the configured domain", () => {
  assert.equal(referralUrl("https://thebillionairecircle.club", "TBC7K3M9Q"), "https://thebillionairecircle.club/join?ref=TBC7K3M9Q");
  assert.equal(referralUrl("https://x.test/", "TBC7K3M9Q", "lagos-launch"), "https://x.test/join?ref=TBC7K3M9Q&c=lagos-launch");
  assert.equal(maskName("Adaeze Okafor"), "Adaeze O.");
});

/* ------------------------------ attribution ------------------------------ */

test("attribution: submitted form code wins; link/cookie origin decides the source", () => {
  assert.deepEqual(resolveAttribution({ formCode: "TBC7K3M9Q", linkCode: "TBC7K3M9Q" }), { code: "TBC7K3M9Q", source: "link", campaign: null });
  assert.deepEqual(resolveAttribution({ formCode: "TBC7K3M9Q", cookieCode: "tbc7k3m9q", campaign: "lagos-launch" }), { code: "TBC7K3M9Q", source: "campaign", campaign: "lagos-launch" });
  assert.deepEqual(resolveAttribution({ formCode: "TBCAAAAAA", linkCode: "TBC7K3M9Q" }), { code: "TBCAAAAAA", source: "manual_code", campaign: null });
  assert.deepEqual(resolveAttribution({ formCode: "", linkCode: "TBC7K3M9Q" }), { code: null, source: null, campaign: null }, "clearing the field makes it organic");
  assert.equal(resolveAttribution({ formCode: "TBC7K3M9Q", linkCode: "TBC7K3M9Q", campaign: "BAD SLUG!" }).campaign, null);
});

test("prefill prefers the link on this visit over an older cookie", () => {
  assert.equal(prefillCode("TBC7K3M9Q", "TBCAAAAAA"), "TBC7K3M9Q");
  assert.equal(prefillCode(null, "TBCAAAAAA"), "TBCAAAAAA");
  assert.equal(prefillCode("junk", null), null);
});

/* ------------------------------ risk ------------------------------------- */

const clean = { honeypotFilled: false, formFillMs: 20_000, sameDeviceAsReferrer: false, sameIpAsReferrer: false, referrerIpVelocity1h: 0, referrerVelocity1h: 0, deviceAccounts: 0, disposableEmail: false, nameMatchesReferrer: false };

test("a normal registration is clean", () => {
  const r = scoreRegistration(clean);
  assert.equal(r.block, false);
  assert.ok(r.score < REVIEW_AT);
});

test("a shared network alone never triggers review", () => {
  const r = scoreRegistration({ ...clean, sameIpAsReferrer: true });
  assert.ok(r.score < REVIEW_AT, "family/office/campus networks are legitimate");
});

test("bots are blocked by honeypot or impossible timing", () => {
  assert.equal(scoreRegistration({ ...clean, honeypotFilled: true }).block, true);
  assert.equal(scoreRegistration({ ...clean, formFillMs: 800 }).block, true);
});

test("self-referral patterns go to review", () => {
  assert.ok(scoreRegistration({ ...clean, sameDeviceAsReferrer: true, nameMatchesReferrer: true }).score >= REVIEW_AT);
  assert.ok(scoreRegistration({ ...clean, sameDeviceAsReferrer: true, sameIpAsReferrer: true }).score >= REVIEW_AT);
  assert.ok(scoreRegistration({ ...clean, referrerIpVelocity1h: 8, sameIpAsReferrer: true }).score >= REVIEW_AT);
  assert.ok(scoreRegistration({ ...clean, deviceAccounts: 4, disposableEmail: true }).score >= REVIEW_AT);
  assert.equal(isDisposableEmail("x@mailinator.com"), true);
});

/* ------------------------------ config & levels -------------------------- */

test("levels and progress", () => {
  const l0 = levelFor(0, DEFAULT_CONFIG.levels);
  assert.equal(l0.current, null);
  assert.equal(l0.next?.name, "Circle Starter");
  const l = levelFor(30, DEFAULT_CONFIG.levels);
  assert.equal(l.current?.name, "Circle Ambassador");
  assert.equal(l.next?.name, "Growth Champion");
  assert.equal(l.remaining, 20);
  assert.equal(levelFor(20_000, DEFAULT_CONFIG.levels).next, null);
});

test("live reward runs are blocked by default (pre-launch)", () => {
  assert.equal(DEFAULT_CONFIG.allocationBps, 100, "1% is the proposed default");
  assert.ok(liveRunBlocker(DEFAULT_CONFIG));
  assert.ok(liveRunBlocker({ ...DEFAULT_CONFIG, rewardsState: "active" }));
  assert.ok(liveRunBlocker({ ...DEFAULT_CONFIG, rewardsState: "active", fundingConfirmed: true }));
  assert.equal(liveRunBlocker({ ...DEFAULT_CONFIG, rewardsState: "active", fundingConfirmed: true, legalApprovalRef: "LO-2027-014" }), null);
});

/* ------------------------------ promo wording ---------------------------- */
import { promoViolation } from "../src/lib/referrals/promo.ts";

test("promotional copy guard blocks financial promises but allows disclaimers", () => {
  assert.equal(promoViolation("Join free — it's not an investment and there are no guaranteed returns. {link}"), null);
  assert.equal(promoViolation("Earn daily from your referrals! {link}"), "earn");
  assert.equal(promoViolation("Guaranteed income for life {link}"), "guarantee");
  assert.equal(promoViolation("A great investment opportunity {link}"), "investment");
  assert.equal(promoViolation("Hit the jackpot {link}"), "jackpot");
});
