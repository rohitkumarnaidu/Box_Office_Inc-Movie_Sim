import express from "express";

import {
  getMarketWriters,
  getOwnedWriters,
  getWriterProfile,
  hireWriter,
  fireWriter,
  getWritingProjects,
  startWritingProject,
  replaceWriter,
} from "../controllers/writerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { startWritingProjectSchema, replaceWriterSchema } from "../validators/talentValidators.js";

const router = express.Router();

router.get("/", protect, getMarketWriters);

router.get("/owned", protect, getOwnedWriters);

router.get("/:writerId/profile", protect, getWriterProfile);

router.post("/hire/:index", protect, hireWriter);

router.post("/fire/:index", protect, fireWriter);

router.get("/projects", protect, getWritingProjects);

router.post("/start-writing", protect, validateRequest(startWritingProjectSchema), startWritingProject);

router.post("/replace-writer", protect, validateRequest(replaceWriterSchema), replaceWriter);

export default router;
