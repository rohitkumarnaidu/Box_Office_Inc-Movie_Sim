import express from "express";

import {
  generateMarketScripts,
  getScripts,
  buyScript,
  getOwnedScripts,
  sellScript,
} from "../controllers/scriptController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { scriptIndexSchema } from "../validators/scriptValidator.js";
import { checkNegativeBalance } from "../middleware/balanceMiddleware.js";

const router = express.Router();

router.get("/", protect, getScripts);

router.post("/generate", protect, generateMarketScripts);
router.post("/buy/:index", protect, checkNegativeBalance, validate(scriptIndexSchema), buyScript);
router.get("/owned", protect, getOwnedScripts);
router.post("/sell/:index", protect, validate(scriptIndexSchema), sellScript);

export default router;
