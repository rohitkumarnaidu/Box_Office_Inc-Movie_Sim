import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  negotiateContract,
  acceptContract,
  getPendingContracts,
  buyoutContract,
} from "../controllers/contractController.js";
import {
  validateContractNegotiationSchema,
  validateContractBuyoutSchema,
} from "../validators/contractValidators.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", protect, getPendingContracts);
router.post("/negotiate", protect, validate(validateContractNegotiationSchema), negotiateContract);
router.post("/accept", protect, acceptContract);
router.post("/buyout", protect, validate(validateContractBuyoutSchema), buyoutContract);

export default router;
