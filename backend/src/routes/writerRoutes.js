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
import { validate } from "../middleware/validationMiddleware.js";
import { startWritingProjectSchema, replaceWriterSchema } from "../validators/talentValidators.js";
import { checkNegativeBalance } from "../middleware/balanceMiddleware.js";

const router = express.Router();

router.get("/", protect, getMarketWriters);

router.get("/owned", protect, getOwnedWriters);

router.get("/:writerId/profile", protect, getWriterProfile);

router.post("/hire/:index", protect, checkNegativeBalance, hireWriter);

router.post("/fire/:index", protect, fireWriter);

router.get("/projects", protect, getWritingProjects);

router.post("/start-writing", protect, validate(startWritingProjectSchema), startWritingProject);

router.post("/replace-writer", protect, validate(replaceWriterSchema), replaceWriter);

export default router;
