import express from "express";
import {
  getMarketActors,
  getOwnedActors,
  getActorProfile,
  hireActor,
  fireActor,
} from "../controllers/actorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMarketActors);
router.get("/owned", protect, getOwnedActors);
router.get("/:id/profile", protect, getActorProfile);
router.post("/hire/:index", protect, hireActor);
router.post("/fire/:index", protect, fireActor);

export default router;
