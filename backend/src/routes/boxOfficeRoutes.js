/**
 * @fileoverview Box Office Routes
 * 
 * Express routing definitions for Box Office Telemetry and Analytics API endpoints.
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getBoxOfficeAnalytics, getRegionalSummary } from "../controllers/boxOfficeController.js";

const router = express.Router();

router.use(protect);

router.get("/analytics/:movieId", getBoxOfficeAnalytics);
router.get("/regional-summary", getRegionalSummary);

export default router;
