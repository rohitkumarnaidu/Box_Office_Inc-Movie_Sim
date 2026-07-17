import express from "express";
import { addMarketingCampaign } from "../controllers/movieController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { addMarketingCampaignSchema } from "../validators/movieValidator.js";

const router = express.Router();

router.use(protect);

router.post("/:id/campaign", validate(addMarketingCampaignSchema), addMarketingCampaign);

export default router;
