import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateUniverseSynergy } from "../src/utils/franchiseSynergyCalculator.js";
import { calculateCrossoverHype } from "../src/services/simulation/engines/franchiseEngine.js";

describe("Franchise Ecosystem Unit Tests", () => {
  test("calculateUniverseSynergy applies quality bonus and fatigue penalty", () => {
    const synergy = calculateUniverseSynergy(3, 90);
    assert.ok(synergy.netMultiplier >= 1.0);
    assert.ok(synergy.hypeBonus > 0);
  });

  test("calculateCrossoverHype boosts hype with sub-franchise count", () => {
    const crossoverMultiplier = calculateCrossoverHype(3, 90);
    assert.ok(crossoverMultiplier > 1.0);
  });
});
