import express from "express";
import { getMerchandiseStats, boostMerchandiseLevel } from "../controllers/merchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMerchandiseStats);
router.post("/boost/:movieId", boostMerchandiseLevel);

export default router;
