import test from "node:test";
import assert from "node:assert";
import { processUnionSatisfaction, resolveStrike } from "../src/services/simulation/engines/unionEngine.js";

test("unionEngine: initializes crewUnion if not present", () => {
  const gameState = { currentWeek: 1, notifications: [] };
  const studio = {};

  processUnionSatisfaction(gameState, studio);

  assert.ok(gameState.crewUnion);
  assert.strictEqual(gameState.crewUnion.satisfaction, 100);
  assert.strictEqual(gameState.crewUnion.isStriking, false);
});

test("unionEngine: satisfaction drops on delay and triggers strike when below 20", () => {
  const gameState = {
    currentWeek: 2,
    notifications: [],
    productionDelayHappened: true,
    crewUnion: { satisfaction: 30, isStriking: false, strikeStartWeek: null }
  };
  const studio = {};

  // Before processing, satisfy natural recovery behavior: since productionDelayHappened is true, satisfaction should NOT recover.
  // Actually, satisfaction is adjusted directly in productionEngine when delays occur.
  // Then processUnionSatisfaction checks if it has dropped below 20.
  // Let's simulate a drop in satisfaction to 15:
  gameState.crewUnion.satisfaction = 15;

  processUnionSatisfaction(gameState, studio);

  assert.strictEqual(gameState.crewUnion.isStriking, true);
  assert.strictEqual(gameState.crewUnion.strikeStartWeek, 2);
  assert.strictEqual(gameState.productionDelayHappened, false); // gets reset
});

test("unionEngine: satisfaction recovers naturally if no delays", () => {
  const gameState = {
    currentWeek: 3,
    notifications: [],
    productionDelayHappened: false,
    crewUnion: { satisfaction: 80, isStriking: false, strikeStartWeek: null }
  };
  const studio = {};

  processUnionSatisfaction(gameState, studio);

  assert.strictEqual(gameState.crewUnion.satisfaction, 82);
});

test("unionEngine: resolveStrike ends strike and charges money", async () => {
  const gameState = {
    currentWeek: 4,
    notifications: [],
    crewUnion: { satisfaction: 10, isStriking: true, strikeStartWeek: 2 },
    save: async () => {}
  };
  const studio = {
    money: 2000000,
    save: async () => {}
  };

  await resolveStrike(gameState, studio);

  assert.strictEqual(gameState.crewUnion.isStriking, false);
  assert.strictEqual(gameState.crewUnion.satisfaction, 50);
  assert.strictEqual(studio.money, 500000); // 2000000 - 1500000
});
