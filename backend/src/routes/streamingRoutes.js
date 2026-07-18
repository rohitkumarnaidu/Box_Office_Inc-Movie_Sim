import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { acceptStreamingDealSchema } from "../validators/streamingValidators.js";
import {
  getPlatforms,
  acceptStreamingDeal,
} from "../controllers/streamingController.js";

const router = express.Router();

router.get("/platforms", protect, getPlatforms);
router.post("/movies/:movieId/accept-deal", protect, validate(acceptStreamingDealSchema), acceptStreamingDeal);

export default router;
