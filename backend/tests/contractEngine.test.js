import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateContractOffer,
  calculateBackendRoyalty,
  calculateBuyoutPenalty,
} from "../src/services/simulation/engines/contractEngine.js";

describe("Contract Engine Unit Tests", () => {
  test("evaluateContractOffer accepts generous offer for popular talent", () => {
    const offer = { upfrontFee: 3000000, backendRoyaltyPercentage: 10 };
    const result = evaluateContractOffer(offer, 80);
    assert.equal(result.accepted, true);
  });

  test("calculateBackendRoyalty calculates correct percentage payout", () => {
    const payout = calculateBackendRoyalty(100000000, 5);
    assert.equal(payout, 5000000);
  });

  test("calculateBuyoutPenalty scales penalty based on remaining weeks", () => {
    const penaltyShort = calculateBuyoutPenalty(1000000, 2);
    const penaltyLong = calculateBuyoutPenalty(1000000, 10);
    assert.ok(penaltyLong > penaltyShort);
  });
});
