import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import { runWeeklySimulation } from "../services/simulation/runWeeklySimulation.js";

export const simulateWeek = async (req, res) => {
  try {
    const { weeks = 1 } = req.body;
    const numWeeks = Math.min(52, Math.max(1, Number(weeks)));

    const gameState = await GameState.findOne({ user: req.user._id });
    const studio = await Studio.findOne({ owner: req.user._id });

    if (!gameState || !studio) {
      return res.status(404).json({ message: "Game state or studio not found" });
    }

    const startWeek = gameState.currentWeek;
    const startFans = studio.fans || 0;
    const startPrestige = studio.prestige || 0;
    const initialNotificationCount = (gameState.notifications || []).length;

    // Run simulation multiple times
    for (let i = 0; i < numWeeks; i++) {
      const prevMoney = studio.money || 0;
      await runWeeklySimulation(gameState, studio);

      // Financial History Logging
      studio.financialHistory = studio.financialHistory || [];
      studio.financialHistory.push({
          week: ((gameState.currentWeek - 2) % 52) + 1,
          year: Math.floor((gameState.currentWeek - 2) / 52) + 1,
          revenue: Math.max(0, studio.money - prevMoney), // Simple diff for now
          expenses: Math.max(0, prevMoney - studio.money),
          payroll: 0, // Should ideally be passed from engine
          movieCosts: 0,
          marketingCosts: 0,
          profit: studio.money - prevMoney,
          balance: studio.money
      });

      // Limit history size to 100 entries for performance
      if (studio.financialHistory.length > 100) {
          studio.financialHistory.shift();
      }
    }

    await studio.save();
    await gameState.save();

    const endFans = studio.fans || 0;
    const endPrestige = studio.prestige || 0;
    const newNotifications = (gameState.notifications || []).slice(initialNotificationCount);

    // Summary data
    const summary = {
      weeksSimulated: numWeeks,
      startWeek,
      endWeek: gameState.currentWeek,
      fansGained: endFans - startFans,
      prestigeGained: endPrestige - startPrestige,
      notificationCount: newNotifications.length,
      newNotifications: newNotifications.slice(-10) // Last 10
    };

    res.status(200).json({
      message: `${numWeeks} week(s) simulated successfully`,
      currentWeek: gameState.currentWeek,
      summary
    });
  } catch (error) {
    console.error("Simulation Error:", error);
    res.status(500).json({ message: "Simulation failed" });
  }
};

export const getPastAwards = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id });
    if (!gameState) {
      return res.status(404).json({ message: "Game state not found" });
    }

    res.status(200).json({
      success: true,
      awards: gameState.pastAwards || []
    });
  } catch (error) {
    console.error("Error fetching awards:", error);
    res.status(500).json({ message: "Failed to fetch awards" });
  }
};

export const getMarketIntelligence = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id });
    if (!gameState) {
      return res.status(404).json({ message: "Game state not found" });
    }

    res.status(200).json({
      success: true,
      currentWeek: gameState.currentWeek,
      marketTrends: gameState.marketTrends || { activeTrends: [] },
      randomEvents: gameState.randomEvents?.history?.slice(-10).reverse() || []
    });
  } catch (error) {
    console.error("Error fetching market intelligence:", error);
    res.status(500).json({ message: "Failed to fetch market intelligence" });
  }
};
