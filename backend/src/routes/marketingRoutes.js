import express from "express";
import { addMarketingCampaign } from "../controllers/movieController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:id/campaign", addMarketingCampaign);

export default router;
