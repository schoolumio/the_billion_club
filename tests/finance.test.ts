import { test } from "node:test";
import assert from "node:assert/strict";
import { ADOPTED, ADOPTED_ALLOCATION, CONCEPT_INPUTS, SCENARIOS, adoptedAwards, allocationTotal, runModel, tieredAwards, formatNaira, formatOdds } from "../src/lib/finance/model.ts";

test("10M daily places × ₦100 × 30 days = ₦30bn", () => {
  const r = runModel(CONCEPT_INPUTS);
  assert.equal(r.grossDaily, 1_000_000_000);
  assert.equal(r.grossMonthly, 30_000_000_000);
});

test("daily cap limits inflow even with more registered members", () => {
  const r = runModel({ ...CONCEPT_INPUTS, members: 25_000_000 });
  assert.equal(r.placesPerDay, 10_000_000);
  assert.equal(r.capReached, true);
  assert.equal(r.grossMonthly, 30_000_000_000);
});

test("below the cap, places = members × participation", () => {
  const r = runModel({ ...CONCEPT_INPUTS, participationRate: 0.8 });
  assert.equal(r.placesPerDay, 8_000_000);
  assert.equal(r.capReached, false);
});

test("original concept consumes 100% of inflow", () => {
  const r = runModel(CONCEPT_INPUTS);
  assert.equal(r.awardShareOfGross, 1);
  assert.equal(r.feasible, false);
});

test("every scenario allocation sums to 100%", () => {
  for (const s of SCENARIOS) assert.equal(allocationTotal(s.allocation), 100, s.id);
});

test("adopted policy is 60/40 with 12% business fund", () => {
  assert.equal(ADOPTED_ALLOCATION.awards, 60);
  assert.equal(100 - ADOPTED_ALLOCATION.awards, 40);
  assert.equal(ADOPTED_ALLOCATION.business, 12);
});

test("full capacity: 3 × ₦1bn + 27 × ≈₦556m = ₦18bn", () => {
  const a = adoptedAwards(runModel(ADOPTED.inputs).grossMonthly);
  assert.equal(a.pool, 18_000_000_000);
  assert.equal(a.tiered, true);
  assert.equal(a.grand.count * a.grand.amount, 3_000_000_000);
  assert.equal(Math.round(a.enterprise.amount / 1e6), 556);
  assert.equal(a.grand.count * a.grand.amount + a.enterprise.count * a.enterprise.amount, a.pool);
});

test("awards never exceed the pool and fall back to equal shares below ₦5bn", () => {
  for (const pool of [1e9, 4.9e9, 5e9, 9e9, 18e9]) {
    const a = tieredAwards(pool);
    const total = a.grand.count * a.grand.amount + a.enterprise.count * a.enterprise.amount;
    assert.ok(Math.abs(total - pool) < 1, String(pool));
    assert.equal(a.grand.count + a.enterprise.count, 30);
  }
  assert.equal(tieredAwards(1.8e9).tiered, false);
  assert.equal(tieredAwards(1.8e9).enterprise.amount, 60_000_000);
});

test("80% of places sold → 3 × ₦1bn + 27 × ≈₦422m", () => {
  const a = adoptedAwards(runModel({ ...ADOPTED.inputs, participationRate: 0.8 }).grossMonthly);
  assert.equal(Math.round(a.enterprise.amount / 1e6), 422);
});

test("formatting helpers", () => {
  assert.equal(formatNaira(30_000_000_000, { compact: true }), "₦30bn");
  assert.equal(formatNaira(1_250_000, { compact: true, decimals: 2 }), "₦1.25m");
  assert.equal(formatOdds(30 / 10_000_000), "1 in 333,333");
});
