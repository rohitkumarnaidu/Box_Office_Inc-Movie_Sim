// Unit tests for the Global Random Event Engine.
// Run with: node --test "tests/**/*.test.js"
//
// All randomness is injected via a deterministic sequence generator so every
// roll, selection, and effect is reproducible — no reliance on Math.random.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  pickWeightedEvent,
  getEligibleEvents,
  applyEventEffects,
  rollEvents,
  processRandomEvents,
} from "../src/services/simulation/engines/eventEngine.js";
import { EVENT_CONFIG } from "../src/constants/eventTypes.js";

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
// pickWeightedEvent
// --------------------------------------------------------------------------

test("pickWeightedEvent returns null for empty/null candidates", () => {
  assert.equal(pickWeightedEvent([], seq([0.5])), null);
  assert.equal(pickWeightedEvent(null, seq([0.5])), null);
});

test("pickWeightedEvent returns null when all effective weights are zero", () => {
  const cands = [
    { id: "a", weight: 0, rarity: "common" },
    { id: "b", weight: 0, rarity: "common" },
  ];
  assert.equal(pickWeightedEvent(cands, seq([0.5])), null);
});

test("pickWeightedEvent respects weight boundaries (common rarity = x1)", () => {
  const cands = [
    { id: "a", weight: 1, rarity: "common" }, // eff 1 -> [0,1)
    { id: "b", weight: 1, rarity: "common" }, // eff 1 -> [1,2)
    { id: "c", weight: 1, rarity: "common" }, // eff 1 -> [2,3)
  ];
  assert.equal(pickWeightedEvent(cands, seq([0.0])).id, "a");
  assert.equal(pickWeightedEvent(cands, seq([0.5])).id, "b");
  assert.equal(pickWeightedEvent(cands, seq([0.9])).id, "c");
});

test("pickWeightedEvent applies rarity multiplier to effective weight", () => {
  // common weight 10 -> eff 10; rare weight 10 -> eff 3. Total 13.
  const cands = [
    { id: "common", weight: 10, rarity: "common" },
    { id: "rare", weight: 10, rarity: "rare" },
  ];
  assert.equal(pickWeightedEvent(cands, seq([0.0])).id, "common");
  assert.equal(pickWeightedEvent(cands, seq([0.99])).id, "rare");
});

// --------------------------------------------------------------------------
// getEligibleEvents
// --------------------------------------------------------------------------

test("getEligibleEvents returns the full catalogue when no cooldowns", () => {
  const eligible = getEligibleEvents({});
  assert.ok(eligible.length > 0);
});

test("getEligibleEvents excludes events on active cooldown", () => {
  const eligible = getEligibleEvents({ "actor-scandal": 3 });
  assert.ok(eligible.every((e) => e.id !== "actor-scandal"));
});

test("getEligibleEvents includes an event whose cooldown has reached zero", () => {
  const eligible = getEligibleEvents({ "actor-scandal": 0 });
  assert.ok(eligible.some((e) => e.id === "actor-scandal"));
});

// --------------------------------------------------------------------------
// applyEventEffects
// --------------------------------------------------------------------------

test("applyEventEffects applies a flat positive effect", () => {
  const stats = { money: 1000000, fans: 100, prestige: 10 };
  const event = { effects: [{ target: "money", type: "flat", value: 500000 }] };
  const { stats: next, changes } = applyEventEffects(stats, event);
  assert.equal(next.money, 1500000);
  assert.deepEqual(changes, [{ target: "money", delta: 500000 }]);
});

test("applyEventEffects applies a percent effect (rounded)", () => {
  const stats = { money: 0, fans: 1000, prestige: 0 };
  const event = { effects: [{ target: "fans", type: "percent", value: 8 }] };
  const { stats: next, changes } = applyEventEffects(stats, event);
  assert.equal(next.fans, 1080); // 1000 + 8%
  assert.deepEqual(changes, [{ target: "fans", delta: 80 }]);
});

test("applyEventEffects floors a stat at zero and reports the clamped delta", () => {
  const stats = { money: 100000, fans: 0, prestige: 0 };
  // -600000 flat would go negative; floor at 0, actual delta is -100000.
  const event = { effects: [{ target: "money", type: "flat", value: -600000 }] };
  const { stats: next, changes } = applyEventEffects(stats, event);
  assert.equal(next.money, 0);
  assert.deepEqual(changes, [{ target: "money", delta: -100000 }]);
});

test("applyEventEffects clamps an over-large percent to the configured cap", () => {
  const stats = { money: 1000000, fans: 0, prestige: 0 };
  const event = { effects: [{ target: "money", type: "percent", value: 50 }] };
  const { stats: next } = applyEventEffects(stats, event);
  const expected = 1000000 + Math.round((1000000 * EVENT_CONFIG.maxPercentMagnitude) / 100);
  assert.equal(next.money, expected);
});

test("applyEventEffects clamps an over-large flat amount to the configured cap", () => {
  const stats = { money: 0, fans: 0, prestige: 0 };
  const event = { effects: [{ target: "money", type: "flat", value: 9999999 }] };
  const { stats: next } = applyEventEffects(stats, event);
  assert.equal(next.money, EVENT_CONFIG.maxFlatMagnitude);
});

test("applyEventEffects applies multiple effects in one event", () => {
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const event = {
    effects: [
      { target: "money", type: "flat", value: 200000 },
      { target: "fans", type: "percent", value: 10 },
    ],
  };
  const { stats: next } = applyEventEffects(stats, event);
  assert.equal(next.money, 1200000);
  assert.equal(next.fans, 1100);
});

test("applyEventEffects ignores unknown targets safely", () => {
  const stats = { money: 100, fans: 100, prestige: 100 };
  const event = { effects: [{ target: "reputation", type: "flat", value: 50 }] };
  const { stats: next, changes } = applyEventEffects(stats, event);
  assert.deepEqual(next, { money: 100, fans: 100, prestige: 100 });
  assert.equal(changes.length, 0);
});

// --------------------------------------------------------------------------
// rollEvents
// --------------------------------------------------------------------------

test("rollEvents fires nothing when the trigger roll is above baseTriggerChance", () => {
  const state = { cooldowns: {} };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.99]));
  assert.equal(result.fired.length, 0);
  assert.deepEqual(result.stats, stats);
});

test("rollEvents fires an event when the trigger roll is below baseTriggerChance", () => {
  const state = { cooldowns: {} };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.0, 0.0]));
  assert.equal(result.fired.length, 1);
  const firedId = result.fired[0].id;
  assert.ok(result.cooldowns[firedId] > 0);
});

test("rollEvents ticks down existing cooldowns each week", () => {
  const state = { cooldowns: { "actor-scandal": 3 } };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.99]));
  assert.equal(result.cooldowns["actor-scandal"], 2);
});

test("rollEvents drops a cooldown entry once it reaches zero", () => {
  const state = { cooldowns: { "actor-scandal": 1 } };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.99]));
  assert.equal(result.cooldowns["actor-scandal"], undefined);
});

test("rollEvents never fires more than maxEventsPerTick", () => {
  const state = { cooldowns: {} };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.0]));
  assert.ok(result.fired.length <= EVENT_CONFIG.maxEventsPerTick);
});

test("rollEvents applies the fired event's effect to the returned stats", () => {
  const state = { cooldowns: {} };
  const stats = { money: 1000000, fans: 1000, prestige: 10 };
  const result = rollEvents(state, stats, seq([0.0, 0.0]));
  if (result.fired.length > 0) {
    const changed =
      result.stats.money !== stats.money ||
      result.stats.fans !== stats.fans ||
      result.stats.prestige !== stats.prestige;
    assert.ok(changed, "fired event should change at least one stat");
  }
});

// --------------------------------------------------------------------------
// processRandomEvents (stateful entry point)
// --------------------------------------------------------------------------

test("processRandomEvents initialises randomEvents on first call (backward-compat)", () => {
  const gameState = { currentWeek: 5, notifications: [] };
  const studio = { money: 1000000, fans: 1000, prestige: 10 };
  processRandomEvents(gameState, studio, seq([0.99]));
  assert.ok(gameState.randomEvents);
  assert.deepEqual(gameState.randomEvents.cooldowns, {});
  assert.deepEqual(gameState.randomEvents.history, []);
});

test("processRandomEvents writes stat changes back to the studio and notifies", () => {
  const gameState = { currentWeek: 5, notifications: [] };
  const studio = { money: 1000000, fans: 1000, prestige: 10 };
  const fired = processRandomEvents(gameState, studio, seq([0.0, 0.0]));
  assert.equal(fired.length, 1);
  assert.equal(gameState.notifications.length, 1);
  assert.match(gameState.notifications[0].message, /Industry Event/);
  assert.equal(gameState.randomEvents.history.length, 1);
  assert.equal(gameState.randomEvents.history[0].week, 5);
});

test("processRandomEvents is a no-op on the studio when nothing fires", () => {
  const gameState = { currentWeek: 5, notifications: [] };
  const studio = { money: 1000000, fans: 1000, prestige: 10 };
  processRandomEvents(gameState, studio, seq([0.99]));
  assert.equal(studio.money, 1000000);
  assert.equal(studio.fans, 1000);
  assert.equal(studio.prestige, 10);
  assert.equal(gameState.notifications.length, 0);
});

test("processRandomEvents caps history at 50 entries", () => {
  const gameState = {
    currentWeek: 100,
    notifications: [],
    randomEvents: {
      cooldowns: {},
      history: Array.from({ length: 50 }, (_, i) => ({ id: `old${i}`, label: "Old", week: i })),
    },
  };
  const studio = { money: 1000000, fans: 1000, prestige: 10 };
  processRandomEvents(gameState, studio, seq([0.0, 0.0]));
  assert.ok(gameState.randomEvents.history.length <= 50);
  const last = gameState.randomEvents.history[gameState.randomEvents.history.length - 1];
  assert.equal(last.week, 100);
});
