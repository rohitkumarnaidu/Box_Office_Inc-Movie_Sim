import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { launchPRCampaign, getPRStatus } from "../controllers/prController.js";

const router = express.Router();

router.get("/pr/status", protect, getPRStatus);
router.post("/pr/campaign", protect, launchPRCampaign);

export default router;
