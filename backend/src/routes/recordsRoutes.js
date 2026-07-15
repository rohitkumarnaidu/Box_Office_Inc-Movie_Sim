import express from "express";
import { getHistoricRecords } from "../controllers/recordsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getHistoricRecords);

export default router;
