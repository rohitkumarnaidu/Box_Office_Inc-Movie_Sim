import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateRegionalBreakdown, computeScreenDecay } from "../src/utils/boxOfficeAnalytics.js";
import { generateBoxOffice } from "../src/services/simulation/engines/boxOfficeEngine.js";

describe("Box Office Analytics Unit Tests", () => {
  test("calculateRegionalBreakdown generates non-negative regional shares", () => {
    const split = calculateRegionalBreakdown(1000000);
    assert.equal(split.totalWorldwide, 1000000);
    assert.ok(split.northAmerica > 0);
    assert.ok(split.europe > 0);
    assert.ok(split.asiaPacific > 0);
    assert.ok(split.latinAmerica > 0);
  });

  test("computeScreenDecay reduces screens over time", () => {
    const week1 = computeScreenDecay(1, 2000, 80);
    const week3 = computeScreenDecay(3, 2000, 80);
    assert.equal(week1, 2000);
    assert.ok(week3 < week1);
  });

  test("generateBoxOffice returns regionalSplit in calculation output", () => {
    const movie = { quality: 80, criticScore: 75, audienceScore: 85, hype: 80, budget: 10000000, marketingBudget: 5000000 };
    const leadActor = { popularity: 90 };
    const result = generateBoxOffice(movie, leadActor, null, 1);

    assert.ok(result.regionalSplit);
    assert.ok(result.regionalSplit.northAmerica > 0);
    assert.ok(result.regionalSplit.europe > 0);
  });
});
