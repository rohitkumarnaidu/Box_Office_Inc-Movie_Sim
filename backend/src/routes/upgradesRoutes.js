import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUpgrades, buyUpgrade } from "../controllers/upgradesController.js";

const router = express.Router();

router.use(protect);

router.get("/", getUpgrades);
router.post("/buy", buyUpgrade);

export default router;
