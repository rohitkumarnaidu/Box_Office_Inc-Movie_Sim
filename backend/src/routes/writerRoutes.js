import express from "express";

import {
  getMarketWriters,
  getOwnedWriters,
  hireWriter,
  fireWriter,
  getWritingProjects,
  startWritingProject,
  replaceWriter,
} from "../controllers/writerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMarketWriters);

router.get("/owned", protect, getOwnedWriters);

router.post("/hire/:index", protect, hireWriter);

router.post("/fire/:index", protect, fireWriter);

router.get("/projects", protect, getWritingProjects);

router.post("/start-writing", protect, startWritingProject);

router.post("/replace-writer", protect, replaceWriter);

export default router;
