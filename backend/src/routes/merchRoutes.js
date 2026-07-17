import express from "express";
import { z } from "zod";
import { getMerchandiseStats, boostMerchandiseLevel } from "../controllers/merchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const boostMerchSchema = {
  params: z.object({
    movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Movie ID format"),
  }),
};

const router = express.Router();

router.use(protect);

router.get("/", getMerchandiseStats);
router.post("/boost/:movieId", validate(boostMerchSchema), boostMerchandiseLevel);

export default router;
