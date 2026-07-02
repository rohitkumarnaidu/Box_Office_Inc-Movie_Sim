import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSpyReport } from "../controllers/spyController.js";

const router = express.Router();

router.use(protect);

router.post("/:rivalId", getSpyReport);

export default router;
