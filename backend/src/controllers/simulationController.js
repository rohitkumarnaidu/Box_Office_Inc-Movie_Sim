import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import { runWeeklySimulation } from "../services/simulation/runWeeklySimulation.js";
import Notification from "../models/Notification.js";

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

    // Accumulate notifications generated during the simulation ticks
    let newNotifications = [];

    // Accumulate rival releases across all simulated weeks
    const allRivalReleases = [];

    // Run simulation multiple times
    for (let i = 0; i < numWeeks; i++) {
      const prevMoney = studio.money || 0;
      const weekRivalReleases = await runWeeklySimulation(gameState, studio);
      allRivalReleases.push(...(weekRivalReleases || []));

      // Financial History Logging
      studio.financialHistory = studio.financialHistory || [];
      studio.financialHistory.push({
          week: ((gameState.currentWeek - 2) % 52) + 1,
          year: Math.floor((gameState.currentWeek - 2) / 52) + 1,
          revenue: Math.max(0, studio.money - prevMoney),
          expenses: Math.max(0, prevMoney - studio.money),
          payroll: 0,
          movieCosts: 0,
          marketingCosts: 0,
          profit: studio.money - prevMoney,
          balance: studio.money
      });

      // Limit history size to 100 entries for performance
      if (studio.financialHistory.length > 100) {
          studio.financialHistory.shift();
      }
      if (gameState._pendingNotifications && gameState._pendingNotifications.length > 0) {
        newNotifications.push(...gameState._pendingNotifications);
        gameState._pendingNotifications = [];
      }
    }

    if (newNotifications.length > 0) {
      const inserted = await Notification.insertMany(newNotifications);
      // Replace with DB records to get the assigned _ids, though not strictly necessary for the summary
      newNotifications = inserted;
    }

    await studio.save();
    await gameState.save();

    const endFans = studio.fans || 0;
    const endPrestige = studio.prestige || 0;

    // Summary data — include rival releases for the frontend modal
    const summary = {
      weeksSimulated: numWeeks,
      startWeek,
      endWeek: gameState.currentWeek,
      fansGained: endFans - startFans,
      prestigeGained: endPrestige - startPrestige,
      notificationCount: newNotifications.length,
      newNotifications: newNotifications.slice(-10), // Last 10
      rivalReleases: allRivalReleases.slice(-8),      // Last 8 rival releases
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

