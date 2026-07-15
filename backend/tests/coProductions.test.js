import test from "node:test";
import assert from "node:assert";
import { processStudioGrowth } from "../src/services/simulation/engines/studioGrowthEngine.js";

test("coProductions: splits profit correctly with co-producer", () => {
  const gameState = { currentWeek: 1 };
  const studio = {
    money: 1000000,
    fans: 1000,
    prestige: 50,
    save: async () => {},
  };
  const movie = {
    _id: "movie-123",
    title: "Partner Film",
    profit: 500000,
    worldwideGross: 1000000,
    audienceScore: 80,
    criticScore: 85,
    quality: 80,
    verdict: "HIT",
    coProducerShare: 30, // 30% co-producer share
  };

  processStudioGrowth(gameState, studio, movie);

  // Player gets (100% - 30%) = 70% of profit.
  // 70% of 500,000 = 350,000.
  // New studio balance: 1,000,000 + 350,000 = 1,350,000.
  assert.strictEqual(studio.money, 1350000);
});
