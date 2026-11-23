import { test } from "node:test";
import assert from "node:assert/strict";
import { payments, selection, identity, FeatureNotApprovedError } from "../src/lib/modules/index.ts";

test("regulated modules are disabled by default", async () => {
  await assert.rejects(payments.initiate({ memberId: "x", amountKobo: 10000, days: [], channel: "card" }), FeatureNotApprovedError);
  await assert.rejects(selection.select({ periodId: "p", eligibilitySnapshotHash: "h", awards: [] }), FeatureNotApprovedError);
  await assert.rejects(identity.verify({ memberId: "x", fullName: "A", dob: "2000-01-01" }), FeatureNotApprovedError);
});
