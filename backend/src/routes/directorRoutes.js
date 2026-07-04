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
import { validate } from "../middleware/validationMiddleware.js";
import { startDirectingProjectSchema, replaceDirectorSchema } from "../validators/talentValidators.js";
import { checkNegativeBalance } from "../middleware/balanceMiddleware.js";

const router = express.Router();

router.get("/", protect, getMarketDirectors);

router.get("/owned", protect, getOwnedDirectors);

router.get("/projects", protect, getDirectingProjects);

router.get("/:id", protect, getDirectorProfile);

router.post("/hire/:index", protect, checkNegativeBalance, hireDirector);

router.post("/fire/:index", protect, fireDirector);

router.post("/start-directing", protect, validate(startDirectingProjectSchema), startDirectingProject);

router.post("/replace-director", protect, validate(replaceDirectorSchema), replaceDirector);

export default router;
