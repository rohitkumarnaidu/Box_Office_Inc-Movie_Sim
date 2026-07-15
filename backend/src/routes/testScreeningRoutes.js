import express from "express";
import { holdTestScreening, orderReshoots } from "../controllers/testScreeningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:id/test-screening", holdTestScreening);
router.post("/:id/reshoots", orderReshoots);

export default router;
