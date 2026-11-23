import { test } from "node:test";
import assert from "node:assert/strict";
import { CONCEPT_INPUTS, SCENARIOS, allocationTotal, runModel, formatNaira, formatOdds, RECOMMENDED_MAX_AWARD_SHARE } from "../src/lib/finance/model.ts";

test("concept inflow is ₦1bn/day and ₦30bn/month", () => {
  const r = runModel(CONCEPT_INPUTS);
  assert.equal(r.grossDaily, 1_000_000_000);
  assert.equal(r.grossMonthly, 30_000_000_000);
});

test("30 × ₦1bn consumes 100% of inflow and is flagged infeasible", () => {
  const r = runModel(CONCEPT_INPUTS);
  assert.equal(r.awardShareOfGross, 1);
  assert.equal(r.nonAwardFunds, 0);
  assert.equal(r.feasible, false);
});

test("at 80% participation the concept is in deficit", () => {
  const r = runModel({ ...CONCEPT_INPUTS, participationRate: 0.8 });
  assert.ok(r.nonAwardFunds < 0);
});

test("every scenario allocation sums to 100%", () => {
  for (const s of SCENARIOS) assert.equal(allocationTotal(s.allocation), 100, s.id);
});

test("recommended scenarios keep awards within their pool", () => {
  for (const s of SCENARIOS.filter((x) => x.id !== "concept")) {
    const r = runModel(s.inputs);
    const awardCost = s.awards.reduce((t, a) => t + a.count * a.amount, 0);
    assert.ok(awardCost <= (r.grossMonthly * s.allocation.awards) / 100 + 1, s.id);
  }
});

test("membership required for 30 × ₦1bn at 40% pool is 25 million", () => {
  assert.equal(runModel(CONCEPT_INPUTS).membersRequired(RECOMMENDED_MAX_AWARD_SHARE), 25_000_000);
});

test("formatting helpers", () => {
  assert.equal(formatNaira(30_000_000_000, { compact: true }), "₦30bn");
  assert.equal(formatNaira(1_250_000, { compact: true, decimals: 2 }), "₦1.25m");
  assert.equal(formatOdds(30 / 10_000_000), "1 in 333,333");
});
