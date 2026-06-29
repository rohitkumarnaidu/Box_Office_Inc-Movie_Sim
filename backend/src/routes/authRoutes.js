import express from "express";

import {
  register,
  login,
  refreshSession,
  logout,
  getMe,
  getAuthDiagnostics,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshSession);

router.post("/logout", logout);

router.get("/diagnostics", protect, getAuthDiagnostics);

router.get("/me", protect, getMe);

export default router;
