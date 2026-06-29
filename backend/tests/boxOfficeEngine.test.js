import test from 'node:test';
import assert from 'node:assert';
import { generateBoxOffice } from '../src/services/simulation/engines/boxOfficeEngine.js';

test('Box Office Engine - generateBoxOffice returns expected structure', () => {
  const movie = {
    quality: 50,
    criticScore: 50,
    audienceScore: 50,
    hype: 50,
    budget: 10000000,
    marketingBudget: 5000000
  };
  const leadActor = { popularity: 50 };
  const director = {};

  const result = generateBoxOffice(movie, leadActor, director);

  assert.ok(result.openingWeekend > 0, 'Opening weekend should be > 0');
  assert.ok(result.worldwideGross > 0, 'Worldwide gross should be > 0');
  assert.strictEqual(result.domesticGross + result.internationalGross, result.worldwideGross, 'Domestic + International should equal Worldwide');
  assert.strictEqual(typeof result.profit, 'number', 'Profit should be a number');
  assert.strictEqual(typeof result.roi, 'number', 'ROI should be a number');
  assert.strictEqual(typeof result.verdict, 'string', 'Verdict should be a string');
});

test('Box Office Engine - balanced distribution over 1000 trials', () => {
  const results = {
    DISASTER: 0,
    FLOP: 0,
    AVERAGE: 0,
    HIT: 0,
    BLOCKBUSTER: 0,
    LEGENDARY: 0
  };

  const NUM_TRIALS = 1000;

  for (let i = 0; i < NUM_TRIALS; i++) {
    const budget = 1000000 + Math.random() * 99000000; // 1M to 100M
    const marketingBudget = budget * (0.1 + Math.random() * 0.4); // 10% to 50% of budget

    const movie = {
      quality: Math.floor(Math.random() * 100),
      criticScore: Math.floor(Math.random() * 100),
      audienceScore: Math.floor(Math.random() * 100),
      hype: Math.floor(Math.random() * 100),
      budget,
      marketingBudget
    };

    const leadActor = {
      popularity: Math.floor(Math.random() * 100)
    };

    const res = generateBoxOffice(movie, leadActor, {});
    results[res.verdict]++;
  }

  // We expect roughly:
  // ~5-15% Disaster
  // ~10-25% Flop
  // ~10-25% Average
  // ~25-45% Hit
  // ~15-30% Blockbuster
  // ~1-10% Legendary
  // We will just assert that none of them are 0, and that no single category dominates > 60%

  for (const [verdict, count] of Object.entries(results)) {
    assert.ok(count > 0, `Expected at least some ${verdict} results`);
    assert.ok(count < NUM_TRIALS * 0.6, `${verdict} should not dominate the distribution (got ${count})`);
  }
});
