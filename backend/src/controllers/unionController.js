import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";
import { resolveStrike } from "../services/simulation/engines/unionEngine.js";

const findGameState = async (userId) => GameState.findOne({ user: userId });

/**
 * Settle the active crew union strike by paying the settlement fee.
 * POST /api/studios/union/settle
 */
export const settleStrike = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
    }

    const gameState = await findGameState(req.user._id);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found.",
      });
    }

    if (!gameState.crewUnion || !gameState.crewUnion.isStriking) {
      return res.status(400).json({
        success: false,
        message: "There is no active crew union strike to settle.",
      });
    }

    await resolveStrike(gameState, studio);

    res.status(200).json({
      success: true,
      message: "Strike settled successfully! Productions have resumed.",
      data: {
        isStriking: gameState.crewUnion.isStriking,
        satisfaction: gameState.crewUnion.satisfaction,
        studioMoney: studio.money,
      },
    });
  } catch (error) {
    console.error("Error settling strike:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to settle strike.",
    });
  }
};

/**
 * Get crew union status.
 * GET /api/studios/union/status
 */
export const getUnionStatus = async (req, res) => {
  try {
    const gameState = await findGameState(req.user._id);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found.",
      });
    }

    if (!gameState.crewUnion) {
      gameState.crewUnion = { satisfaction: 100, isStriking: false, strikeStartWeek: null };
      await gameState.save();
    }

    res.status(200).json({
      success: true,
      data: gameState.crewUnion,
    });
  } catch (error) {
    console.error("Error getting union status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
