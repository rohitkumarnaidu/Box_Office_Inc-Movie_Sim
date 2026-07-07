/**
 * @fileoverview Unit tests for the canonical getVerdict() function and its
 * threshold boundaries. These tests ensure that every engine using the shared
 * verdict logic returns identical results for any given ROI.
 *
 * Issue #189 — all verdict thresholds must come from a single source of truth
 * (backend/src/constants/verdicts.js) so that boxOfficeEngine and
 * rivalStudioEngine agree on every ROI value.
 */

import test from "node:test";
import assert from "node:assert";
import {
  getVerdict,
  VERDICTS,
  VERDICT_TIERS,
  VERDICT_THRESHOLDS,
} from "../src/constants/verdicts.js";

// ---------------------------------------------------------------------------
// 1. Exact boundary values
// ---------------------------------------------------------------------------

test("getVerdict: -0.5 (boundary) returns FLOP (not DISASTER)", () => {
  // DISASTER < -0.5, FLOP starts at -0.5
  assert.strictEqual(getVerdict(-0.5), VERDICTS.FLOP);
});

test("getVerdict: 0 (boundary) returns AVERAGE (not FLOP)", () => {
  // FLOP < 0, AVERAGE starts at 0
  assert.strictEqual(getVerdict(0), VERDICTS.AVERAGE);
});

test("getVerdict: 0.25 (boundary) returns AVERAGE (not HIT)", () => {
  // AVERAGE ≤ 0.25, HIT starts above 0.25
  assert.strictEqual(getVerdict(0.25), VERDICTS.AVERAGE);
});

test("getVerdict: 1.0 (boundary) returns HIT (not BLOCKBUSTER)", () => {
  // HIT ≤ 1.0, BLOCKBUSTER starts above 1.0
  assert.strictEqual(getVerdict(1.0), VERDICTS.HIT);
});

test("getVerdict: 3.0 (boundary) returns BLOCKBUSTER (not ALL_TIME_BLOCKBUSTER)", () => {
  // BLOCKBUSTER ≤ 3.0, ALL_TIME_BLOCKBUSTER starts above 3.0
  assert.strictEqual(getVerdict(3.0), VERDICTS.BLOCKBUSTER);
});

// ---------------------------------------------------------------------------
// 2. Values just below each boundary
// ---------------------------------------------------------------------------

test("getVerdict: just below -0.5 returns DISASTER", () => {
  assert.strictEqual(getVerdict(-0.5001), VERDICTS.DISASTER);
});

test("getVerdict: just below 0 returns FLOP", () => {
  assert.strictEqual(getVerdict(-0.001), VERDICTS.FLOP);
});

test("getVerdict: just above 0.25 returns HIT", () => {
  assert.strictEqual(getVerdict(0.251), VERDICTS.HIT);
});

test("getVerdict: just above 1.0 returns BLOCKBUSTER", () => {
  assert.strictEqual(getVerdict(1.001), VERDICTS.BLOCKBUSTER);
});

test("getVerdict: just above 3.0 returns ALL_TIME_BLOCKBUSTER", () => {
  assert.strictEqual(getVerdict(3.001), VERDICTS.ALL_TIME_BLOCKBUSTER);
});

// ---------------------------------------------------------------------------
// 3. Mid-range values (well within each tier)
// ---------------------------------------------------------------------------

test("getVerdict: mid-range values return expected verdicts", () => {
  assert.strictEqual(getVerdict(-10),  VERDICTS.DISASTER);
  assert.strictEqual(getVerdict(-0.1), VERDICTS.FLOP);
  assert.strictEqual(getVerdict(0.1),  VERDICTS.AVERAGE);
  assert.strictEqual(getVerdict(0.5),  VERDICTS.HIT);
  assert.strictEqual(getVerdict(2.0),  VERDICTS.BLOCKBUSTER);
  assert.strictEqual(getVerdict(10),   VERDICTS.ALL_TIME_BLOCKBUSTER);
});

// ---------------------------------------------------------------------------
// 4. Edge cases
// ---------------------------------------------------------------------------

test("getVerdict: extremely negative ROI returns DISASTER", () => {
  assert.strictEqual(getVerdict(-1e6), VERDICTS.DISASTER);
});

test("getVerdict: extremely high ROI returns ALL_TIME_BLOCKBUSTER", () => {
  assert.strictEqual(getVerdict(1e6), VERDICTS.ALL_TIME_BLOCKBUSTER);
});

test("getVerdict: NaN and undefined are handled gracefully", () => {
  // NaN comparisons always return false, so it cascades to the last return
  assert.strictEqual(getVerdict(NaN), VERDICTS.ALL_TIME_BLOCKBUSTER, "NaN should fall through to ALL_TIME_BLOCKBUSTER");
  // undefined becomes NaN in the comparison
  assert.strictEqual(getVerdict(undefined), VERDICTS.ALL_TIME_BLOCKBUSTER, "undefined should fall through to ALL_TIME_BLOCKBUSTER");
});

// ---------------------------------------------------------------------------
// 5. VERDICT_TIERS data structure integrity
// ---------------------------------------------------------------------------

test("VERDICT_TIERS covers all VERDICTS values exactly once", () => {
  const covered = VERDICT_TIERS.map((t) => t.verdict);
  for (const v of Object.values(VERDICTS)) {
    assert.ok(covered.includes(v), `${v} should appear in VERDICT_TIERS`);
  }
  assert.strictEqual(covered.length, Object.keys(VERDICTS).length,
    "VERDICT_TIERS should have the same count as VERDICTS");
});

test("VERDICT_TIERS is sorted by min ascending", () => {
  for (let i = 1; i < VERDICT_TIERS.length; i++) {
    assert.ok(
      VERDICT_TIERS[i - 1].min <= VERDICT_TIERS[i].min,
      `Tier ${i - 1} min (${VERDICT_TIERS[i - 1].min}) should be ≤ tier ${i} min (${VERDICT_TIERS[i].min})`
    );
  }
});

// ---------------------------------------------------------------------------
// 6. VERDICT_THRESHOLDS data structure integrity
// ---------------------------------------------------------------------------

test("VERDICT_THRESHOLDS covers every VERDICTS entry", () => {
  for (const v of Object.values(VERDICTS)) {
    assert.ok(VERDICT_THRESHOLDS[v] !== undefined,
      `${v} should have an entry in VERDICT_THRESHOLDS`);
  }
  assert.strictEqual(
    Object.keys(VERDICT_THRESHOLDS).length,
    Object.keys(VERDICTS).length,
    "VERDICT_THRESHOLDS should have the same entry count as VERDICTS"
  );
});

// ---------------------------------------------------------------------------
// 7. Consistency across thresholds and logical expectations
// ---------------------------------------------------------------------------

test("getVerdict: worse ROI never produces a better verdict", () => {
  // Monotonicity check — a set of ascending ROIs should produce
  // non-decreasing verdicts (where each tier is "better" than the last).
  const testROIs = [-1, -0.5, -0.25, 0, 0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0];
  const tierOrder = Object.values(VERDICTS);

  let prevIndex = -1;
  for (const roi of testROIs) {
    const verdict = getVerdict(roi);
    const idx = tierOrder.indexOf(verdict);
    assert.ok(
      idx >= prevIndex,
      `ROI ${roi} → ${verdict} (index ${idx}) should be ≥ previous index ${prevIndex}`
    );
    prevIndex = idx;
  }
});
