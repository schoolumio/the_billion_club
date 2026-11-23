import { test } from "node:test";
import assert from "node:assert/strict";
import { can } from "../src/lib/auth/roles.ts";

test("members cannot access administration", () => {
  assert.equal(can("member", "admin:view"), false);
  assert.equal(can("member", "admin:finance"), false);
  assert.equal(can("member", "member:dashboard"), true);
});

test("support staff see members and tickets but not finance or audit", () => {
  assert.equal(can("support", "admin:members"), true);
  assert.equal(can("support", "admin:support:write"), true);
  assert.equal(can("support", "admin:finance"), false);
  assert.equal(can("support", "admin:audit"), false);
});

test("auditors read finance and audit logs but cannot work tickets", () => {
  assert.equal(can("auditor", "admin:finance"), true);
  assert.equal(can("auditor", "admin:audit"), true);
  assert.equal(can("auditor", "admin:support:write"), false);
});

test("unauthenticated is denied", () => {
  assert.equal(can(null, "member:dashboard"), false);
});
