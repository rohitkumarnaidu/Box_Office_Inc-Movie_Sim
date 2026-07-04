import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createMovieSchema, releaseMovieSchema } from "../validators/movieValidator.js";
import { checkNegativeBalance } from "../middleware/balanceMiddleware.js";
import {
  createMovie,
  getActiveMovies,
  getReleasedMovies,
  releaseMovie,
  getMovieDetails,
  generateTitle,
} from "../controllers/movieController.js";


const router = express.Router();

router.post("/", protect, checkNegativeBalance, validate(createMovieSchema), createMovie);
router.get("/generate-title", protect, generateTitle);
router.get("/active", protect, getActiveMovies);
router.get("/released", protect, getReleasedMovies);
router.post("/:id/release", protect, validate(releaseMovieSchema), releaseMovie);
router.get("/:id", protect, getMovieDetails);

export default router;
