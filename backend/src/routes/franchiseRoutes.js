import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getFranchises,
  getFranchiseById,
  createFranchise,
} from "../controllers/franchiseController.js";

const router = express.Router();

router.get("/", protect, getFranchises);
router.post("/", protect, createFranchise);
router.get("/:id", protect, getFranchiseById);

export default router;
