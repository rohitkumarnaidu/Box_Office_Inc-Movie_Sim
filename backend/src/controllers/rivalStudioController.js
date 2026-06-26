import GameState from "../models/GameState.js";

/**
 * GET /api/rival-studios
 * Returns the current user's rival studios from their GameState.
 */
export const getRivalStudios = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id }).select(
      "rivalStudios rivalStudiosInitialized currentWeek"
    );

    if (!gameState) {
      return res.status(404).json({ message: "Game state not found" });
    }

    return res.status(200).json({
      rivalStudios: gameState.rivalStudios || [],
      initialized: gameState.rivalStudiosInitialized || false,
      currentWeek: gameState.currentWeek || 1,
    });
  } catch (error) {
    console.error("getRivalStudios error:", error);
    return res.status(500).json({ message: "Failed to fetch rival studios" });
  }
};
