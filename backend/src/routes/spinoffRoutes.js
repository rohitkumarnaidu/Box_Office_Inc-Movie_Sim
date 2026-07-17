import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createSpinoff, createCrossover } from "../controllers/spinoffController.js";

const router = express.Router();

// Create a spin-off franchise from an existing one
router.post("/:id/spinoff", protect, createSpinoff);

// Create a crossover franchise from two existing ones
router.post("/crossover", protect, createCrossover);

export default router;
