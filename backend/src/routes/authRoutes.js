import express from "express";

import {
  register,
  login,
  refreshSession,
  logout,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refreshSession);

router.post("/logout", logout);

router.get("/me", protect, getMe);

export default router;
