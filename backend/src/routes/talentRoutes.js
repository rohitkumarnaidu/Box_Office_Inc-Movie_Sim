import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getChemistryRecords } from "../services/simulation/engines/chemistryEngine.js";
import GameState from "../models/GameState.js";

const router = express.Router();

/**
 * GET /api/talent/chemistry
 * Returns all chemistry records for the authenticated user's game state.
 */
router.get("/chemistry", protect, async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id }).select("_id").lean();
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    const records = await getChemistryRecords(gameState._id);
    res.status(200).json({ success: true, chemistry: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
