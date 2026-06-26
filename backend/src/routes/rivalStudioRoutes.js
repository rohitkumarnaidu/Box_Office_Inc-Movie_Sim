import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { getRivalStudios } from "../controllers/rivalStudioController.js";

const router = express.Router();

router.get("/", protect, getRivalStudios);

export default router;
