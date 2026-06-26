import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPlatforms,
  acceptStreamingDeal,
} from "../controllers/streamingController.js";

const router = express.Router();

router.get("/platforms", protect, getPlatforms);
router.post("/movies/:movieId/accept-deal", protect, acceptStreamingDeal);

export default router;
