import test from "node:test";
import assert from "node:assert";
import { getSoundtrackBoosts, SOUNDTRACK_TIERS } from "../src/constants/soundtrackTiers.js";

test("soundtracks: calculates correct boosts for public domain tier", () => {
  const boosts = getSoundtrackBoosts("PUBLIC_DOMAIN", ["Drama"]);
  assert.strictEqual(boosts.qualityBoost, 0);
  assert.strictEqual(boosts.hypeBoost, 0);
});

test("soundtracks: calculates correct boosts for indie tier without special genre", () => {
  const boosts = getSoundtrackBoosts("INDIE", ["Drama"]);
  assert.strictEqual(boosts.qualityBoost, SOUNDTRACK_TIERS.INDIE.qualityBoost);
  assert.strictEqual(boosts.hypeBoost, SOUNDTRACK_TIERS.INDIE.hypeBoost);
});

test("soundtracks: applies genre affinity bonus for romance/action genres", () => {
  const boosts = getSoundtrackBoosts("PREMIUM", ["Romance", "Comedy"]);
  // Premium base is 12 quality, 15 hype. With Romance, should get +5 to both.
  assert.strictEqual(boosts.qualityBoost, SOUNDTRACK_TIERS.PREMIUM.qualityBoost + 5);
  assert.strictEqual(boosts.hypeBoost, SOUNDTRACK_TIERS.PREMIUM.hypeBoost + 5);
});
