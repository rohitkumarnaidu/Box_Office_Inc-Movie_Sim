// Unit tests for the Market Trends Engine pure functions.
// Run with: node --test backend/tests/
//
// All randomness is injected via a deterministic sequence generator so every
// transition is reproducible — no reliance on Math.random.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  pickWeightedTrend,
  getEligibleTrends,
  advanceTrends,
  getGenreMultiplier,
} from "../src/services/simulation/engines/trendEngine.js";
import { TREND_CONFIG } from "../src/constants/marketStates.js";

// Deterministic RNG: returns the given values in order, then repeats the last.
const seq = (values) => {
  let i = 0;
  return () => {
    const v = values[Math.min(i, values.length - 1)];
    i += 1;
    return v;
  };
};

// --------------------------------------------------------------------------
// pickWeightedTrend
// --------------------------------------------------------------------------

test("pickWeightedTrend returns null for empty candidates", () => {
  assert.equal(pickWeightedTrend([], seq([0.5])), null);
  assert.equal(pickWeightedTrend(null, seq([0.5])), null);
});

test("pickWeightedTrend returns null when all weights are zero", () => {
  const cands = [
    { id: "a", weight: 0 },
    { id: "b", weight: 0 },
  ];
  assert.equal(pickWeightedTrend(cands, seq([0.5])), null);
});

test("pickWeightedTrend respects weight boundaries", () => {
  const cands = [
    { id: "a", weight: 1 }, // covers [0, 1)
    { id: "b", weight: 1 }, // covers [1, 2)
    { id: "c", weight: 1 }, // covers [2, 3)
  ];
  // total weight = 3. roll = rng * 3.
  assert.equal(pickWeightedTrend(cands, seq([0.0])).id, "a"); // 0.0 -> 0
  assert.equal(pickWeightedTrend(cands, seq([0.5])).id, "b"); // 1.5 -> b
  assert.equal(pickWeightedTrend(cands, seq([0.9])).id, "c"); // 2.7 -> c
});

test("pickWeightedTrend favours higher weights", () => {
  const cands = [
    { id: "heavy", weight: 9 }, // covers [0, 9)
    { id: "light", weight: 1 }, // covers [9, 10)
  ];
  assert.equal(pickWeightedTrend(cands, seq([0.5])).id, "heavy"); // 5.0
  assert.equal(pickWeightedTrend(cands, seq([0.95])).id, "light"); // 9.5
});

// --------------------------------------------------------------------------
// getEligibleTrends
// --------------------------------------------------------------------------

test("getEligibleTrends excludes genres that are already active", () => {
  const state = {
    activeTrends: [{ genre: "Horror" }],
    genreCooldowns: {},
  };
  const eligible = getEligibleTrends(state);
  assert.ok(eligible.every((t) => t.genre !== "Horror"));
  // Other genres should still be present.
  assert.ok(eligible.some((t) => t.genre === "Action"));
});

test("getEligibleTrends excludes genres on cooldown", () => {
  const state = {
    activeTrends: [],
    genreCooldowns: { Comedy: 2 },
  };
  const eligible = getEligibleTrends(state);
  assert.ok(eligible.every((t) => t.genre !== "Comedy"));
});

test("getEligibleTrends includes a genre once its cooldown hits zero", () => {
  const state = {
    activeTrends: [],
    genreCooldowns: { Comedy: 0 },
  };
  const eligible = getEligibleTrends(state);
  assert.ok(eligible.some((t) => t.genre === "Comedy"));
});

// --------------------------------------------------------------------------
// advanceTrends — expiry + cooldown
// --------------------------------------------------------------------------

test("advanceTrends expires a trend at its endWeek and sets cooldown", () => {
  const state = {
    activeTrends: [
      { id: "horror-boom", label: "Horror Boom", genre: "Horror", multiplier: 1.35, startWeek: 1, endWeek: 5 },
    ],
    genreCooldowns: {},
  };
  // currentWeek 5 >= endWeek 5 -> expires. High rng -> no new spawn.
  const result = advanceTrends(state, 5, seq([0.99]));
  assert.equal(result.activeTrends.length, 0);
  assert.equal(result.genreCooldowns.Horror, TREND_CONFIG.genreCooldownWeeks);
  assert.ok(result.messages.some((m) => m.includes("faded")));
});

test("advanceTrends keeps a trend that has not yet reached endWeek", () => {
  const state = {
    activeTrends: [
      { id: "scifi-surge", label: "Sci-Fi Surge", genre: "Sci-Fi", multiplier: 1.3, startWeek: 1, endWeek: 8 },
    ],
    genreCooldowns: {},
  };
  // currentWeek 4 < endWeek 8 -> stays. High rng -> no spawn.
  const result = advanceTrends(state, 4, seq([0.99]));
  assert.equal(result.activeTrends.length, 1);
  assert.equal(result.activeTrends[0].id, "scifi-surge");
});

test("advanceTrends ticks down cooldowns each week", () => {
  const state = { activeTrends: [], genreCooldowns: { Comedy: 2 } };
  const result = advanceTrends(state, 10, seq([0.99])); // no spawn
  assert.equal(result.genreCooldowns.Comedy, 1);
});

test("advanceTrends removes cooldown entry once it reaches zero", () => {
  const state = { activeTrends: [], genreCooldowns: { Comedy: 1 } };
  const result = advanceTrends(state, 10, seq([0.99])); // no spawn
  assert.equal(result.genreCooldowns.Comedy, undefined);
});

// --------------------------------------------------------------------------
// advanceTrends — spawning
// --------------------------------------------------------------------------

test("advanceTrends spawns a new trend on a low spawn roll", () => {
  const state = { activeTrends: [], genreCooldowns: {} };
  // rng sequence: [spawnRoll, pickRoll, durationRoll]
  // spawnRoll 0.0 < spawnChancePerWeek -> spawn.
  const result = advanceTrends(state, 1, seq([0.0, 0.0, 0.0]));
  assert.equal(result.activeTrends.length, 1);
  const trend = result.activeTrends[0];
  assert.equal(trend.startWeek, 1);
  assert.ok(trend.endWeek > trend.startWeek);
  assert.ok(result.messages.some((m) => m.includes("Market shift")));
});

test("advanceTrends does NOT spawn on a high spawn roll", () => {
  const state = { activeTrends: [], genreCooldowns: {} };
  // spawnRoll 0.99 >= spawnChancePerWeek -> no spawn.
  const result = advanceTrends(state, 1, seq([0.99]));
  assert.equal(result.activeTrends.length, 0);
});

test("advanceTrends respects maxActiveTrends cap", () => {
  // Fill to the cap with non-expiring trends.
  const active = [];
  for (let i = 0; i < TREND_CONFIG.maxActiveTrends; i += 1) {
    active.push({
      id: `t${i}`,
      label: `T${i}`,
      genre: ["Horror", "Action", "Comedy", "Drama", "Romance"][i],
      multiplier: 1.2,
      startWeek: 1,
      endWeek: 100,
    });
  }
  const state = { activeTrends: active, genreCooldowns: {} };
  // Even with a spawn-favouring roll, we are at the cap -> no new spawn.
  const result = advanceTrends(state, 5, seq([0.0, 0.0, 0.0]));
  assert.equal(result.activeTrends.length, TREND_CONFIG.maxActiveTrends);
});

test("advanceTrends computes duration within the trend's min/max window", () => {
  const state = { activeTrends: [], genreCooldowns: {} };
  // Force spawn (0.0), pick the first eligible (0.0), duration roll 0.0 -> minWeeks.
  const result = advanceTrends(state, 10, seq([0.0, 0.0, 0.0]));
  const trend = result.activeTrends[0];
  const duration = trend.endWeek - trend.startWeek;
  assert.ok(duration >= 3, `duration ${duration} should be >= min 3`);
  assert.ok(duration <= 7, `duration ${duration} should be <= max 7`);
});

// --------------------------------------------------------------------------
// getGenreMultiplier
// --------------------------------------------------------------------------

test("getGenreMultiplier returns neutral when no active trends", () => {
  assert.equal(getGenreMultiplier([], ["Action"]), TREND_CONFIG.neutralMultiplier);
  assert.equal(getGenreMultiplier(null, ["Action"]), TREND_CONFIG.neutralMultiplier);
});

test("getGenreMultiplier returns neutral when movie has no genres", () => {
  const active = [{ genre: "Action", multiplier: 1.4 }];
  assert.equal(getGenreMultiplier(active, []), TREND_CONFIG.neutralMultiplier);
  assert.equal(getGenreMultiplier(active, null), TREND_CONFIG.neutralMultiplier);
});

test("getGenreMultiplier returns neutral when no genre matches", () => {
  const active = [{ genre: "Horror", multiplier: 1.35 }];
  assert.equal(getGenreMultiplier(active, ["Comedy"]), 1);
});

test("getGenreMultiplier applies a single matching boost", () => {
  const active = [{ genre: "Action", multiplier: 1.4 }];
  assert.equal(getGenreMultiplier(active, ["Action"]), 1.4);
});

test("getGenreMultiplier applies a single matching fatigue penalty", () => {
  const active = [{ genre: "Horror", multiplier: 0.7 }];
  assert.equal(getGenreMultiplier(active, ["Horror"]), 0.7);
});

test("getGenreMultiplier compounds multiple matching trends", () => {
  const active = [
    { genre: "Action", multiplier: 1.5 },
    { genre: "Sci-Fi", multiplier: 1.2 },
  ];
  // Movie is both Action and Sci-Fi -> 1.5 * 1.2 = 1.8 (float-safe compare).
  const result = getGenreMultiplier(active, ["Action", "Sci-Fi"]);
  assert.ok(Math.abs(result - 1.8) < 1e-9, `expected ~1.8, got ${result}`);
});

test("getGenreMultiplier nets a boom against a fatigue", () => {
  const active = [
    { genre: "Action", multiplier: 1.4 },
    { genre: "Horror", multiplier: 0.7 },
  ];
  // Movie tagged both -> 1.4 * 0.7 = 0.98.
  const result = getGenreMultiplier(active, ["Action", "Horror"]);
  assert.ok(Math.abs(result - 0.98) < 1e-9, `expected ~0.98, got ${result}`);
});
