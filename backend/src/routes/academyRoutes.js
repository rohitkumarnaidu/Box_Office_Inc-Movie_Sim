import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { trainTalent } from "../controllers/academyController.js";

const router = express.Router();

router.use(protect);

router.post("/train", trainTalent);

export default router;
