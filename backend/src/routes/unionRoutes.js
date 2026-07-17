import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUnionStatus, settleStrike } from "../controllers/unionController.js";

const router = express.Router();

router.get("/status", protect, getUnionStatus);
router.post("/settle", protect, settleStrike);

export default router;
