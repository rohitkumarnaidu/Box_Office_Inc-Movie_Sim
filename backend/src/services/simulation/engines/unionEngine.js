import { addNotification } from "../helpers/notificationHelper.js";

/**
 * Crew Union Engine (issue #285)
 *
 * Manages union satisfaction and strike states.
 */
export const processUnionSatisfaction = (gameState, studio) => {
  if (!gameState.crewUnion) {
    gameState.crewUnion = { satisfaction: 100, isStriking: false, strikeStartWeek: null };
  }

  // If already striking, no natural recovery or checks needed
  if (gameState.crewUnion.isStriking) {
    return;
  }

  // Natural recovery if no delays occurred
  if (!gameState.productionDelayHappened) {
    gameState.crewUnion.satisfaction = Math.min(100, (gameState.crewUnion.satisfaction || 100) + 2);
  } else {
    // Reset the temp flag for next week
    gameState.productionDelayHappened = false;
  }

  // Check if satisfaction fell below 20% to trigger a strike
  if (gameState.crewUnion.satisfaction < 20 && !gameState.crewUnion.isStriking) {
    gameState.crewUnion.isStriking = true;
    gameState.crewUnion.strikeStartWeek = gameState.currentWeek;
    addNotification(
      gameState,
      "STRIKE: The film crew union has declared a strike due to low satisfaction! All active productions are halted."
    );
  }
};

/**
 * Resolve strike by paying a settlement fee.
 */
export const resolveStrike = async (gameState, studio) => {
  if (!gameState.crewUnion || !gameState.crewUnion.isStriking) {
    throw new Error("No active strike to resolve.");
  }

  // Settlement fee: ₹1,500,000
  const SETTLEMENT_FEE = 1500000;
  if (Number(studio.money || 0) < SETTLEMENT_FEE) {
    throw new Error("Insufficient funds to pay the union settlement fee.");
  }

  studio.money = Math.max(0, Number(studio.money || 0) - SETTLEMENT_FEE);
  gameState.crewUnion.isStriking = false;
  gameState.crewUnion.strikeStartWeek = null;
  gameState.crewUnion.satisfaction = 50; // Reset to a neutral 50%

  addNotification(
    gameState,
    `Paid ₹${SETTLEMENT_FEE.toLocaleString("en-IN")} to settle with the crew union. Strike ended.`
  );

  await studio.save();
  await gameState.save();
};
