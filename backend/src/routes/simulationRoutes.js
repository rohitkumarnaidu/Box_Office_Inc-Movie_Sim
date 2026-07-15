import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { simulateWeek, getPastAwards, getMarketIntelligence, resetGame } from "../controllers/simulationController.js";

const router = express.Router();

router.post("/next-week", protect, simulateWeek);
router.get("/awards", protect, getPastAwards);
router.get("/market-intelligence", protect, getMarketIntelligence);
router.post("/reset", protect, resetGame);

export default router;
