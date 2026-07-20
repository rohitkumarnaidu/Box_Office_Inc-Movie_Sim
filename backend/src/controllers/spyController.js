import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import { SPY_COST } from "../constants/gameConstants.js";
import mongoose from "mongoose";

export const getSpyReport = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rivalId } = req.params;

    const studio = await Studio.findOne({ owner: req.user._id }).session(session);
    if (!studio) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    if (studio.money < SPY_COST) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Insufficient funds to buy this report" });
    }

    const gameState = await GameState.findOne({ user: req.user._id }).session(session);
    if (!gameState) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Game state not found" });
    }

    const rival = gameState.rivalStudios.find((r) => r.id === rivalId);
    if (!rival) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Rival studio not found" });
    }

    // Deduct cost
    studio.money -= SPY_COST;
    await studio.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Espionage report purchased for "${rival.name}"!`,
      rival,
      studioMoney: studio.money,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
