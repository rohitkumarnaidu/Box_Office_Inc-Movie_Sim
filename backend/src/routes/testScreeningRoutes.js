import express from "express";
import { holdTestScreening, orderReshoots } from "../controllers/testScreeningController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/:id/test-screening", holdTestScreening);
router.post("/:id/reshoots", orderReshoots);

export default router;
