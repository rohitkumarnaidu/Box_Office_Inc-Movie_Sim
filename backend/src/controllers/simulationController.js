import runWeeklySimulation from "../services/simulation/runWeeklySimulation.js";

export const nextWeek = async (req, res) => {
  try {
    const gameState = await runWeeklySimulation(req.user._id);

    res.status(200).json({
      success: true,
      currentWeek: gameState.currentWeek,
      notifications: gameState.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
