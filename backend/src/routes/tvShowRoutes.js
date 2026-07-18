import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createTVShowSchema, getTVShowByIdSchema } from "../validators/tvShowValidators.js";
import {
  getTVShows,
  getTVShowById,
  createTVShow,
} from "../controllers/tvShowController.js";

const router = express.Router();

router.get("/", protect, getTVShows);
router.post("/", protect, validate(createTVShowSchema), createTVShow);
router.get("/:id", protect, validate(getTVShowByIdSchema), getTVShowById);

export default router;
