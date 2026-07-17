import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  negotiateContract,
  acceptContract,
  getPendingContracts,
} from "../controllers/contractController.js";

const router = express.Router();

router.get("/", protect, getPendingContracts);
router.post("/negotiate", protect, negotiateContract);
router.post("/accept", protect, acceptContract);

export default router;
