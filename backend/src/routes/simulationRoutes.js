import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { nextWeek } from "../controllers/simulationController.js";

const router = express.Router();

router.post("/next-week", protect, nextWeek);

export default router;
