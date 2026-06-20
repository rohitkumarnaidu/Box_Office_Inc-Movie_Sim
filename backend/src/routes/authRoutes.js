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
import { validateRequest } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), login);

router.post("/refresh", refreshSession);

router.post("/logout", logout);

router.get("/diagnostics", protect, getAuthDiagnostics);

router.get("/me", protect, getMe);

export default router;
