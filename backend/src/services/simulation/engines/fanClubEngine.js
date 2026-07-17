import { addNotification } from "../helpers/notificationHelper.js";

/**
 * Fan Club Engine (issue #284)
 *
 * Processes weekly fan club growth and deductions.
 */
export const processFanClubTick = (gameState, studio) => {
  if (!studio.fanClub) {
    studio.fanClub = { weeklyBudget: 0, totalFans: 0, lastConventionWeek: null };
  }

  const budget = Number(studio.fanClub.weeklyBudget || 0);
  if (budget <= 0) {
    return;
  }

  const availableMoney = Number(studio.money || 0);

  if (availableMoney < budget) {
    addNotification(
      gameState,
      `Studio cannot afford weekly fan club budget of ₹${budget.toLocaleString("en-IN")}. Maintenance skipped.`
    );
    return;
  }

  // Deduct budget
  studio.money = Math.max(0, availableMoney - budget);

  // Grow fans: ₹100 yields ~1 fan on average
  const baseGrowth = budget / 100;
  const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
  const fansGained = Math.floor(baseGrowth * variance);

  if (fansGained > 0) {
    studio.fanClub.totalFans = (studio.fanClub.totalFans || 0) + fansGained;
    studio.fans = (studio.fans || 0) + fansGained;
  }
};
