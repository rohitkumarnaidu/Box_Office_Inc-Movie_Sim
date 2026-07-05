import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";

export const getSpyReport = async (req, res) => {
  try {
    const { rivalId } = req.params;
    const SPY_COST = 100000; // ₹100,000

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    if (studio.money < SPY_COST) {
      return res.status(400).json({ success: false, message: "Insufficient funds to buy this report" });
    }

    const gameState = await GameState.findOne({ user: req.user._id });
    if (!gameState) {
      return res.status(404).json({ success: false, message: "Game state not found" });
    }

    const rival = gameState.rivalStudios.find((r) => r.id === rivalId);
    if (!rival) {
      return res.status(404).json({ success: false, message: "Rival studio not found" });
    }

    // Deduct cost
    studio.money -= SPY_COST;
    await studio.save();

    res.status(200).json({
      success: true,
      message: `Espionage report purchased for "${rival.name}"!`,
      rival,
      studioMoney: studio.money,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
