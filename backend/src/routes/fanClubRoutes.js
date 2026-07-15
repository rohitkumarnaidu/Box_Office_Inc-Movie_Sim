import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateFanClubBudget, hostConvention } from "../controllers/fanClubController.js";

const router = express.Router();

router.put("/budget", protect, updateFanClubBudget);
router.post("/convention", protect, hostConvention);

export default router;
