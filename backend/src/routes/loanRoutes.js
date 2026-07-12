import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { takeLoanSchema } from "../validators/loanValidators.js";
import { takeLoan, getLoans } from "../controllers/loanController.js";

const router = express.Router();

router.get("/", protect, getLoans);
router.post("/take", protect, validate(takeLoanSchema), takeLoan);

export default router;
