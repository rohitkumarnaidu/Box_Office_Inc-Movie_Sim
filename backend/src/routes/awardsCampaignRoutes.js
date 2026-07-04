import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { startAwardsCampaign } from "../controllers/awardsCampaignController.js";

const router = express.Router();

router.use(protect);

router.post("/lobby", startAwardsCampaign);

export default router;
