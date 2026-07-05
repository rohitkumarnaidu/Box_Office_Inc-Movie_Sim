import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createMovieSchema, releaseMovieSchema } from "../validators/movieValidator.js";
import { submitToFestival, acceptDistributionDeal } from "../controllers/festivalController.js";
import {
  createMovie,
  getActiveMovies,
  getReleasedMovies,
  releaseMovie,
  getMovieDetails,
  generateTitle,
} from "../controllers/movieController.js";


const router = express.Router();

router.post("/", protect, validate(createMovieSchema), createMovie);
router.get("/generate-title", protect, generateTitle);
router.get("/active", protect, getActiveMovies);
router.get("/released", protect, getReleasedMovies);
router.post("/:id/release", protect, validate(releaseMovieSchema), releaseMovie);
router.post("/:id/schedule", protect, scheduleRelease);
router.post("/:id/festivals/submit", protect, submitToFestival);
router.post("/:id/festivals/deal/accept", protect, acceptDistributionDeal);
router.get("/:id/tracking", protect, getMovieTracking);
router.post("/:id/home-media", protect, setHomeMedia);
router.get("/:id", protect, getMovieDetails);

export default router;
