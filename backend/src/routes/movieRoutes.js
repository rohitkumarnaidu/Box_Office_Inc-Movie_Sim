import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createMovieSchema, releaseMovieParamsSchema } from "../validators/movieValidator.js";
import { checkNegativeBalance } from "../middleware/balanceMiddleware.js";
import {
  createMovie,
  getActiveMovies,
  getReleasedMovies,
  releaseMovie,
  getMovieDetails,
  generateTitle,
  getMovieTracking,
} from "../controllers/movieController.js";

const router = express.Router();

// FIXED: Wrapped schemas in an object containing a 'body' property
router.post("/", protect, checkNegativeBalance, validate({ body: createMovieSchema }), createMovie);
router.get("/generate-title", protect, generateTitle);
router.get("/active", protect, getActiveMovies);
router.get("/released", protect, getReleasedMovies);

// FIXED: Wrapped schemas in an object containing a 'body' property
router.post("/:id/release", protect, validate({ params: releaseMovieParamsSchema }), releaseMovie);
router.get("/:id/tracking", protect, getMovieTracking);
router.get("/:id", protect, getMovieDetails);

export default router;