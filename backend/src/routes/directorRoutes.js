import express from "express";

import {
  getMarketDirectors,
  getOwnedDirectors,
  getDirectingProjects,
  getDirectorProfile,
  startDirectingProject,
  hireDirector,
  fireDirector,
  replaceDirector,
} from "../controllers/directorController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { startDirectingProjectSchema, replaceDirectorSchema } from "../validators/talentValidators.js";

const router = express.Router();

router.get("/", protect, getMarketDirectors);

router.get("/owned", protect, getOwnedDirectors);

router.get("/projects", protect, getDirectingProjects);

router.get("/:id", protect, getDirectorProfile);

router.post("/hire/:index", protect, hireDirector);

router.post("/fire/:index", protect, fireDirector);

router.post("/start-directing", protect, validateRequest(startDirectingProjectSchema), startDirectingProject);

router.post("/replace-director", protect, validateRequest(replaceDirectorSchema), replaceDirector);

export default router;
